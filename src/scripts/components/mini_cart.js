import {formatMoney} from '@shopify/theme-currency';
import {getCartData, submitCartToCheckout} from '../utils/api';
import {render, elems} from '../utils/Renderer';
import {MiniCartLine} from './mini_cart_line';
import {ShoppingBasketIcon, PadlockIcon} from '../utils/icons';
import {Store} from '../utils/Store';
import {ShippingInfo} from './shipping_info';

const {Root, Div, H2, Span, Link, Button} = elems;

const getElements = {
  // headerMinicartQty is rendered in header.liquid.
  headerMinicartQty: () => document.querySelector('[data-cart-mini-qty]'),
  miniCartContainer: () => document.querySelector('[data-mini-cart-container]'),
  submitCartButton: () => document.querySelector('[data-mini-cart-checkout]'),
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
  actions: `${wrapperClass}__actions`,
  toCartBtn: `${wrapperClass}__actions__cart`,
  toCheckoutBtn: `${wrapperClass}__actions__checkout`,
};

let miniCartId = 0;
const miniCartState = Store({id: miniCartId}, 'mini-cart');

async function renderMiniCart() {
  miniCartId += 1;
  const data = await getCartData();
  miniCartState.setState({
    id: miniCartId,
    subtotal: 0,
    shipping: 0,
    total: 0,
  });

  getElements.headerMinicartQty().innerHTML = data.item_count;
  const miniCartContainer = getElements.miniCartContainer();

  miniCartContainer.innerHTML = '';

  const subtotal = data.items.reduce((acum, next) => {
    return acum + next.final_line_price;
  }, 0);

  miniCartState.setState({subtotal});

  function renderShippingComponent(shippingTotalElem, items) {
    // ShippingInfo renders the component and also returns the state object.
    if (!items || items.length < 1) {
      return;
    }
    const shippingState = ShippingInfo(shippingTotalElem, items);
    miniCartState.setState({shippingState});
  }

  function updateCartTotal(cartState, cartTotalAmountElem) {
    const {shippingPrice} = cartState.shippingState.getState();
    const {subtotal: cartSubTotal} = cartState;
    cartTotalAmountElem.innerHTML = formatMoney(cartSubTotal + shippingPrice, theme.moneyFormat);
  }

  const noItems = !data || !data.items || (!data.items.length > 0);

  if (noItems) {
    render([
      Root, {rootElem: miniCartContainer}, [
        [Div, {className: classes.icon, innerHTML: ShoppingBasketIcon}],
        [H2, {innerHTML: 'Nothing here yet!'}],
      ]]);
  } else {
    render([
      Root, {rootElem: miniCartContainer}, [
        [Div, {className: classes.icon, innerHTML: ShoppingBasketIcon}],
        [H2, {innerHTML: 'Your basket'}],
        ...data.items.map((lineItemObj) => MiniCartLine(lineItemObj)),
        [Div, {
          className: classes.shippingTotal,
          postMountCallbacks: [
            (self) => renderShippingComponent(self, data.items),
          ],
        }],
        [Div, {className: classes.cartTotal}, [
          [Span, {className: classes.cartTotalTitle, innerHTML: 'Total'}],
          [Span, {
            className: classes.cartTotalAmount,
            postMountCallbacks: [
              (self) => updateCartTotal(miniCartState.getState(), self),
            ],
            subscriptions: [
            // Subscribe to the shipping state updates...which is saved as an attribute in miniCartState.
              (self) => miniCartState.getState().shippingState.onAttributeUpdate(() =>
                updateCartTotal(miniCartState.getState(), self), 'shippingPrice'),
            ],
          }],
        ]],
        [Div, {className: classes.actions}, [
          [Link, {attributes: {href: '/cart'}}, [
            [Button, {className: classes.toCartBtn, innerHTML: 'View cart'}],
          ]],
          [Button, {
            className: classes.toCheckoutBtn,
            listeners: {click: [submitCartToCheckout]},
            subscriptions: [
              (self) => miniCartState.onAttributeUpdate(() => self.removeEventListener('click', submitCartToCheckout), 'id'),
            ],
          }, [
            [Span, {innerHTML: PadlockIcon}],
            [Span, {innerHTML: 'Checkout'}],
          ]],
        ]],
      ],
    ]);
  }
}

export {renderMiniCart};
