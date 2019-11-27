import {getCollectionProducts} from '../utils/api';
import {Store} from '../utils/Store';
import {ImageGallery} from '../components/image_gallery_view';

let observer;
const url = window.location.pathname;
const collectionHandle = url.split('/')[2];

// Renders a single image gallery component.
function renderImageGallery(parentElem, images) {
  // The observer callback will render the ImageGallery once it is entering the viewport.
  let hasRendered = false;
  observer = new IntersectionObserver(
    (entries) => {
      if (hasRendered) {
        // Is unobserver and / or disconnect actually doing anything here? Not working on Chrome 13.11.19.
        observer.unobserve(parentElem);
        return;
      }
      if (entries[0].isIntersecting) {
        const galleryState = Store({curIndex: 0}, 'collection-product-gallery');
        const {getActionsElem} = ImageGallery(parentElem, images, galleryState);
        galleryState.setState({getActionsElem});
        hasRendered = true;
      }
    },
    {
      rootMargin: '300px 0px 300px 0px',
      threshold: 1.0,
    },
  );
  observer.observe(parentElem);
}

// Renders all the image gallery components - one for each product image.
function renderProductImages({products}) {
  // For each product. Find the parent element for the image gallery.
  // Then run renderImageGallery()
  const productCardElems = document.querySelectorAll('[data-product-card]');
  productCardElems.forEach((elem) => {
    const {images} = products.find((product) => product.id === parseInt(elem.dataset.productId, 10));
    renderImageGallery(elem, images);
  });
}

async function initCollection() {
  // Need this call to get collection product which have image objects at {image}, not just urls.
  // We are using the image alt to label images as different colours.
  const data = await getCollectionProducts(collectionHandle);
  renderProductImages(data);
}

initCollection();
