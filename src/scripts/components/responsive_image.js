import {globalState} from '../utils/global_events';
import {elems} from '../utils/Renderer';
import {formImageSizeUrl} from '../utils/utils';

const {Img} = elems;

let imageId = 0;

function ResponsiveImage(imageData, wrapperDataAttr, postMountCallbacks = [], subscriptions = []) {
  imageId++;
  // console.log('imageData', imageData);
  const getElements = {
    self: () => document.querySelector(`[responsive-image-${imageId}]`),
  };

  function resizeImage(element) {
    const parentDims = document.querySelector(`[${wrapperDataAttr}]`).getBoundingClientRect();
    // console.log('parentDims', parentDims);
    const srcUrl = formImageSizeUrl(imageData.src, '1000x1000');
    // console.log(srcUrl);
    element.src = srcUrl;
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
        className: 'responsive-image',
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
