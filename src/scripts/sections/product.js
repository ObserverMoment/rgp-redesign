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
  hide: 'hide',
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
  priceWrapper: '[data-price-wrapper]',
  imageWrapper: '[data-product-image-wrapper]',
  visibleImageWrapper: `[data-product-image-wrapper]:not(.${classes.hide})`,
  imageWrapperById: (id) => `${selectors.imageWrapper}[data-image-id='${id}']`,
  productForm: '[data-product-form]',
  productPrice: '[data-product-price]',
  imagesElem: '[data-images-elem]',
  galleryElem: '[data-gallery]',
  galleryNavElem: '[data-nav]',
};

let flickityGallery = null;
let flickityNav = null;

// Must be cdn.shopify.com/s/files/1/0168/1113/0934/products/W_3985{_dimension}.jpg?v=1563988014.
const galleryImageSize = '_750x750';
const thumbnailImageSize = '_130x130';

const imagesElem = document.querySelector(selectors.imagesElem);
const galleryElem = document.querySelector(selectors.galleryElem);
const galleryNavElem = document.querySelector(selectors.galleryNavElem);

register('product', {
  async onLoad() {
    const productFormElement = document.querySelector(selectors.productForm);
    const productHandle = productFormElement.dataset.productHandle;
    this.product = await this.getProductJson(productHandle);
    this.productImages = (await this.getProductImages(productHandle)).product.images;

    this.productForm = new ProductForm(productFormElement, this.product, {
      onOptionChange: this.onFormOptionChange.bind(this),
    });

    this.initGallery();
  },

  initGallery() {
    const currentVariant = galleryElem.dataset.currentVariant;

    // Get the relevant images.
    const imagesToDisplay = this.filterImagesByVariant(currentVariant);

    this.createGalleryNodes(imagesToDisplay);
    this.createThumbnailNodes(imagesToDisplay);

    imagesElem.classList.remove(classes.hide);

    this.initFlickity();
  },

  filterImagesByVariant(variant) {
    return this.productImages.filter((image) => image.alt === variant);
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
    const variant = event.dataset.variant;

    if (colourChangeOptions.includes(variant.title)) {
      // Update the gallery for colour changes only.
      // Get the relevant images.
      const imagesToDisplay = this.filterImagesByVariant(variant.title);

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

    this.renderPrice(variant);
    this.renderComparePrice(variant);
    this.renderSubmitButton(variant);

    this.updateBrowserHistory(variant);
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

  renderPrice(variant) {
    const priceElement = this.container.querySelector(selectors.productPrice);
    const priceWrapperElement = this.container.querySelector(
      selectors.priceWrapper,
    );

    priceWrapperElement.classList.toggle(classes.hide, !variant);

    if (variant) {
      priceElement.innerText = formatMoney(variant.price, theme.moneyFormat);
    }
  },

  renderComparePrice(variant) {
    if (!variant) {
      return;
    }

    const comparePriceElement = this.container.querySelector(
      selectors.comparePrice,
    );
    const compareTextElement = this.container.querySelector(
      selectors.comparePriceText,
    );

    if (!comparePriceElement || !compareTextElement) {
      return;
    }

    if (variant.compare_at_price > variant.price) {
      comparePriceElement.innerText = formatMoney(
        variant.compare_at_price,
        theme.moneyFormat,
      );
      compareTextElement.classList.remove(classes.hide);
      comparePriceElement.classList.remove(classes.hide);
    } else {
      comparePriceElement.innerText = '';
      compareTextElement.classList.add(classes.hide);
      comparePriceElement.classList.add(classes.hide);
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
