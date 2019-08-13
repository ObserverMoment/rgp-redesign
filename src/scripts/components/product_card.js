import {elems, formatMoney} from '../utils/Renderer';
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
};

// Returns a single array of the form required by Render.render().
// [Type, {config}, [children]]
function ProductCard(productObj, imageSize) {
  const {title, images, options} = productObj;
  const src = formImageSizeUrl(images[0].src, imageSize);
  const colours = (options.length > 0) && (options[0].name === 'Colour') && options[0].values;
  const tags = productObj.tags;
  return (
  [Div, {className: classes.card}, [
    [Div, {className: classes.meta}, [
      [Div, {className: classes.metaInfo}, tags && tags.map((tag) => [
        Span, {innerHTML: tag},
      ])],
      [Div, {className: classes.metaColours}, colours && colours.map((colour) => [
        Div, {className: `${classes.metaColours}__colour ${colour}`},
      ])],
    ]],
    [Div, {className: classes.image}, [
      [Img, {attributes: {src}}],
    ]],
    [Div, {className: classes.info}, [
      [Div, {className: classes.infoTitle, innerHTML: title}],
      [Div, {className: classes.infoPrice, innerHTML: formatMoney(99999, 'GBP')}],
    ]],
  ]]
  );
}

export {ProductCard};
