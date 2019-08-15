import {elems} from '../utils/Renderer';

const {Div, Img} = elems;

const classes = {
  galleryNavThumbs: 'image-gallery-nav',
  selectedThumbnail: 'selected-thumbnail',
};

const getElements = {
  allThumbs: () => document.querySelectorAll('[data-gallery-nav-thumb]'),
};

let galleryNavThumbIndex = 0;
function GalleryNavThumbs(imageUrlArray = [], updateImage) {
  galleryNavThumbIndex += 1;
  const navThumbsDataAttr = `gallery-nav-${galleryNavThumbIndex}`;

  function handleUpdateImage(clickedElem, index) {
    // Clear all highlighting classes.
    getElements.allThumbs().forEach((thumb) => {
      thumb.classList.remove(classes.selectedThumbnail);
    });
    // Add highlight class to selected image.
    clickedElem.classList.add(classes.selectedThumbnail);

    if (updateImage) {
      updateImage(index);
    }
  }

  return {
    view: () => ([
      Div, {className: classes.galleryNavThumbs}, imageUrlArray.map((imageUrl, index) => ([
        Img, {
          attributes: {src: imageUrl, 'data-gallery-nav-thumb': '', [`${navThumbsDataAttr}-thumb-${index}`]: ''},
          listeners: {
            click: [(event) => handleUpdateImage(event.target, index)],
          }},
      ])),
    ]),
  };
}

// function GalleryNavDots(quantity, updateImage) {
//   return {
//     view: () => ([
//
//     ])
//   }
// }

export {GalleryNavThumbs};
