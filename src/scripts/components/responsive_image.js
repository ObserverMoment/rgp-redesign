import {debounce} from 'throttle-debounce';
import {globalState} from '../utils/global_events';
import {render, elems} from '../utils/Renderer';
import {formImageSizeUrl} from '../utils/utils';
import {Loader} from './loader';

const {Root, Img} = elems;

let imageId = 0;

const classes = {
  img: 'responsive-image',
  loader: 'loader',
};

function ResponsiveImage(parentElement, imageData, lazy = false, showLoader = false, postMountCallbacks = [], subscriptions = []) {
  imageId++;

  // Track the size of the largest downloaded image.
  // Only re-download a new image if the user is making the screen larger.
  let downloadedImageWidth = 0;

  const getElements = {
    self: () => document.querySelector(`[responsive-image-${imageId}]`),
  };

  function resizeImage(element) {
    const parentDims = parentElement.getBoundingClientRect();
    // Give image size some buffer - 20% larger than the size of the parent div.
    if (parentDims.width > 0 && parentDims.width > downloadedImageWidth) {
      const newWidth = parentDims.width;
      const imageRequestDims = `${Math.floor(newWidth * 1.2)}x`;
      downloadedImageWidth = newWidth;
      const srcUrl = formImageSizeUrl(imageData.src, imageRequestDims);
      // 'data-src' is required for lazy-loading.
      if (lazy) {
        element.setAttribute('data-src', srcUrl);
      } else {
        element.setAttribute('src', srcUrl);
      }
      element.style.width = `${parentDims.width}px`;
    }
  }

  function runPostMountCallbacks(imageElem) {
    postMountCallbacks.forEach((callback) => {
      callback(imageElem);
    });
  }

  function setupSubscriptions(imageElem) {
    subscriptions.forEach((subscription) => {
      subscription(imageElem);
    });
  }

  function renderImage() {
    return ([
      [
        Img, {
          className: `${classes.img} swiper-lazy`,
          attributes: {
            [`responsive-image-${imageId}`]: '',
          },
          postMountCallbacks: [
            (self) => resizeImage(self),
            (self) => runPostMountCallbacks(self),
          ],
          subscriptions: [
            (self) => globalState.onAttributeUpdate(debounce(500, () => resizeImage(self)), 'innerWidth'),
            (self) => setupSubscriptions(self),
          ],
        },
      ],
      showLoader && Loader('responsive-image__loader swiper-lazy-preloader'),
    ].filter((node) => node));
  }

  // http://idangero.us/swiper/api/#lazy
  render([
    Root, {rootElem: parentElement}, renderImage(),
  ]);

  return {
    getImgElem: getElements.self,
  };
}

export {ResponsiveImage};
