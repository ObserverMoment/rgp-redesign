import {elems} from '../utils/Renderer';
import {smoothFade, formImageSizeUrl} from '../utils/utils';

const {Div, Img} = elems;

const classes = {
  hideIcon: 'hide-icon',
  imageGalleryViewport: 'image-gallery',
  imageGalleryActions: 'image-gallery__actions',
  imageGalleryActionsIcon: 'image-gallery__actions__icon',
  imageGalleryLoading: 'image-gallery__loading',
};

// Each gallery will need its own id so the correct elements can be targeted.
let galleryId = 0;

/*
  @param {images: object[]}: {src, alt, height, width, position}
*/
function ImageGallery(images = [], galleryState, imageSize) {
  const sizedImages = images.map((img) => ({...img, src: formImageSizeUrl(img.src, imageSize)}));

  galleryId++;
  const imgDataAttr = `data-gallery-image-${galleryId}`;
  const actionsDataAttr = `data-gallery-actions-${galleryId}`;
  const leftScrollIconAttr = `data-gallery-actions-${galleryId}-left-icon`;
  const rightScrollIconAttr = `data-gallery-actions-${galleryId}-right-icon`;

  const getElements = {
    imageElem: () => document.querySelector(`[${imgDataAttr}]`),
    leftScrollIcon: () => document.querySelector(`[${leftScrollIconAttr}]`),
    rightScrollIcon: () => document.querySelector(`[${rightScrollIconAttr}]`),
  };

  let curIndex = galleryState.curIndex || 0;

  function updateMainImage(newState, imageElem) {
    const {curIndex: newIndex} = newState;
    if (newIndex < 0 || newIndex > sizedImages.length - 1) {
      console.error('You can\'t display an image with an index that is outside the range of the imageurls array');
      return;
    }

    curIndex = newIndex;

    // Fade out...5th arg is an optional callback to work around async nature of requestAnimationFrame
    smoothFade('out', imageElem, 150, [], () => {
      const leftIcon = getElements.leftScrollIcon();
      const rightIcon = getElements.rightScrollIcon();
      if (newIndex === 0) {
        leftIcon.classList.add(classes.hideIcon);
      } else {
        leftIcon.classList.remove(classes.hideIcon);
      }

      if (newIndex === sizedImages.length - 1) {
        rightIcon.classList.add(classes.hideIcon);
      } else {
        rightIcon.classList.remove(classes.hideIcon);
      }

      // Set new src.
      imageElem.setAttribute('src', sizedImages[newIndex].src);
    });
  }

  return {
    galleryImageRef: imgDataAttr,
    actionsElemRef: actionsDataAttr,
    updateMainImage,
    view: () => ([
      Div, {className: classes.imageGalleryViewport}, [
        [Img, {
          attributes: {src: sizedImages[curIndex].src, [imgDataAttr]: ''},
          listeners: {
            load: [() => smoothFade('in', getElements.imageElem(), 200, [])],
          },
          subscriptions: [
            (self) => galleryState.onAttributeUpdate((newState) => updateMainImage(newState, self), 'curIndex'),
          ],
        }],
        [Div, {className: classes.imageGalleryActions, attributes: {[actionsDataAttr]: ''}}, [
          [Div, {
            className: `${classes.imageGalleryActionsIcon} ${curIndex === 0 && 'hide-icon'}`,
            attributes: {[leftScrollIconAttr]: ''},
            innerHTML: '<i class="fas fa-arrow-alt-circle-left"></i>',
            listeners: {click: [
              (event) => {
                event.stopPropagation();
                event.preventDefault();
                galleryState.setState({curIndex: Math.max(curIndex - 1, 0)});
              }]},
          }],
          [Div, {
            className: `${classes.imageGalleryActionsIcon} ${curIndex === sizedImages.length - 1 && 'hide-icon'}`,
            innerHTML: '<i class="fas fa-arrow-alt-circle-right"></i>',
            attributes: {[rightScrollIconAttr]: ''},
            listeners: {click: [
              (event) => {
                event.stopPropagation();
                event.preventDefault();
                galleryState.setState({curIndex: Math.min(curIndex + 1, sizedImages.length - 1)});
              }]},
          }],
        ]],
      ],
    ]),
  };
}

export {ImageGallery};
