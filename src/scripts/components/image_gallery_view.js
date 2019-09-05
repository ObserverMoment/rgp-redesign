import Hammer from 'hammerjs';
import {elems} from '../utils/Renderer';
import {smoothFade, smoothTranslate, range} from '../utils/utils';
import {globalState} from '../utils/global_events';
import {ResponsiveImage} from './responsive_image';

const {Div} = elems;

const classes = {
  hideIcon: 'hide-icon',
  showImage: 'show-image',
  active: 'active',
  imageGalleryViewport: 'image-gallery',
  imagesContainer: 'image-gallery__images-container',
  singleImage: 'image-gallery__images-container__single-image',
  imageGalleryActions: 'image-gallery__actions',
  imageGalleryActionsIcon: 'image-gallery__actions__icon',
  navDotsContainer: 'image-gallery__nav-dots-container',
  navDot: 'image-gallery__nav-dots-container__dot',
  swipeInstruction: 'image-gallery__swipe-instruction',
};

// Each gallery will need its own id so the correct elements can be targeted.
let _galleryId = 0;
const _imageFadeTime = 400;
const _imageScrollTime = 500;

/*
  @param {images: object[]}: {src, alt, height, width, position}
*/
function ImageGallery(images = [], galleryState, initialIndex = 0) {
  _galleryId++;
  // Initialise state with inits / defaults.
  galleryState.setState({
    galleryId: _galleryId,
    activeTranslateX: 0,
    indexTranslateX: 0,
    imageWidths: [],
    curIndex: initialIndex,
    prevIndex: initialIndex,
  });

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

  function updateTranslateX(newState, imagesContainerElem) {
    const {indexTranslateX, activeTranslateX} = newState;
    imagesContainerElem.style.transform = `translateX(${parseInt(indexTranslateX, 10) + parseInt(activeTranslateX, 10)}px`;
  }

  function updateImageIndex(newState, imagesContainerElem) {
    const {
      curIndex: newIndex, prevIndex, indexTranslateX, activeTranslateX, imageWidths,
    } = newState;
    if (newIndex < 0 || newIndex > numImages - 1) {
      console.error('You can\'t display an image with an index that is outside the range of the imageurls array');
      return;
    }

    // Need to total up all the image widths between the two new indexes - based on imageWidths state array.
    const newTranslateAmt = parseInt(-(imageWidths.slice(0, newIndex).reduce((acum, next) => acum + next, 0)), 10);
    const indexDiff = newIndex - prevIndex;
    // How much of the full image width distance is left to b scrolld after the swipe.
    const scrollPercent = (imageWidths[newIndex] - Math.abs(activeTranslateX)) / imageWidths[newIndex];

    // If swiping, animate using a transform only. If going direct to an index, fade out, transform instantly, then fade in.
    if (Math.abs(indexDiff) === 1) {
      smoothTranslate(
        (newPos) => galleryState.setState({indexTranslateX: parseInt(newPos, 10), activeTranslateX: 0}),
        {xPos: [indexTranslateX + activeTranslateX, newTranslateAmt]},
        [0.14, 0.58, 0.79, 0.69],
        _imageScrollTime * scrollPercent,
      );
    } else {
      // Fade out fast, instant translate, then slow fade back in.
      imagesContainerElem.style.opacity = 0;
      imagesContainerElem.style.transform = `translateX(${newTranslateAmt}px`;
      smoothFade([0, 1], imagesContainerElem, _imageFadeTime, []);
      galleryState.setState({indexTranslateX: newTranslateAmt, activeTranslateX: 0});
    }
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
    const newTranslateAmt = -(imageWidths.slice(0, newIndex).reduce((acum, next) => acum + next, 0));
    imagesContainerElem.style.transform = `translateX(${newTranslateAmt}px`;
    galleryState.setState({indexTranslateX: newTranslateAmt});
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

  function setupSwipeInteraction(imagesContainer) {
    const hammer = new Hammer(imagesContainer);
    hammer.add(new Hammer.Pan({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 0}));
    // Is it a swipe? Allow fast swipes / flicks. What speed does the panend at? Above what velocity end is a flick?
    // Is it a slow pan (like Google)? If so then how far has the pan moved. Above what distance is a swipe?
    // https://github.com/hammerjs/hammer.js/issues/1100
    const fastSwipeMinVel = 0.3;
    const fastSwipeMinDist = 10;

    hammer.on('panend', (event) => {
      const {activeTranslateX, curIndex, imageWidths} = galleryState.getState();
      const slowSwipeBreakpoint = imageWidths[curIndex] / 3.5;
      if (event.velocityX < -fastSwipeMinVel && event.distance > fastSwipeMinDist && curIndex < numImages - 1) {
        // Fast swipe left
        galleryState.setState({curIndex: curIndex + 1, prevIndex: curIndex});
      } else if (event.velocityX > fastSwipeMinVel && event.distance > fastSwipeMinDist && curIndex > 0) {
        // Fast swipe right
        galleryState.setState({curIndex: curIndex - 1, prevIndex: curIndex});
      } else if (event.deltaX < -slowSwipeBreakpoint && curIndex < numImages - 1) {
        // Slow swipe left
        galleryState.setState({curIndex: curIndex + 1, prevIndex: curIndex});
      } else if (event.deltaX > slowSwipeBreakpoint && curIndex > 0) {
        // Slow swipe right
        galleryState.setState({curIndex: curIndex - 1, prevIndex: curIndex});
      } else {
        // Animate back to the previous index.
        const scrollPercent = (imageWidths[curIndex] - Math.abs(activeTranslateX)) / imageWidths[curIndex];
        smoothTranslate(
          (newPos) => galleryState.setState({activeTranslateX: parseInt(newPos, 10)}),
          {xPos: [activeTranslateX, 0]},
          [],
          _imageScrollTime * scrollPercent,
        );
      }
    });

    hammer.on('pan', (event) => {
      // Pan the actual element if there a more images to swipe to.
      const deltaX = getDeltaX(event);
      galleryState.setState({activeTranslateX: parseInt(deltaX, 10)});
    });

    function getDeltaX(event) {
      const {imageWidths, curIndex} = galleryState.getState();
      let deltaX;
      if (curIndex === 0 && event.deltaX >= 0) {
        deltaX = 0;
      } else if (curIndex === numImages - 1 && event.deltaX < 0) {
        deltaX = 0;
      } else if (Math.abs(event.deltaX) < imageWidths[curIndex]) {
        deltaX = event.deltaX;
      } else if (event.deltaX < 0) {
        deltaX = -imageWidths[curIndex];
      } else {
        deltaX = imageWidths[curIndex];
      }
      return deltaX;
    }
  }

  function updateNavDot(navDotElem, newState) {
    if (parseInt(navDotElem.dataset.index, 10) === newState.curIndex) {
      navDotElem.classList.add(classes.active);
    } else {
      navDotElem.classList.remove(classes.active);
    }
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
            (self) => galleryState.onAttributeUpdate((newState) =>
              updateImageIndex(newState, self), 'curIndex'),
            (self) => galleryState.onAttributeUpdate((newState) =>
              handleScreenResize(newState, self), 'imageWidths'),
            (self) => galleryState.onAttributeUpdate((newState) =>
              updateTranslateX(newState, self), ['indexTranslateX', 'activeTranslateX']),
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
            className: `${classes.imageGalleryActionsIcon} ${initialIndex === 0 && 'hide-icon'}`,
            attributes: {[leftScrollIconAttr]: ''},
            innerHTML: '<i class="fas fa-arrow-alt-circle-left"></i>',
            listeners: {click: [
              (event) => {
                event.stopPropagation();
                event.preventDefault();
                const {curIndex} = galleryState.getState();
                galleryState.setState({curIndex: Math.max(curIndex - 1, 0), prevIndex: curIndex});
              }]},
          }],
          [Div, {
            className: `${classes.imageGalleryActionsIcon} ${initialIndex === numImages - 1 && 'hide-icon'}`,
            innerHTML: '<i class="fas fa-arrow-alt-circle-right"></i>',
            attributes: {[rightScrollIconAttr]: ''},
            listeners: {click: [
              (event) => {
                event.stopPropagation();
                event.preventDefault();
                const {curIndex} = galleryState.getState();
                galleryState.setState({curIndex: Math.min(curIndex + 1, numImages - 1), prevIndex: curIndex});
              }]},
          }],
        ]],
        [Div, {className: classes.navDotsContainer}, [
          ...range(numImages).map((index) => ([
            Div, {
              className: `${classes.navDot} ${initialIndex === index && classes.active}`,
              attributes: {'data-index': index},
              subscriptions: [
                (self) => galleryState.onAttributeUpdate((newState) => updateNavDot(self, newState), 'curIndex'),
              ],
            },
          ])),
        ]],
        [Div, {className: classes.swipeInstruction, innerHTML: 'Swipe...'}],
      ],
    ]),
  };
}

export {ImageGallery};
