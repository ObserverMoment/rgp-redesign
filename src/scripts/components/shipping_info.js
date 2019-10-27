import {formatMoney} from '@shopify/theme-currency';
import {render, elems} from '../utils/Renderer';
import {calculateRate, options} from '../utils/shipping_calc';
import {deliveryDisplayTexts} from '../utils/shipping_rates';
import {Store} from '../utils/Store';
import {SortDownIcon} from '../utils/icons';

const {Root, Div} = elems;

let shippingInfoId = 0;

const classes = {
  shipping: 'shipping',
  shipSelect: 'shipping__select',
  shipSelectTo: 'shipping__select__to',
  shipSelectSelected: 'shipping__select__selected',
  shipSelectSelectedText: 'shipping__select__selected__text',
  shipSelectSelectedIcon: 'shipping__select__selected__icon',
  shipSelectDropdown: 'shipping__select__dropdown',
  shipSelectDropdownOption: 'shipping__select__dropdown__option',
  shipInfo: 'shipping__info',
  open: 'open',
  active: 'active',
};

/*
 * @param items: [{quantity: number, product: shopifyProductObj || shopifyCartItemObj}]
*/
function ShippingInfo(parentElem, items = []) {

  shippingInfoId++;
  // Cast single objects to an array.
  const itemsArray = Array.isArray(items) ? items : [items];

  // Format into objects of {quantity, sku}. Where sku code does not include variant info such as color.
  const formattedData = itemsArray.map((item) => {
    let sku;
    // Is this a product object, or a cart object.
    if (item.variant_id) {
      // Cart item obj.
      // The sku is already formatted.
      sku = item.sku.toLowerCase();
    } else {
      // Product obj.
      // Product variants are always the same cost to ship.
      sku = item.product.variants[0].sku.toLowerCase();
    }
    return {quantity: item.quantity, sku};
  });

  // To see if a country / zone has been saved into local storage.
  const savedShippingZone = localStorage.getItem('rg-shipping-zone');

  const shippingState = Store({
    selectedRegion: savedShippingZone ? savedShippingZone : 'ukMainland',
    products: formattedData,
    dropdownOpen: false,
    shippingPrice: 0,
    shippingTime: 99,
  }, `shipping-info-${shippingInfoId}`);

  function formatDisplay({time, price}) {
    // Set the total price into state.
    let display;
    if (time === 99) {
      // Non standard delivery.
      display = `<p class="undeliverable-area">${deliveryDisplayTexts[time]}</p>`;
    } else if (price === 0) {
      display = `<p>Free delivery</p><p>${deliveryDisplayTexts[time]}</p>`;
    } else {
      display =
      `<p>Delivery cost: ${formatMoney(price, theme.moneyFormat)}</p><p>${deliveryDisplayTexts[time]}</p>`;
    }
    return display;
  }

  function updateShippingInfo(newState, shippingInfoElem) {
    // Remove any products with quantity of zero before calculating.
    const validProducts = newState.products.filter((product) => product.quantity > 0);

    const delInfo = validProducts.reduce((total, nextProduct) => {
      const {time, price} = calculateRate(nextProduct.sku, newState.selectedRegion);
      total.time = Math.max(time, total.time);
      total.price += price * nextProduct.quantity;
      return total;
    }, {time: 1, price: 0});
    // NOTE: Add discount calculation here?
    shippingState.setState({shippingPrice: delInfo.price, shippingTime: delInfo.time});
    shippingInfoElem.innerHTML = formatDisplay(delInfo);
  }

  function updateSelectedRegion(value) {
    shippingState.setState({selectedRegion: value, dropdownOpen: false});
    localStorage.setItem('rg-shipping-zone', value);
  }

  function updateSelectedText(newState, selectedTextElem) {
    selectedTextElem.innerHTML = options.find((opt) => opt.value === newState.selectedRegion).text;
  }

  function toggleDropdownState(newState, dropdownElem) {
    if (newState.dropdownOpen) {
      dropdownElem.classList.add(classes.open);
    } else {
      dropdownElem.classList.remove(classes.open);
    }
  }

  function setSelectionOption(newState, optionElement) {
    if (newState.selectedRegion === optionElement.dataset.value) {
      optionElement.classList.add(classes.active);
    } else {
      optionElement.classList.remove(classes.active);
    }
  }

  render([
    Root, {rootElem: parentElem}, [
      [Div, {className: classes.shipping}, [
        [Div, {className: classes.shipSelect}, [
          [Div, {className: classes.shipSelectTo, innerHTML: 'Ship to'}],
          [Div, {
            className: classes.shipSelectSelected,
            listeners: {
              click: [
                () => shippingState.setState({dropdownOpen: !shippingState.getState().dropdownOpen}),
              ],
            },
          }, [
            [Div, {
              className: classes.shipSelectSelectedText,
              postMountCallbacks: [
                (self) => updateSelectedText(shippingState.getState(), self),
              ],
              subscriptions: [
                (self) => shippingState.onAttributeUpdate((newState) => updateSelectedText(newState, self), 'selectedRegion'),
              ],
            }],
            [Div, {className: classes.shipSelectSelectedIcon, innerHTML: SortDownIcon}],
          ]],
          [Div, {
            className: classes.shipSelectDropdown,
            subscriptions: [
              (self) => shippingState.onAttributeUpdate((newState) => toggleDropdownState(newState, self), 'dropdownOpen'),
            ],
          }, [
            ...options.map(({value, text}) => ([
              Div, {
                className: `${classes.shipSelectDropdownOption} `,
                innerHTML: text,
                attributes: {'data-value': value},
                listeners: {
                  click: [() => updateSelectedRegion(value)],
                },
                subscriptions: [
                  (self) => shippingState.onAttributeUpdate((newState) => setSelectionOption(newState, self), 'selectedRegion'),
                ],
              },
            ])),
          ]],
        ]],
        [Div, {
          className: classes.shipInfo,
          postMountCallbacks: [
            (self) => updateShippingInfo(shippingState.getState(), self),
          ],
          subscriptions: [
            (self) => shippingState.onAttributeUpdate((newState) => updateShippingInfo(newState, self), ['products', 'selectedRegion']),
          ],
        }],
      ]],
    ],
  ]);
  // This allows parent elements to subscribe to changes in this state (i.e. when user selects a different zone.)
  return shippingState;
}

export {ShippingInfo};
