/**
 * Product Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Product template.
 *
 * @namespace product
 */

import {getUrlWithVariant, ProductForm} from '@shopify/theme-product-form';
import {formatMoney} from '@shopify/theme-currency';
import {register} from '@shopify/theme-sections';

import {addItemsToCart} from '../utils/api';

import {renderMiniCart} from '../components/mini_cart';

const classes = {
  hidden: 'hidden',
  active: 'active',
  flashOnce: 'flash-once',
  galleryItem: 'product-single__images__gallery__item',
  galleryItemImage: 'product-single__images__gallery__item__image',
  galleryNavItem: 'product-single__images__gallery__nav__item',
  galleryNavItemImage: 'product-single__images__gallery__nav__item__image',
};

const colourChangeOptions = ['Green', 'Red', 'Blue', 'Black'];

const attributes = {
  galleryItemData: 'data-product-gallery-item',
  galleryNavItemData: 'data-product-gallery-nav-item',
};

const selectors = {
  addProductForm: '[data-product-form]',
  productQuantityInput: '[data-product-quantity-input]',
  miniCartContent: '[data-cart-mini-content]',
  miniCartQty: '[data-cart-mini-qty]',
  miniCartToggle: '[data-cart-mini-toggle]',
  submitButton: '[data-submit-button]',
  submitButtonText: '[data-submit-button-text]',
  comparePrice: '[data-compare-price]',
  comparePriceText: '[data-compare-text]',
  productForm: '[data-product-form]',
  productPrice: '[data-product-price]',
  imagesElem: '[data-images-elem]',
  galleryElem: '[data-gallery]',
  galleryNavElem: '[data-nav]',
  increaseQtyIcon: '[data-increment-product-qty]',
  decreaseQtyIcon: '[data-decrement-product-qty]',
};

let flickityGallery = null;
let flickityNav = null;

// Must be cdn.shopify.com/s/files/1/0168/1113/0934/products/W_3985{_dimension}.jpg?v=1563988014.
const galleryImageSize = '_850x850';
const thumbnailImageSize = '_140x140';

const imagesElem = document.querySelector(selectors.imagesElem);
const galleryElem = document.querySelector(selectors.galleryElem);
const galleryNavElem = document.querySelector(selectors.galleryNavElem);

let currentVariant = null;

