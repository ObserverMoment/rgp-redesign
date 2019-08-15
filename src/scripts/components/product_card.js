import {formatMoney} from '@shopify/theme-currency';
import {elems} from '../utils/Renderer';
import {ImageGallery} from './image_gallery_view';
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
  infoFooter: 'product-card__info__footer',
  infoFooterPrice: 'product-card__info__footer__price',
  infoFooterMore: 'product-card__info__footer__more',
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

  const imageGallery = enableGallery ? ImageGallery(imgUrls) : [Img, {attributes: {src: imgUrls[0]}}];

  function handleMouseEnter() {
    document.querySelector(`[${imageGallery.actionsElemRef}]`).classList.add(classes.showGalleryActions);
  }

  function handleMouseLeave() {
    document.querySelector(`[${imageGallery.actionsElemRef}]`).classList.remove(classes.showGalleryActions);
  }

  return (
  [
    Div, {
      className: classes.card,
      listeners: {
        mouseenter: [handleMouseEnter],
        mouseleave: [handleMouseLeave],
      }}, [
        [Div, {className: classes.meta}, [
          [Div, {className: classes.metaInfo}, tags && tags.map((tag) => [
            Span, {innerHTML: tag},
          ])],
          [Div, {className: classes.metaColours}, colours && colours.map((colour) => [
            Div, {className: `${classes.metaColours}__colour ${colour}`},
          ])],
        ]],
      [Div, {className: classes.image}, [enableGallery ? imageGallery.view() : imageGallery]],
        [Div, {className: classes.info}, [
          [Div, {className: classes.infoTitle, innerHTML: title}],
          [Div, {className: classes.infoFooter}, [
            [Div, {className: classes.infoFooterPrice, innerHTML: formatMoney(price, theme.moneyFormat)}],
            [Div, {className: classes.infoFooterMore, innerHTML: 'More info >'}],
          ]],
        ]],
      ]]
  );
}

export {ProductCard};