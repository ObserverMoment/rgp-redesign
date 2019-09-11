import Swiper from 'swiper';
import {render, elems} from '../utils/Renderer';
import {range} from '../utils/utils';
import {globalState, globalEvents} from '../utils/global_events';
import {ResponsiveImage} from './responsive_image';

const {Root, Div} = elems;

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

/*
  @param {images: object[]}: {src, alt, height, width, position}
*/
function ImageGallery(parentElement, images = [], galleryState, initialIndex = 0) {
  _galleryId++;
  // Initialise state with inits / defaults.
  galleryState.setState({
    galleryId: _galleryId,
    imageWidth: parentElement.getBoundingClientRect().width,
    curIndex: initialIndex,
    prevIndex: initialIndex,
    numImages: images.length,
  });

  const viewportDataAttr = `data-gallery-${_galleryId}-viewport`;
  const imagesContainerDataAttr = `data-gallery-${_galleryId}-images-container`;
  const imageElemsDataAttr = `data-gallery-${_galleryId}-images`;
  const actionsDataAttr = `data-gallery-${_galleryId}-actions`;
  const leftScrollIconAttr = `data-gallery-${_galleryId}-actions-left-icon`;
  const rightScrollIconAttr = `data-gallery-${_galleryId}-actions-right-icon`;

  const getElements = {
    viewportElem: () => document.querySelector(`[${viewportDataAttr}]`),
    actionsElem: () => document.querySelector(`[${actionsDataAttr}]`),
    imagesContainer: () => document.querySelector(`[${imagesContainerDataAttr}]`),
    imageWrapperElem: (index) => document.querySelector(`[${imageElemsDataAttr}-image-${index}]`),
    leftScrollIcon: () => document.querySelector(`[${leftScrollIconAttr}]`),
    rightScrollIcon: () => document.querySelector(`[${rightScrollIconAttr}]`),
  };

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
      if (newState.curIndex === galleryState.getState().numImages - 1) {
        rightIcon.classList.add(classes.hideIcon);
      } else {
        rightIcon.classList.remove(classes.hideIcon);
      }
    }
  }

  function setSingleImageContainerWidth(singleImageWrapper) {
    singleImageWrapper.style.width = `${parentElement.getBoundingClientRect().width}px`;
  }

  function updateNavDot(navDotElem, newState) {
    if (parseInt(navDotElem.dataset.index, 10) === newState.curIndex) {
      navDotElem.classList.add(classes.active);
    } else {
      navDotElem.classList.remove(classes.active);
    }
  }

  function onRenderComplete(viewportElement) {
    // http://idangero.us/swiper/api/#parameters
    const swiper = new Swiper(viewportElement, {
      // Disable preloading of all images
      preloadImages: false,
      wrapperClass: `gallery-${_galleryId}-swiper-wrapper`,
      slideClass: `gallery-${_galleryId}-swiper-slide`,
      on: {
        slideChange() {
          galleryState.setState({curIndex: this.activeIndex});
        },
      },
      // Enable lazy loading
      lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 1,
      },
      loadOnTransitionStart: true,
    });

    // Swiper needs to subscribe to curIndex state.
    galleryState.onAttributeUpdate((newState) => {
      swiper.slideTo(newState.curIndex);
    }, 'curIndex');
  }

  function renderImageWrapper(imageObj, index) {
    return ([
      Div, {
        className: `${classes.singleImage} gallery-${_galleryId}-swiper-slide`,
        attributes: {
          'data-index': index,
          [`${imageElemsDataAttr}-image-${index}`]: '',
        },
        postMountCallbacks: [
          (self) => setSingleImageContainerWidth(self),
          (self) => ResponsiveImage(self, imageObj, true, true),
        ],
        subscriptions: [
          (self) => globalState.onAttributeUpdate(() => setSingleImageContainerWidth(self), 'innerWidth'),
        ],
      },
    ]);
  }

  render([
    Root, {rootElem: parentElement, eventCompleteId: `image-gallery-${_galleryId}`}, [
      [
        Div, {
          className: classes.imageGalleryViewport,
          subscriptions: [
            (self) => globalState.subscribe(`${globalEvents.DOMUPDATED}-image-gallery-${_galleryId}`, () => onRenderComplete(self)),
          ],
        }, [
          [Div, {
            className: `${classes.imagesContainer} gallery-${_galleryId}-swiper-wrapper`,
            attributes: {[imagesContainerDataAttr]: ''},
          }, images.map((image, index) => renderImageWrapper(image, index))],
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
              className: `${classes.imageGalleryActionsIcon} ${initialIndex === galleryState.getState().numImages - 1 && 'hide-icon'}`,
              innerHTML: '<i class="fas fa-arrow-alt-circle-right"></i>',
              attributes: {[rightScrollIconAttr]: ''},
              listeners: {click: [
                (event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  const {curIndex} = galleryState.getState();
                  galleryState.setState({curIndex: Math.min(curIndex + 1, galleryState.getState().numImages - 1), prevIndex: curIndex});
                }]},
            }],
          ]],
          [Div, {className: classes.navDotsContainer}, [
            ...range(galleryState.getState().numImages).map((index) => ([
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
      ],
    ],
  ]);

  return {
    getViewportElem: getElements.viewportElem,
    getImagesContainerElem: getElements.imagesContainer,
    getSingleImageWrapper: (imageIndex) => getElements.imageWrapperElem(imageIndex),
    getActionsElem: getElements.actionsElem,
    getLeftScrollIcon: getElements.leftScrollIcon,
    getRightScrollIcon: getElements.getRightScrollIcon,
  };
}

export {ImageGallery};