register('product', {
  async onLoad() {
    const productFormElement = document.querySelector(selectors.productForm);
    const productHandle = productFormElement.dataset.productHandle;
    this.product = await this.getProductJson(productHandle);
    this.productImages = (await this.getProductImages(productHandle)).product.images;

    // Get the initial variant from the dataSet item passed by the gallery element.
    const initialVariantId = galleryElem.dataset.currentVariantId;
    if (this.product.variants) {
      currentVariant = this.product.variants.find((variant) => variant.id === parseInt(initialVariantId, 10));
    }

    this.productForm = new ProductForm(productFormElement, this.product, {
      onOptionChange: this.onFormOptionChange.bind(this),
    });

    this.initGallery();
    this.initListeners();
  },

  initListeners() {
    // Quantity increment / decrement functionality.
    const inputElem = document.querySelector(selectors.productQuantityInput);

    document.querySelector(selectors.increaseQtyIcon).addEventListener('click', () => {
      const newValue = parseInt(inputElem.value, 10) + 1;
      inputElem.setAttribute('value', newValue);
      this.updateQuantity(currentVariant, newValue);
    });
    document.querySelector(selectors.decreaseQtyIcon).addEventListener('click', () => {
      if (parseInt(inputElem.value, 10) <= 1) {
        return;
      }
      const newValue = parseInt(inputElem.value, 10) - 1;
      inputElem.setAttribute('value', newValue);
      this.updateQuantity(currentVariant, newValue);
    });

    // Ajax add to cart functionality.
    document.querySelector(selectors.addProductForm).addEventListener('submit', async (event) => {
      event.preventDefault();
      // Get the quantity.
      const quantity = document.querySelector(selectors.productQuantityInput).value;
      // Get the variant id;
      const id = currentVariant && currentVariant.id;
      // Fetch request to post /cart/add.js
      if (quantity > 0 && id) {
        const addData = {id, quantity};
        try {
          await addItemsToCart(addData);
          await renderMiniCart();

          // Open mini cart after a short pause. Allow time for the add to cart button to change.
          setTimeout(() => {
            const miniCartQtyElem = document.querySelector(selectors.miniCartQty);
            const prevCartQty = parseInt(miniCartQtyElem.textContent, 10);
            miniCartQtyElem.textContent = prevCartQty + parseInt(quantity, 10);
            document.querySelector(selectors.miniCartContent).classList.add(classes.active);
          }, 100);

          // Not complete!!!!!!!!!!! Need to change the add to cart button to 'added (tick)'. Plus disable the button.
          // Then after a couple of seconds switch it back.
        } catch (err) {
          // Need to handle errors such as when there is not enough stock vs how many they are adding - or whatever.
          console.log(err);
        }
      }
    });
  },

  initGallery() {
    // Get the relevant images.
    const imagesToDisplay = this.filterImagesByColour(currentVariant.title);

    this.createGalleryNodes(imagesToDisplay);
    this.createThumbnailNodes(imagesToDisplay);

    // Trying to avoid any FOUC. Needs testing for effectiveness.
    imagesElem.classList.remove(classes.hidden);

    this.initFlickity();
  },

  filterImagesByColour(colour) {
    // Hacky - currently using image alt in Shopify BE to define the colour!!
    return this.productImages.filter((image) => image.alt && image.alt.toLowerCase() === colour.toLowerCase());
  },

  removeAllChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },

  createGalleryNodes(imagesToDisplay) {
    // For each image object. Create a div and an img and append to gallery.
    imagesToDisplay.forEach((image) => {
      const div = document.createElement('DIV');
      div.setAttribute(attributes.galleryItemData, '');
      div.className = classes.galleryItem;
      const img = document.createElement('IMG');
      img.className = classes.galleryItemImage;
      img.src = image.src.replace('.jpg', `${galleryImageSize}.jpg`);
      img.alt = `${this.product.title} - ${image.alt}`;
      div.appendChild(img);
      galleryElem.appendChild(div);
    });
  },

  createThumbnailNodes(imagesToDisplay) {
    // For each image object. Create a div and an img and append to nav.
    imagesToDisplay.forEach((image) => {
      const div = document.createElement('DIV');
      div.setAttribute(attributes.galleryNavItemData, '');
      div.className = classes.galleryNavItem;
      const img = document.createElement('IMG');
      img.className = classes.galleryNavItemImage;
      img.src = image.src.replace('.jpg', `${thumbnailImageSize}.jpg`);
      img.alt = `${this.product.title} - ${image.alt}`;
      div.appendChild(img);
      galleryNavElem.appendChild(div);
    });
  },

  destroyFlickity() {
    if (flickityGallery) {
      flickityGallery.destroy();
    }
    if (flickityNav) {
      flickityNav.destroy();
    }
  },

  initFlickity() {
    flickityGallery = new Flickity(galleryElem, {
      wrapAround: true,
      percentPosition: false,
      setGallerySize: false,
      ImagesLoaded: true,
      pageDots: false,
    });
    flickityNav = new Flickity(galleryNavElem, {
      asNavFor: galleryElem,
      contain: true,
      pageDots: false,
      prevNextButtons: false,
      percentPosition: false,
      ImagesLoaded: true,
      setGallerySize: false,
    });
  },

  onUnload() {
    this.productForm.destroy();
  },

  getProductJson(handle) {
    return fetch(`/products/${handle}.js`).then((response) => {
      return response.json();
    });
  },

  getProductImages(handle) {
    return fetch(`/products/${handle}/images.json`).then((response) => {
      return response.json();
    });
  },

  onFormOptionChange(event) {
    currentVariant = event.dataset.variant;

    // Update the gallery for colour changes only.
    if (colourChangeOptions.includes(currentVariant.title)) {
      // Get the relevant images.
      const imagesToDisplay = this.filterImagesByColour(currentVariant.title);

      // Remove flickity.
      this.destroyFlickity();

      // Remove all previous image nodes.
      this.removeAllChildren(galleryElem);
      this.removeAllChildren(galleryNavElem);

      // Recreate the new nodes.
      this.createGalleryNodes(imagesToDisplay);
      this.createThumbnailNodes(imagesToDisplay);

      // Restart flickity.
      this.initFlickity();
    }

    // Get current quantity.
    const qty = parseInt(document.querySelector(selectors.productQuantityInput).value, 10);
    this.updateQuantity(currentVariant, qty);

    this.renderSubmitButton(currentVariant);
    this.updateBrowserHistory(currentVariant);
  },

  updateQuantity(variant, qty) {
    this.renderPrice(variant, qty);
    this.renderComparePrice(variant, qty);
  },

  renderSubmitButton(variant) {
    const submitButton = this.container.querySelector(selectors.submitButton);
    const submitButtonText = this.container.querySelector(
      selectors.submitButtonText,
    );

    if (!variant) {
      submitButton.disabled = true;
      submitButtonText.innerText = theme.strings.unavailable;
    } else if (variant.available) {
      submitButton.disabled = false;
      submitButtonText.innerText = theme.strings.addToCart;
    } else {
      submitButton.disabled = true;
      submitButtonText.innerText = theme.strings.soldOut;
    }
  },

  renderPrice(variant, qty) {
    const priceElement = document.querySelector(selectors.productPrice);
    if (variant) {
      priceElement.innerText = formatMoney(variant.price * qty, theme.moneyFormat);
    }
  },

  renderComparePrice(variant, qty) {
    if (!variant) {
      return;
    }

    const comparePriceElement = document.querySelector(
      selectors.comparePrice,
    );
    const compareTextElement = document.querySelector(
      selectors.comparePriceText,
    );

    if (!comparePriceElement || !compareTextElement) {
      return;
    }

    if (variant.compare_at_price > variant.price) {
      comparePriceElement.innerText = formatMoney(
        variant.compare_at_price * qty,
        theme.moneyFormat,
      );
      compareTextElement.classList.remove(classes.hidden);
      comparePriceElement.classList.remove(classes.hidden);
    } else {
      comparePriceElement.innerText = '';
      compareTextElement.classList.add(classes.hidden);
      comparePriceElement.classList.add(classes.hidden);
    }
  },

  updateBrowserHistory(variant) {
    const enableHistoryState = this.productForm.element.dataset
      .enableHistoryState;

    if (!variant || enableHistoryState !== 'true') {
      return;
    }

    const url = getUrlWithVariant(window.location.href, variant.id);
    window.history.replaceState({path: url}, '', url);
  },
});
