import {elems} from '../utils/Renderer';
import {ImageGallery} from './image_gallery';
import {formImageSizeUrl} from '../utils/utils';

const {Div, Img, Span} = elems;

const classes = {
  card: 'product-card',
  meta: 'product-card__meta',
  metaInfo: 'product-card__meta__info',
  metaColours: 'product-card__meta__colours',
  image: 'product-card__image',
  info: 'product-card__info',
  infoTitle: 'product-card__info__title',
  infoPrice: 'product-card__info__price',
  showGalleryActions: 'show-gallery-actions',
};

// Returns a single array of the form required by Renderer.render().
// [Type, {config}, [children]]
function ProductCard(productObj, imageSize, enableGallery) {
  const {title, images, options} = productObj;
  const price = productObj.variants[0] && productObj.variants[0].price;
  // Get image URLs.
  const imgUrls = images.map((image) => formImageSizeUrl(image.src, imageSize));

  const colours = (options.length > 0) && (options[0].name === 'Colour') && options[0].values;
  const tags = productObj.tags;

  const imageDisplay = enableGallery ? ImageGallery(imgUrls) : [Img, {attributes: {src: imgUrls[0]}}];
  console.log('imageDisplay', imageDisplay);
  console.log('imageDisplay.view()', imageDisplay.view());

  console.log('ImageGallery(images)', ImageGallery(images));

  console.log('imageDisplay.setIndex', imageDisplay.setIndex);

  function showActions() {
    console.log('imageDisplay.actionsElemRef', imageDisplay.actionsElemRef);
    document.querySelector(`[${imageDisplay.actionsElemRef}]`).classList.add(classes.showGalleryActions);
  }

  function hideActions() {
    document.querySelector(`[${imageDisplay.actionsElemRef}]`).classList.remove(classes.showGalleryActions);
  }


  return (
  [
    Div, {
      className: classes.card,
      listeners: {
        mouseenter: [showActions, () => console.log('entering', imageDisplay.actionsElemRef)],
        mouseleave: [hideActions, () => console.log('leaving', imageDisplay.actionsElemRef)],
      }}, [
        [Div, {className: classes.meta}, [
          [Div, {className: classes.metaInfo}, tags && tags.map((tag) => [
            Span, {innerHTML: tag},
          ])],
          [Div, {className: classes.metaColours}, colours && colours.map((colour) => [
            Div, {className: `${classes.metaColours}__colour ${colour}`},
          ])],
        ]],
      [Div, {className: classes.image}, [enableGallery ? imageDisplay.view() : imageDisplay]],
        [Div, {className: classes.info}, [
        [Div, {className: classes.infoTitle, innerHTML: title}],
        [Div, {className: classes.infoPrice, innerHTML: `£${price}`}],
        ]],
      ]]
  );
}

export {ProductCard};
