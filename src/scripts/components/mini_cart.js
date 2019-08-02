import {getCartData} from '../utils/api';
import {render, formatMoney} from '../utils/Renderer';
import {ShoppingBasket} from '../utils/icons';

const getElements = {
  miniCartContainer: () => document.querySelector('[data-mini-cart-container]'),
};

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
  const miniCartContainer = getElements.miniCartContainer();

  const totalShippingCost = 99900;

  const totalCartPrice = data.items.reduce((acum, next) => {
    return acum + next.final_line_price;
  }, 0);

  render({
    Node: {root: miniCartContainer},
    children: [
      {Node: {className: classes.icon, innerHTML: ShoppingBasket}},
      {Node: {type: 'H2', innerHTML: 'Review your basket'}},
      ...data.items.map(({featured_image, product_title, variant_title, quantity, final_price, final_line_price}) => (
        {
          Node: {className: classes.cartLine}, children: [
            {
              Node: {className: classes.imageWrapper}, children: [
                {Node: {type: 'IMG', className: classes.imageElem, attributes: {src: featured_image.url}}},
              ],
            },
            {
              Node: {className: classes.info}, children: [
                {Node: {className: classes.infoTitle, innerHTML: `${product_title} (${variant_title})`}},
                {Node: {className: classes.infoUnit}, children: [
                  {Node: {className: classes.infoUnitPrice, innerHTML: `Per unit: ${formatMoney(final_price, 'GBP')}`}},
                  {Node: {className: classes.infoUnitQuantity, innerHTML: `Qty: ${quantity}`}},
                ]},
              ],
            },
            {
              Node: {className: classes.totalLinePrice, innerHTML: formatMoney(final_line_price, 'GBP')},
            },
          ],
        }
      )),
      {Node: {className: classes.shippingTotal}, children: [
        {Node: {type: 'SPAN', className: classes.shippingTotalTitle, innerHTML: 'Shipping'}},
        {Node: {type: 'SPAN', className: classes.shippingTotalAmount, innerHTML: formatMoney(totalShippingCost, 'GBP')}},
      ]},
      {Node: {className: classes.cartTotal}, children: [
        {Node: {type: 'SPAN', className: classes.cartTotalTitle, innerHTML: 'Total'}},
        {Node: {type: 'SPAN', className: classes.cartTotalAmount, innerHTML: formatMoney(totalCartPrice, 'GBP')}},
      ]},
    ],
  });
}

export {renderMiniCart};
