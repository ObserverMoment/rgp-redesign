import {elems} from '../utils/Renderer';
import {smoothFade} from '../utils/utils';

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

function ImageGallery(imageUrls, initialIndex = 0) {
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

  let curIndex = initialIndex;

  function updateMainImage(newIndex) {
    if (newIndex < 0 || newIndex > imageUrls.length - 1) {
      console.error('You can\'t display an image with an index that is outside the range of the imageurls array');
      return;
    }

    curIndex = newIndex;

    const imageElem = getElements.imageElem();

    // Fade out...5th arg is an optional callback to work around async nature of requestAnimationFrame
    smoothFade('out', imageElem, 150, [], () => {
      const leftIcon = getElements.leftScrollIcon();
      const rightIcon = getElements.rightScrollIcon();
      if (newIndex === 0) {
        leftIcon.classList.add(classes.hideIcon);
      } else {
        leftIcon.classList.remove(classes.hideIcon);
      }

      if (newIndex === imageUrls.length - 1) {
        rightIcon.classList.add(classes.hideIcon);
      } else {
        rightIcon.classList.remove(classes.hideIcon);
      }

      // Set new src.
      imageElem.setAttribute('src', imageUrls[newIndex]);
    });
  }

  return {
    galleryImageRef: imgDataAttr,
    actionsElemRef: actionsDataAttr,
    updateMainImage,
    view: () => ([
      Div, {className: classes.imageGalleryViewport}, [
        [Img, {
          attributes: {src: imageUrls[initialIndex], [imgDataAttr]: ''},
          listeners: {
            load: [() => smoothFade('in', getElements.imageElem(), 300, [])],
          },
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
                updateMainImage(curIndex - 1);
              }]},
          }],
          [Div, {
            className: `${classes.imageGalleryActionsIcon} ${curIndex === imageUrls.length - 1 && 'hide-icon'}`,
            innerHTML: '<i class="fas fa-arrow-alt-circle-right"></i>',
            attributes: {[rightScrollIconAttr]: ''},
            listeners: {click: [
              (event) => {
                event.stopPropagation();
                event.preventDefault();
                updateMainImage(curIndex + 1);
              }]},
          }],
        ]],
      ],
    ]),
  };
}

export {ImageGallery};
