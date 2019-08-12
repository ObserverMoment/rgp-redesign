import {elems, formatMoney} from '../utils/Renderer';

const {Div, Img, Link} = elems;

const wrapperClass = 'mini-cart';

const classes = {
  icon: `${wrapperClass}__icon`,
  cartLine: `${wrapperClass}__line`,
  imageWrapper: `${wrapperClass}__line__image`,
  imageElem: `${wrapperClass}__line__image__elem`,
  info: `${wrapperClass}__line__info`,
  infoTitle: `${wrapperClass}__line__info__title`,
  infoUnit: `${wrapperClass}__line__info__unit`,
  infoUnitPrice: `${wrapperClass}__line__info__unit__price`,
  infoUnitQuantity: `${wrapperClass}__line__info__unit__quantity`,
  totalLinePrice: `${wrapperClass}__line__total-price`,
  removeLine: `${wrapperClass}__line__remove-line`,
  shippingTotal: `${wrapperClass}__shipping-total`,
  shippingTotalTitle: `${wrapperClass}__shipping-total__title`,
  shippingTotalAmount: `${wrapperClass}__shipping-total__amount`,
  cartTotal: `${wrapperClass}__cart-total`,
  cartTotalTitle: `${wrapperClass}__cart-total__title`,
  cartTotalAmount: `${wrapperClass}__cart-total__amount`,
};

function MiniCartLine(lineItemObj) {
  const {featured_image, product_title, variant_title, quantity, final_price, final_line_price, url} = lineItemObj;
  console.log('rendering line item', lineItemObj);
  return (
  [Div, {className: classes.cartLine}, [
    [Div, {className: classes.imageWrapper}, [
      [Img, {className: classes.imageElem, attributes: {src: featured_image.url}}],
    ]],
    [Div, {className: classes.info}, [
      [Link, {attributes: {href: url}}, [
        [Div, {className: classes.infoTitle, innerHTML: `${product_title} (${variant_title})`}],
      ]],
      [Div, {className: classes.infoUnit}, [
        [Div, {className: classes.infoUnitPrice, innerHTML: `Per unit: ${formatMoney(final_price, 'GBP')}`}],
        [Div, {className: classes.infoUnitQuantity, innerHTML: `Qty: ${quantity}`}],
      ]],
    ]],
    [Div, {className: classes.totalLinePrice, innerHTML: formatMoney(final_line_price, 'GBP')}],
  ]]
  );
}

export {MiniCartLine};
