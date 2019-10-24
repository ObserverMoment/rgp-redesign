import {formatMoney} from '@shopify/theme-currency';
import {render, elems} from '../utils/Renderer';
import {ImageGallery} from './image_gallery_view';
import {Store} from '../utils/Store';

const {Root, Div, Span} = elems;

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
  showGalleryActions: 'show-gallery-actions',
};

// Returns a single array of the form required by Renderer.render().
// [Type, {config}, [children]]
function ProductCard(parentElement, productObj) {
  const {title, images, options, variants} = productObj;
  const price = variants[0] && variants[0].price;

  const colours = (options.length > 0) && (options[0].name === 'Colour') && options[0].values;
  const tags = productObj.tags;

  const galleryState = Store({curIndex: 0, imageWidths: [], curXTranslate: 0}, 'product-card-gallery');

  const isAvailable = variants.some((variant) => variant.available);

  function renderPriceText() {
    return isAvailable
      ? formatMoney(price, theme.moneyFormat)
      : `<strike>${formatMoney(price, theme.moneyFormat)}</strike> - Sold out`;
  }

  function renderImageGallery(parentElem) {
    const {getActionsElem} = ImageGallery(parentElem, images, galleryState);
    galleryState.setState({getActionsElem});
  }

  function handleMouseEnter() {
    if (galleryState.getState().getActionsElem) {
      galleryState.getState().getActionsElem().classList.add(classes.showGalleryActions);
    }
  }

  function handleMouseLeave() {
    if (galleryState.getState().getActionsElem) {
      galleryState.getState().getActionsElem().classList.remove(classes.showGalleryActions);
    }
  }

  render([
    Root, {rootElem: parentElement}, [
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
            [Div, {
              className: classes.image,
              postMountCallbacks: [
                (self) => renderImageGallery(self),
              ],
            }],
            [Div, {className: classes.info}, [
              [Div, {className: classes.infoTitle, innerHTML: title}],
              [Div, {className: classes.infoFooter}, [
                [Div, {className: classes.infoFooterPrice, innerHTML: renderPriceText()}],
              ]],
            ]],
          ],
      ],
    ],
  ]);
}

export {ProductCard};
