import queryString from 'query-string';
import {render, elems} from '../utils/Renderer';
import {ImageGallery} from '../components/image_gallery_view';
import {GalleryNavThumbs} from '../components/image_gallery_nav';
import {AddProductForm} from '../components/add_product_form';
import {Store} from '../utils/Store';
import {smoothFade} from '../utils/utils';
import {renderMiniCart} from '../components/mini_cart';

import {addItemsToCart, getProductData, getProductJSON} from '../utils/api';

const {Root, Div} = elems;

const classes = {
  showGalleryActions: 'show-gallery-actions',
  productGalleryDisplay: 'product__content__upper__gallery__display',
  productGalleryThumbs: 'product__content__upper__gallery__thumbs',
};

const getElements = {
  galleryWrapper: () => document.querySelector('[data-product-image-gallery]'),
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
  const urlVariantId = query && query.variant && parseInt(query.variant, 10);

  const product = await getProductData(productHandle);
  // Second call is needed to get array of image objects rather than just urls.
  // The image.alt values are used for colour filtering in the gallery.
  const imageObjs = (await getProductJSON(productHandle)).images;
  // If multiple variants default to null so that add to cart button will be disabled.
  // Will get overridden if there was a variant supplied in the query string.
  // If only one variant then this is effectively no variants - as Shopify creates a default.
  // Only variant IDs can be added to the cart - not product IDs.
  const initialVariantId = product.variants.length > 1 ? null : product.variants[0].id;

  // Create the state.
  const productState = Store(product, `product-${product.id}`);

  // Add the variant and default selected options to empty array.
  // Remove any default variants / options and just set empty arrays.
  productState.setState({
    currentVariantId: urlVariantId || initialVariantId,
    currentQuantity: 1,
    variantRequired: product.variants.length > 1,
    images: imageObjs,
    error: null,
    addedToCart: null,
  });

  // If variant in the querystring then add correct selected options to state.
  if (urlVariantId) {
    // Find the correct variant and parse its title attribute to get all the selected options.
    // Format of variant.title is "option1Value / option2Value / option3Value" - there is a space either side of the slash.
    const variantTitle = productState.getState().variants.find((variant) => urlVariantId === variant.id).title;
    const selectedValues = variantTitle.trim().split('/');
    // Check which options these values are from, and add an attribute on product state for each one - prefixed with 'selected'.
    const selectedOptions = selectedValues.reduce((acum, nextValue) => {
      const option = product.options.find((opt) => opt.values.includes(nextValue));
      acum[option.name] = nextValue;
      return acum;
    }, {});

    productState.setState({...selectedOptions});
  } else {
    // Loop through all the options and add an attribute on product state for each one.
    const selectedOptions = product.options.reduce((acum, next) => {
      acum[next.name] = null;
      return acum;
    }, {});

    productState.setState({...selectedOptions});
  }

  function onOptionSelect(optionName, optionValue) {
    productState.setState({[optionName]: optionValue, error: null});

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

      productState.setState({currentVariantId: newVariantId, error: null, addedToCart: null});

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
    const {currentQuantity: quantity, currentVariantId: id} = productState.getState();
    // API call.
    const res = await addItemsToCart({id, quantity});
    if (res.message === 'Cart Error') {
      productState.setState({error: res.description});
    } else {
      productState.setState({error: null, addedToCart: true});
      renderMiniCart();
    }
  }

  initProductForm(productState, onQuantityUpdate, onOptionSelect, onSubmit);

  // Gallery.
  function constructGallery(state) {
    const colourSelected = state.Colour;
    const images = colourSelected
      ? imageObjs.filter((img) => (!img.alt || img.alt === colourSelected))
      : imageObjs;
    initGallery(images);
  }

  constructGallery(productState.getState());

  // If colour is an option the user can select.
  // Then re-render the gallery whenever user selects a different colour.
  if (product.options.some((option) => option.name === 'Colour')) {
    productState.onAttributeUpdate((newState) => {
      const imgGalleryElem = getElements.imageGallery();
      // Remove event listeners that will refer to the old instance of the image gallery.
      smoothFade([1, 0], imgGalleryElem, 100, [0.47, 0, 0.745, 0.715], () => {
        while (imgGalleryElem.firstChild) {
          imgGalleryElem.removeChild(imgGalleryElem.firstChild);
        }
        constructGallery(newState);
        smoothFade([0, 1], imgGalleryElem, 300, []);
      });
    }, 'Colour');
  }
}

// Gallery.
function initGallery(images) {

  const galleryState = Store({curIndex: 0}, 'product-gallery');

  const rootElem = getElements.galleryWrapper();

  function handleMouseEnter() {
    if (galleryState.getState().getActionsElem) {
      galleryState.getState().getActionsElem().classList.add(classes.showGalleryActions);
    }
  }

  function handleMouseLeave() {
    if (galleryState.getState().getActionsElem) {
      galleryState.getState().getActionsElem().classList.remove(classes.showGalleryActions);
    }
  }

  function renderImageGallery(imageGalleryContainer) {
    const {getActionsElem} = ImageGallery(imageGalleryContainer, images, galleryState, 0);
    galleryState.setState({getActionsElem});
  }

  render([
    Root, {rootElem}, [
      [Div, {
        className: classes.productGalleryDisplay,
        postMountCallbacks: [
          (self) => renderImageGallery(self),
        ],
      }],
      [Div, {
        className: classes.productGalleryThumbs,
        postMountCallbacks: [
          (self) => GalleryNavThumbs(self, images, galleryState, '200x', 0),
        ],
      }],
    ],
  ]);

  rootElem.addEventListener('mouseenter', handleMouseEnter);
  rootElem.addEventListener('mouseleave', handleMouseLeave);
}

// Add product to cart form.
function initProductForm(productState, onQuantityUpdate, onOptionSelect, onSubmit) {
  const formWrapper = getElements.addFormWrapper();
  const addProductForm = AddProductForm(productState, onQuantityUpdate, onOptionSelect, onSubmit);

  render([Root, {rootElem: formWrapper}, [addProductForm.view()]]);
}

initProductPage();
