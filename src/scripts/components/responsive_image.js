import {globalState} from '../utils/global_events';
import {elems} from '../utils/Renderer';
import {formImageSizeUrl} from '../utils/utils';

const {Img} = elems;

let imageId = 0;

const classes = {
  img: 'responsive-image lazy',
};

function ResponsiveImage(imageData, wrapperDataAttr, postMountCallbacks = [], subscriptions = []) {
  imageId++;
  // console.log('imageData', imageData);
  const getElements = {
    self: () => document.querySelector(`[responsive-image-${imageId}]`),
  };

  function resizeImage(element) {
    const parentDims = document.querySelector(`[${wrapperDataAttr}]`).getBoundingClientRect();
    // Give image size some buffer - 20% larger than the size of the parent div.
    const imageRequestDims = `${Math.floor(parentDims.width * 1.2)}x`;
    const srcUrl = formImageSizeUrl(imageData.src, imageRequestDims);
    // 'data-src' is required by the vanilla-lazyload plugin.
    element.setAttribute('data-src', srcUrl);
    element.style.width = `${parentDims.width}px`;
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

  return {
    getElem: getElements.self,
    view: () => ([
      Img, {
        className: classes.img,
        postMountCallbacks: [
          (self) => resizeImage(self),
          (self) => runPostMountCallbacks(self),
        ],
        subscriptions: [
          (self) => globalState.onAttributeUpdate(() => resizeImage(self), ['innerWidth', 'innerHeight']),
          (self) => setupSubscriptions(self),
        ],
      },
    ]),
  };
}

export {ResponsiveImage};
