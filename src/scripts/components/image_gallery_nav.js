import {render, elems} from '../utils/Renderer';
import {ResponsiveImage} from './responsive_image';

const {Root, Div} = elems;

const classes = {
  galleryNavThumbs: 'image-gallery-nav',
  singleThumbWrapper: 'image-gallery-nav__thumb-wrapper',
  selectedThumbnail: 'selected-thumbnail',
};

const getElements = {
  allThumbs: () => document.querySelectorAll('[data-gallery-nav-thumb]'),
};

let galleryNavComponentIndex = 0;

function GalleryNavThumbs(parentElement, images = [], galleryState, initialIndex = 0) {
  galleryNavComponentIndex += 1;
  const navThumbsDataAttr = `gallery-nav-${galleryNavComponentIndex}`;

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

  render([
    Root, {rootElem: parentElement}, [
      [
        Div, {className: classes.galleryNavThumbs},
        images.map((image, index) => ([
          Div, {
            className: `${classes.singleThumbWrapper} ${initialIndex === index ? classes.selectedThumbnail : null}`,
            attributes: {'data-gallery-nav-thumb': '', [`${navThumbsDataAttr}-thumb-${index}`]: '', 'data-index': index},
            listeners: {
              click: [() => galleryState.setState({curIndex: index})],
            },
            postMountCallbacks: [
              (self) => ResponsiveImage(self, image),
            ],
          },
        ])),
      ],
    ],
  ]);
}

export {GalleryNavThumbs};
