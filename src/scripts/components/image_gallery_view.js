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
  // Initialise state with inits / defaults.
  galleryState.setState({galleryId: _galleryId, activeTranslateX: 0, swipeBreakpoint: 100});

  const numImages = images.length;

  // TOD: Calculate the swipe breakpoint based on the total size of the images container / the total number of images.

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
    const {curIndex: newIndex, curXTranslate, activeTranslateX, imageWidths} = newState;
    if (newIndex < 0 || newIndex > numImages - 1) {
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
        {xPos: [curXTranslate + activeTranslateX, translateAmt]},
        [],
        _imageScrollTime,
      );
    } else {
      setTimeout(() => {
        imagesContainerElem.style.transform = `translateX(${translateAmt}px`;
      }, _imageFadeTime);
    }
    galleryState.setState({curXTranslate: translateAmt, activeTranslateX: 0});
    _curIndex = newIndex;
  }

  function updateGalleryImageDims(imageElem, index) {
    const widths = galleryState.getState().imageWidths || [];
    const nextWidth = imageElem.getBoundingClientRect().width;
    galleryState.setState({
      imageWidths: [
        ...widths.slice(0, index),
        nextWidth,
        ...widths.slice(index + 1),
      ],
    });
    // Set the height of the viewport.
    getElements.viewportElem().style.height = `${nextWidth * 0.68}px`;
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
      if (newState.curIndex === numImages - 1) {
        rightIcon.classList.add(classes.hideIcon);
      } else {
        rightIcon.classList.remove(classes.hideIcon);
      }
    }
  }

  function renderResponsiveImage(imageObj, index) {
    // ResponsiveImage args: {ImageData}, {WrapperDataAttr}, {postMountCallbacks}, {subscriptions}.
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
      }, [responsiveImage.view()],
    ]);
  }

  function setSwipeBreakpoint(viewportElement) {
    const swipeBreakpoint = viewportElement.getBoundingClientRect().width * 0.2;
    galleryState.setState({swipeBreakpoint});
  }

  function setupSwipeInteraction(imagesContainer) {
    const hammer = new Hammer(imagesContainer);
    hammer.add(new Hammer.Pan({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 0}));
    // Is it a swipe? Allow fast swipes / flicks. What speed does the panend at? Above what velocity end is a flick?
    // Is it a slow pan (like Google)? If so then how far has the pan moved. Above what distance is a swipe?
    // https://github.com/hammerjs/hammer.js/issues/1100
    const slowSwipeBreakpoint = galleryState.getState().swipeBreakpoint;
    const fastSwipeMinVel = 0.3;
    const fastSwipeMinDist = 10;

    hammer.on('panend', (event) => {
      if (event.velocityX < -fastSwipeMinVel && event.distance > fastSwipeMinDist && _curIndex < numImages - 1) {
        // Fast swipe left
        galleryState.setState({curIndex: _curIndex + 1});
      } else if (event.velocityX > fastSwipeMinVel && event.distance > fastSwipeMinDist && _curIndex > 0) {
        // Fast swipe right
        galleryState.setState({curIndex: _curIndex - 1});
      } else if (event.deltaX < -slowSwipeBreakpoint && _curIndex < numImages - 1) {
        // Slow swipe left
        galleryState.setState({curIndex: _curIndex + 1});
      } else if (event.deltaX > slowSwipeBreakpoint && _curIndex > 0) {
        // Slow swipe right
        galleryState.setState({curIndex: _curIndex - 1});
      } else {
        // Animate back to the previous index.
        const {activeTranslateX, curXTranslate: origTranslateX} = galleryState.getState();
        smoothTranslate(
          (newPos) => animateScroll(newPos, imagesContainer),
          {xPos: [origTranslateX + activeTranslateX, origTranslateX]},
          [],
          _imageScrollTime,
        );
        galleryState.setState({activeTranslateX: 0});
      }
    });

    hammer.on('pan', (event) => {
      // Pan the actual element if there a more images to swipe to.
      const {curXTranslate: currentTranslate} = galleryState.getState();
      let deltaX;
      if (_curIndex === 0 && event.deltaX >= 0) {
        deltaX = 0;
      } else if (_curIndex === numImages.length && event.delta < 0) {
        deltaX = 0;
      } else {
        deltaX = event.deltaX;
      }
      galleryState.setState({activeTranslateX: deltaX});
      imagesContainer.style.transform = `translateX(${currentTranslate + deltaX}px)`;
    });
  }

  return {
    galleryImageRef: viewportDataAttr,
    actionsElemRef: actionsDataAttr,
    view: () => ([
      Div, {
        className: `${classes.imageGalleryViewport} lazyContainer`,
        attributes: {[viewportDataAttr]: ''},
        postMountCallbacks: [
          (self) => setSwipeBreakpoint(self),
        ],
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
            className: `${classes.imageGalleryActionsIcon} ${_curIndex === numImages - 1 && 'hide-icon'}`,
            innerHTML: '<i class="fas fa-arrow-alt-circle-right"></i>',
            attributes: {[rightScrollIconAttr]: ''},
            listeners: {click: [
              (event) => {
                event.stopPropagation();
                event.preventDefault();
                galleryState.setState({curIndex: Math.min(_curIndex + 1, numImages - 1)});
              }]},
          }],
        ]],
      ],
    ]),
  };
}

export {ImageGallery};
