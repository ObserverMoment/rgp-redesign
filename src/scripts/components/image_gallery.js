import {elems} from '../utils/Renderer';

const {Div, Img} = elems;

const classes = {
  hideIcon: 'hide-icon',
  imageGalleryViewport: 'image-gallery',
  imageGalleryActions: 'image-gallery__actions',
  imageGalleryActionsIcon: 'image-gallery__actions__icon',
};

let galleryId = 0;

function ImageGallery(imageUrls, initialIndex = 0) {
  galleryId++;
  const imgDataAttr = `data-gallery-image-${galleryId}`;
  const actionsDataAttr = `data-gallery-actions-${galleryId}`;
  const leftScrollIconAttr = `data-gallery-actions-${galleryId}-left-icon`;
  const rightScrollIconAttr = `data-gallery-actions-${galleryId}-right-icon`;
  console.log('dataAttr', imgDataAttr);

  let curIndex = initialIndex;

  // Amount can be -1 or 1.
  function scrollBy(delta) {
    try {
      if (delta !== 1 && delta !== -1) {
        throw Error('You can (currently) only scroll one image at a time');
      }
      if (delta === -1) {
        if (curIndex > 0) {
          curIndex -= 1;
        }
      }
      if (delta === 1) {
        if (curIndex < imageUrls.length - 1) {
          curIndex += 1;
        }
      }
    } catch (err) {
      console.log(err);
    }

    if (curIndex === 0) {
      document.querySelector(`[${leftScrollIconAttr}]`).classList.add(classes.hideIcon);
    } else {
      document.querySelector(`[${leftScrollIconAttr}]`).classList.remove(classes.hideIcon);
    }

    if (curIndex === imageUrls.length - 1) {
      document.querySelector(`[${rightScrollIconAttr}]`).classList.add(classes.hideIcon);
    } else {
      document.querySelector(`[${rightScrollIconAttr}]`).classList.remove(classes.hideIcon);
    }

    return imageUrls[curIndex];
  }


  return {
    actionsElemRef: actionsDataAttr,
    view: () => ([
      Div, {className: classes.imageGalleryViewport}, [
        [Img, {attributes: {src: imageUrls[initialIndex], [imgDataAttr]: ''}}],
        [Div, {className: classes.imageGalleryActions, attributes: {[actionsDataAttr]: ''}}, [
          [Div, {
            className: `${classes.imageGalleryActionsIcon} ${curIndex === 0 && 'hide-icon'}`,
            attributes: {[leftScrollIconAttr]: ''},
            innerHTML: '<i class="fas fa-arrow-alt-circle-left"></i>',
            listeners: {click: [
              (event) => {
                event.stopPropagation();
                event.preventDefault();
                document.querySelector(`[${imgDataAttr}]`).setAttribute('src', scrollBy(-1));
                console.log('left', imgDataAttr);
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
                document.querySelector(`[${imgDataAttr}]`).setAttribute('src', scrollBy(1));
                console.log('right', imgDataAttr);
              }]},
          }],
        ]],
      ],
    ]),
  };
}

export {ImageGallery};
