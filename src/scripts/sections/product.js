import queryString from 'query-string';
import {render, elems} from '../utils/Renderer';
import {ImageGallery} from '../components/image_gallery_view';
import {GalleryNavThumbs} from '../components/image_gallery_nav';
import {AddProductForm} from '../components/add_product_form';
import {Store} from '../utils/Store';

import {addItemsToCart, getProductData} from '../utils/api';

const {Root} = elems;

const getElements = {
  imageGallery: () => document.querySelector('[data-product-image-gallery]'),
  addFormWrapper: () => document.querySelector('[data-product-add-form]'),
  addProductForm: () => document.querySelector('[data-product-form]'),
};

// Must be cdn.shopify.com/s/files/1/0168/1113/0934/products/W_3985{_dimension}.jpg?v=1563988014.
// const galleryImageSize = '_850x850';
// const thumbnailImageSize = '_140x140';

async function initProductPage() {
  const urlparts = window.location.pathname.split('/');
  const productHandle = urlparts[urlparts.length - 1].split('?')[0];
  const query = queryString.parse(window.location.search);
  const variantId = query && query.variant && parseInt(query.variant, 10);

  const product = await getProductData(productHandle);

  // Create the state.
  const productState = Store(product, `product-${product.id}`);

  // Add the variant and default selected options to empty array.
  productState.setState({
    currentVariantId: variantId,
    currentQuantity: 1,
    variantRequired: product.variants.length > 1,
  });

  // If variant in the querystring then add correct selected options to state.
  if (variantId) {
    // Find the correct variant and parse its title attribute to get all the selected options.
    // Format of variant.title is "option1Value / option2Value / option3Value" - there is a space either side of the slash.
    const variantTitle = productState.getState().variants.find((variant) => variantId === variant.id).title;
    const selectedValues = variantTitle.trim().split('/');
    // Check which options these values are from, and add an attribute on product state for each one - prefixed with 'selected'.
    const selectedOptions = selectedValues.reduce((acum, nextValue) => {
      const option = product.options.find((opt) => opt.values.includes(nextValue));
      acum[option.name] = nextValue;
      return acum;
    }, {});

    productState.setState({...selectedOptions});
  } else {
    // Loop through all the options and add an attribute on product state for each one - prefixed with 'selected'.
    const selectedOptions = product.options.reduce((acum, next) => {
      acum[next.name] = null;
      return acum;
    }, {});

    productState.setState({...selectedOptions});
  }

  // initGallery(productState);

  function onOptionSelect(optionName, optionValue) {
    productState.setState({[optionName]: optionValue});

    const updatedState = productState.getState();
    const allSelected = updatedState.options.every((option) => updatedState[option.name]);

    if (allSelected) {
      // Check if all required options are selected.
      // If they are then update the currentVariantId in state and push url to history object.
      // Form the variant.title as per Shopify data.
      const variantTitle = updatedState.options.reduce((title, option, index) => {
        return index === 0
          ? updatedState[option.name]
          : [title, updatedState[option.name]].join(' / ');
      }, '');

      const newVariantId = updatedState.variants.find((variant) => variant.title === variantTitle).id;

      productState.setState({currentVariantId: newVariantId});

      const url = window.location.pathname.split('?')[0];
      const qs = queryString.stringify({variant: newVariantId});
      const newUrl = `${url}?${qs}`;
      window.history.pushState({path: newUrl}, '', newUrl);
    }
  }

  function onQuantityUpdate(newValue) {
    productState.setState({currentQuantity: newValue});
  }

  async function onSubmit() {
    console.log('submitting form');
    const {currentQuantity, currentVariantId} = productState.getState();
    await addItemsToCart({id: currentVariantId, quantity: currentQuantity});
    console.log('show confirm or errors');
  }

  initProductForm(productState, onQuantityUpdate, onOptionSelect, onSubmit);
}

initProductPage();


// Gallery.
function initGallery(productState, imageUrlArray = []) {
  const imageGallery = ImageGallery(imageUrlArray);
  const galleryNavThumbs = GalleryNavThumbs(imageUrlArray, updateDisplayImage);

  function updateDisplayImage(index) {
    // Check if index is in range.
    if (index < 0 || index > imageUrlArray.length - 1) {
      console.error('The index you are trying to set is not in range of the imageUrlArray');
    }
    imageGallery.updateMainImage(index);
  }

  render([
    Root, {rootElem: getElements.imageGallery()}, [
      galleryNavThumbs.view(),
      imageGallery.view(),
    ],
  ]);
}

// Add product form.
function initProductForm(productState, onQuantityUpdate, onOptionSelect, onSubmit) {
  const formWrapper = getElements.addFormWrapper();
  const addProductForm = AddProductForm(productState, onQuantityUpdate, onOptionSelect, onSubmit);

  render([Root, {rootElem: formWrapper}, [addProductForm.view()]]);
}
