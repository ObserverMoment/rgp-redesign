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
import Flickity from 'flickity-as-nav-for';

const classes = {
  hidden: 'hidden',
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
  productQtyInput: 'add-product-quantity-input',
};

let flickityGallery = null;
let flickityNav = null;

// Must be cdn.shopify.com/s/files/1/0168/1113/0934/products/W_3985{_dimension}.jpg?v=1563988014.
const galleryImageSize = '_750x750';
const thumbnailImageSize = '_130x130';

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
    const inputElem = document.getElementById(selectors.productQtyInput);

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
    return this.productImages.filter((image) => image.alt.toLowerCase() === colour.toLowerCase());
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
    const qty = parseInt(document.getElementById(selectors.productQtyInput).value, 10);
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
