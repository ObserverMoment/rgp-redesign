import Hammer from 'hammerjs';
import {elems} from '../utils/Renderer';
import {smoothFade, smoothTranslate} from '../utils/utils';
import {globalState} from '../utils/global_events';
import {ResponsiveImage} from './responsive_image';

const {Div} = elems;

const classes = {
  hideIcon: 'hide-icon',
  showImage: 'show-image',
  imageGalleryViewport: 'image-gallery',
  imagesContainer: 'image-gallery__images-container',
  singleImage: 'image-gallery__images-container__single-image',
  imageGalleryActions: 'image-gallery__actions',
  imageGalleryActionsIcon: 'image-gallery__actions__icon',
};

// Each gallery will need its own id so the correct elements can be targeted.
let _galleryId = 0;
const _imageFadeTime = 100;
const _imageScrollTime = 300;

/*
  @param {images: object[]}: {src, alt, height, width, position}
*/
function ImageGallery(images = [], galleryState) {
  _galleryId++;
  galleryState.setState({_galleryId});

  const viewportDataAttr = `data-gallery-${_galleryId}-viewport`;
  const imagesContainerDataAttr = `data-gallery-${_galleryId}-images-container`;
  const imageElemsDataAttr = `data-gallery-${_galleryId}-images`;
  const actionsDataAttr = `data-gallery-${_galleryId}-actions`;
  const leftScrollIconAttr = `data-gallery-${_galleryId}-actions-left-icon`;
  const rightScrollIconAttr = `data-gallery-${_galleryId}-actions-right-icon`;

  const getElements = {
    viewportElem: () => document.querySelector(`[${viewportDataAttr}]`),
    imagesContainer: () => document.querySelector(`[${imagesContainerDataAttr}]`),
    imageElem: (imageElemId) => document.querySelector(`[${imageElemsDataAttr}-image-${imageElemId}]`),
    leftScrollIcon: () => document.querySelector(`[${leftScrollIconAttr}]`),
    rightScrollIcon: () => document.querySelector(`[${rightScrollIconAttr}]`),
  };

  const initialState = galleryState.getState();

  let _curIndex = initialState.curIndex || 0;

  function animateScroll(newXpos, imagesContainerElem) {
    imagesContainerElem.style.transform = `translateX(${newXpos}px`;
  }

  function updateImageIndex(newState, imagesContainerElem) {
    const {curIndex: newIndex, curXTranslate, imageWidths} = newState;
    if (newIndex < 0 || newIndex > images.length - 1) {
      console.error('You can\'t display an image with an index that is outside the range of the imageurls array');
      return;
    }

    // Need to total up all the image widths between the two new indexes - based on imageWidths state array.
    const translateAmt = -(imageWidths.slice(0, newIndex).reduce((acum, next) => acum + next, 0));
    const indexDiff = newIndex - _curIndex;

    // If swiping, animate using a transform only. If going direct to an index, fade out, transform instantly, then fade in.
    if (Math.abs(indexDiff) === 1) {
      smoothTranslate(
        (newPos) => animateScroll(newPos, imagesContainerElem),
        {xPos: [curXTranslate, translateAmt]},
        [],
        _imageScrollTime,
      );
    } else {
      setTimeout(() => {
        imagesContainerElem.style.transform = `translateX(${translateAmt}px`;
      }, _imageFadeTime);
    }
    galleryState.setState({curXTranslate: translateAmt});
    _curIndex = newIndex;
  }

  function updateGalleryImageDims(imageElem, index) {
    const widths = galleryState.getState().imageWidths || [];
    galleryState.setState({
      imageWidths: [
        ...widths.slice(0, index),
        imageElem.getBoundingClientRect().width,
        ...widths.slice(index + 1),
      ],
    });
  }

  function checkVisibility(newState, img) {
    // Opacity defaults to 1 but will return an empty string if it has not yet been set in JS.
    // const curOpacity = img.style.opacity ? parseFloat(img.style.opacity) : 1;
    // if (parseInt(img.dataset.index, 0) === newState.curIndex) {
    //   if (curOpacity < 1) {
    //     smoothFade([curOpacity, 1], img, _imageFadeTime, []);
    //   }
    // } else if (curOpacity > 0) {
    //   smoothFade([curOpacity, 0], img, _imageFadeTime * 10, []);
    // }
  }

  function handleScreenResize(newState, imagesContainerElem) {
    const {curIndex: newIndex, imageWidths} = newState;
    const translateAmt = -(imageWidths.slice(0, newIndex).reduce((acum, next) => acum + next, 0));
    imagesContainerElem.style.transform = `translateX(${translateAmt}px`;
    galleryState.setState({curXTranslate: translateAmt});
  }

  function updateActionsElement(newState) {
    // Show / hide the prev/next arrows.
    const leftIcon = getElements.leftScrollIcon();
    if (leftIcon) {
      if (newState.curIndex === 0) {
        leftIcon.classList.add(classes.hideIcon);
      } else {
        leftIcon.classList.remove(classes.hideIcon);
      }
    }

    const rightIcon = getElements.rightScrollIcon();
    if (rightIcon) {
      if (newState.curIndex === images.length - 1) {
        rightIcon.classList.add(classes.hideIcon);
      } else {
        rightIcon.classList.remove(classes.hideIcon);
      }
    }
  }

  function renderResponsiveImage(imageObj, index) {
    const responsiveImage = ResponsiveImage(
      imageObj,
      viewportDataAttr,
      [(self) => updateGalleryImageDims(self, index)],
      [(self) => globalState.onAttributeUpdate(() => updateGalleryImageDims(self, index), ['innerWidth', 'innerHeight'])],
    );
    return ([
      Div, {
        className: classes.singleImage,
        attributes: {'data-index': index},
        subscriptions: [
          (self) => galleryState.onAttributeUpdate((newState) => checkVisibility(newState, self), 'curIndex'),
        ],
        postMountCallbacks: [
          (self) => checkVisibility(initialState, self),
        ],
      }, [responsiveImage.view()],
    ]);
  }

  function setupSwipeInteraction(imagesContainer) {
    const hammer = new Hammer(imagesContainer);
    hammer.add(new Hammer.Pan({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 0}));

    // https://github.com/hammerjs/hammer.js/issues/1100
    hammer.on('panend', (event) => {
      if (event.type === 'panend' && event.velocityX < -0.3 && event.distance > 10 && _curIndex < images.length - 1) {
          // Swipe left
        galleryState.setState({curIndex: _curIndex + 1});
      }
      if (event.type === 'panend' && event.velocityX > 0.3 && event.distance > 10 && _curIndex > 0) {
          // Swipe right
        galleryState.setState({curIndex: _curIndex - 1});
      }
    });
  }

  return {
    galleryImageRef: viewportDataAttr,
    actionsElemRef: actionsDataAttr,
    view: () => ([
      Div, {
        className: `${classes.imageGalleryViewport} lazyContainer`,
        attributes: {[viewportDataAttr]: ''},
      }, [
        [Div, {
          className: classes.imagesContainer,
          attributes: {[imagesContainerDataAttr]: ''},
          subscriptions: [
            (self) => galleryState.onAttributeUpdate((newState) => updateImageIndex(newState, self), 'curIndex'),
            (self) => galleryState.onAttributeUpdate((newState) => handleScreenResize(newState, self), 'imageWidths'),
          ],
          postMountCallbacks: [
            (self) => setupSwipeInteraction(self),
          ],
        }, images.map((imageObj, index) => (
            renderResponsiveImage(imageObj, index)
          )),
        ],
        [Div, {
          className: classes.imageGalleryActions,
          attributes: {[actionsDataAttr]: ''},
          subscriptions: [
            () => galleryState.onAttributeUpdate((newState) => updateActionsElement(newState), 'curIndex'),
          ],
        }, [
          [Div, {
            className: `${classes.imageGalleryActionsIcon} ${_curIndex === 0 && 'hide-icon'}`,
            attributes: {[leftScrollIconAttr]: ''},
            innerHTML: '<i class="fas fa-arrow-alt-circle-left"></i>',
            listeners: {click: [
              (event) => {
                event.stopPropagation();
                event.preventDefault();
                galleryState.setState({curIndex: Math.max(_curIndex - 1, 0)});
              }]},
          }],
          [Div, {
            className: `${classes.imageGalleryActionsIcon} ${_curIndex === images.length - 1 && 'hide-icon'}`,
            innerHTML: '<i class="fas fa-arrow-alt-circle-right"></i>',
            attributes: {[rightScrollIconAttr]: ''},
            listeners: {click: [
              (event) => {
                event.stopPropagation();
                event.preventDefault();
                galleryState.setState({curIndex: Math.min(_curIndex + 1, images.length - 1)});
              }]},
          }],
        ]],
      ],
    ]),
  };
}

export {ImageGallery};
