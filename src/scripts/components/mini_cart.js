import {getCartData, submitCartToCheckout} from '../utils/api';
import {render, formatMoney, elems} from '../utils/Renderer';
import {ShoppingBasket} from '../utils/icons';

const getElements = {
  // headerMinicartQty is rendered in header.liquid.
  headerMinicartQty: () => document.querySelector('[data-cart-mini-qty]'),
  miniCartContainer: () => document.querySelector('[data-mini-cart-container]'),
  submitCartButton: () => document.querySelector('[data-mini-cart-checkout]'),
};

(function addListeners() {
  getElements.submitCartButton().addEventListener('click', async () => {
    await submitCartToCheckout();
  });
})();

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

async function renderMiniCart() {
  const data = await getCartData();

  getElements.headerMinicartQty().innerHTML = data.item_count;
  const miniCartContainer = getElements.miniCartContainer();

  // Clear any previously rendered cart.
  // !!NOTE: This is only safe to do if there are definitely no event listeners on its children!!
  // Otherwise this would lead to memory leaks.
  miniCartContainer.innerHTML = '';

  const totalShippingCost = 'TODO';

  const totalCartPrice = data.items.reduce((acum, next) => {
    return acum + next.final_line_price;
  }, 0);

  const {Root, Div, H2, Img, Span, Link} = elems;

  render([
    Root, {rootElem: miniCartContainer}, [
      [Div, {className: classes.icon, innerHTML: ShoppingBasket}],
      [H2, {innerHTML: 'Your basket'}],
      ...data.items.map(
        ({featured_image, product_title, variant_title, quantity, final_price, final_line_price, url}) => (
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
          ]]),
      ),
      [Div, {className: classes.shippingTotal}, [
        [Span, {className: classes.shippingTotalTitle, innerHTML: 'Shipping'}],
        [Span, {className: classes.shippingTotalAmount, innerHTML: formatMoney(totalShippingCost, 'GBP')}],
      ]],
      [Div, {className: classes.cartTotal}, [
        [Span, {className: classes.cartTotalTitle, innerHTML: 'Total'}],
        [Span, {className: classes.cartTotalAmount, innerHTML: formatMoney(totalCartPrice, 'GBP')}],
      ]],
    ],
  ]);
}

export {renderMiniCart};
