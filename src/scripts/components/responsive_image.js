import {debounce} from 'throttle-debounce';
import {globalState} from '../utils/global_events';
import {render, elems} from '../utils/Renderer';
import {formImageSizeUrl} from '../utils/utils';

const {Root, Img} = elems;

let imageId = 0;

const classes = {
  img: 'responsive-image',
};

function ResponsiveImage(parentElement, imageData, postMountCallbacks = [], subscriptions = []) {
  imageId++;

  const getElements = {
    self: () => document.querySelector(`[responsive-image-${imageId}]`),
  };

  function resizeImage(element) {
    const parentDims = parentElement.getBoundingClientRect();
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

  render([
    Root, {rootElem: parentElement}, [
      [
        Img, {
          className: classes.img,
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
    ],
  ]);

  return {
    getImgElem: getElements.self,
  };
}

export {ResponsiveImage};
