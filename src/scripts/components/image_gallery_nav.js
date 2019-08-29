import {elems} from '../utils/Renderer';
import {formImageSizeUrl} from '../utils/utils';

const {Div, Img} = elems;

const classes = {
  galleryNavThumbs: 'image-gallery-nav',
  selectedThumbnail: 'selected-thumbnail',
};

const getElements = {
  allThumbs: () => document.querySelectorAll('[data-gallery-nav-thumb]'),
};

let galleryNavThumbIndex = 0;

function GalleryNavThumbs(images = [], galleryState, imageDims = '200x200') {
  galleryNavThumbIndex += 1;
  const navThumbsDataAttr = `gallery-nav-${galleryNavThumbIndex}`;

  function handleUpdateImage(newState) {
    // Clear all highlighting classes.
    getElements.allThumbs().forEach((imageElem) => {
      if (newState.curIndex === parseInt(imageElem.dataset.index, 10)) {
        // Add highlight class to selected image.
        imageElem.classList.add(classes.selectedThumbnail);
      } else {
        imageElem.classList.remove(classes.selectedThumbnail);
      }
    });
  }

  galleryState.onAttributeUpdate(handleUpdateImage, 'curIndex');

  const imageUrlArray = images.map((img) => formImageSizeUrl(img.src, imageDims));

  const initialIndex = galleryState.getState().curIndex;

  return {
    view: () => ([
      Div, {className: classes.galleryNavThumbs}, imageUrlArray.map((imageUrl, index) => ([
        Img, {
          className: `${initialIndex === index && classes.selectedThumbnail} lazy`,
          attributes: {'data-src': imageUrl, 'data-gallery-nav-thumb': '', [`${navThumbsDataAttr}-thumb-${index}`]: '', 'data-index': index},
          listeners: {
            click: [() => galleryState.setState({curIndex: index})],
          },
        },
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
