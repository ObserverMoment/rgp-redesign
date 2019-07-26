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
// import {forceFocus} from '@shopify/theme-a11y';
// import Flickity from 'flickity';
import Flickity from 'flickity-as-nav-for';

const classes = {
  hide: 'hide',
  visible: 'visible',
};

// const keyboardKeys = {
//   ENTER: 13,
// };

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
  galleryItems: '[data-product-gallery-item]',
  galleryNavElem: '[data-nav]',
  galleryNavItems: '[data-product-gallery-nav-item]',
};

let flickityGallery = null;
let flickityNav = null;
const galleryElems = document.querySelectorAll(selectors.galleryItems);
const galleryNavElems = document.querySelectorAll(selectors.galleryNavItems);

// New function possible solution.
// 1. Get product images.
// 2. Filter by current variant.
// 3. For each valid image - create an image node (cut this out of liquid file and construct in JS)
// 5. Destroy flickity instance (if exists)
// 6. Initialise a new one.
// 7. For each new node do flickityInstance.append. Does this actually append to the DOM - or just save a reference? Run some tests - are actual /// dom nodes removed?????
// 8. Add .visible class to all nodes (or do this before initialising Flickity?)

// Pass a copy to avoid actually deleting items from the nodelist.
function handleImageUpdates(elements, variantName, flickityInstance) {
  // Get all of the nodes.
  // console.log('elements copy?', elements);
  // Clear all elements first.
  const oldElements = flickityInstance.getCellElements();
  flickityInstance.remove(oldElements);
  flickityInstance.destroy();

  elements.forEach((element) => {
    // console.log('element.dataset.imageAlt.toLowerCase()', element.dataset.imageAlt.toLowerCase());
    if (element.dataset.imageAlt.toLowerCase() === variantName.toLowerCase()) {
      // Add to Flickity and make sure visible class is set.
      if (!element.classList.contains(classes.visible)) {
        element.classList.add(classes.visible);
      }
      flickityInstance.append(element);
      // console.log('updated', flickityInstance.cells);
    } else {
      element.classList.remove(classes.visible);
    }
  });
  // console.log('galleryElems', galleryElems);
  console.log('updated', flickityInstance.cells);
}

function initialiseGallery() {
  const imagesElem = document.querySelector(selectors.imagesElem);
  const galleryElem = document.querySelector(selectors.galleryElem);
  const currentVariant = galleryElem.dataset.currentVariant;
  const galleryNavElem = document.querySelector(selectors.galleryNavElem);

  const galleryElemsCopy = Array.prototype.map.call(galleryElems, (elem) => elem.cloneNode(true));
  const galleryNavElemsCopy = Array.prototype.map.call(galleryNavElems, (elem) => elem.cloneNode(true));

  flickityGallery = new Flickity(galleryElem, {
    wrapAround: true,
    percentPosition: false,
    setGallerySize: false,
    ImagesLoaded: true,
  });
  flickityNav = new Flickity(galleryNavElem, {
    asNavFor: galleryElem,
    contain: true,
    pageDots: false,
    prevNextButtons: false,
    percentPosition: false,
    ImagesLoaded: true,
  });

  imagesElem.classList.remove(classes.hide);

  handleImageUpdates(galleryElemsCopy, currentVariant, flickityGallery);
  handleImageUpdates(galleryNavElemsCopy, currentVariant, flickityNav);

}

initialiseGallery();

register('product', {
  async onLoad() {
    const productFormElement = document.querySelector(selectors.productForm);
    const productHandle = productFormElement.dataset.productHandle;
    this.product = await this.getProductJson(productHandle);
    // this.productImages = await this.getProductImages(productHandle);

    this.productForm = new ProductForm(productFormElement, this.product, {
      onOptionChange: this.onFormOptionChange.bind(this),
    });

    // this.onThumbnailClick = this.onThumbnailClick.bind(this);
    // this.onThumbnailKeyup = this.onThumbnailKeyup.bind(this);

    // this.container.addEventListener('click', this.onThumbnailClick);
    // this.container.addEventListener('keyup', this.onThumbnailKeyup);
  },

  onUnload() {
    this.productForm.destroy();
    // this.removeEventListener('click', this.onThumbnailClick);
    // this.removeEventListener('keyup', this.onThumbnailKeyup);
  },

  getProductJson(handle) {
    return fetch(`/products/${handle}.js`).then((response) => {
      return response.json();
    });
  },

  // getProductImages(handle) {
  //   return fetch(`/products/${handle}/images.json`).then((response) => {
  //     return response.json();
  //   });
  // },

  onFormOptionChange(event) {
    const variant = event.dataset.variant;
    console.log('variant', variant);

    this.renderImages(variant);
    this.renderPrice(variant);
    this.renderComparePrice(variant);
    this.renderSubmitButton(variant);

    this.updateBrowserHistory(variant);
  },

  renderImages(variant) {
    if (!variant || variant.featured_image === null) {
      return;
    }

    const galleryElemsCopy = Array.prototype.map.call(galleryElems, (elem) => {
      return elem.cloneNode(true);
    });
    const galleryNavElemsCopy = Array.prototype.map.call(galleryNavElems, (elem) => {
      return elem.cloneNode(true);
    });

    handleImageUpdates(galleryElemsCopy, variant.title, flickityGallery);
    handleImageUpdates(galleryNavElemsCopy, variant.title, flickityNav);
  },

  // onThumbnailClick(event) {
  //   console.log('onThumbnailClick', this)
  //   const thumbnail = event.target.closest(selectors.thumbnail);
  //   console.log('thumbnail', thumbnail)
  //   if (!thumbnail) {
  //     return;
  //   }
  //
  //   event.preventDefault();
  //
  //   // this.renderFeaturedImage(thumbnail.dataset.thumbnailId);
  //   // this.renderActiveThumbnail(thumbnail.dataset.thumbnailId);
  // },

  // onThumbnailKeyup(event) {
  //   if (
  //     event.keyCode !== keyboardKeys.ENTER ||
  //     !event.target.closest(selectors.thumbnail)
  //   ) {
  //     return;
  //   }
  //
  //   const visibleFeaturedImageWrapper = this.container.querySelector(
  //     selectors.visibleImageWrapper,
  //   );
  //
  //   forceFocus(visibleFeaturedImageWrapper);
  // },

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

  // renderActiveThumbnail(id) {
  //   const activeThumbnail = this.container.querySelector(
  //     selectors.thumbnailById(id),
  //   );
  //   const inactiveThumbnail = this.container.querySelector(
  //     selectors.thumbnailActive,
  //   );
  //
  //   if (activeThumbnail === inactiveThumbnail) {
  //     return;
  //   }
  //
  //   inactiveThumbnail.removeAttribute('aria-current');
  //   activeThumbnail.setAttribute('aria-current', true);
  // },
  //
  // renderFeaturedImage(id) {
  //   const activeImage = this.container.querySelector(
  //     selectors.visibleImageWrapper,
  //   );
  //   const inactiveImage = this.container.querySelector(
  //     selectors.imageWrapperById(id),
  //   );
  //   if (activeImage) {
  //     activeImage.classList.add(classes.hide);
  //   }
  //   inactiveImage.classList.remove(classes.hide);
  // },

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
