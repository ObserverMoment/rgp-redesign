import {formatMoney} from '@shopify/theme-currency';
import {render, elems} from '../utils/Renderer';
import {calculateRate, options} from '../utils/shipping_calc';
import {deliveryDisplayTexts} from '../utils/shipping_rates';
import {Store} from '../utils/Store';
import {SortDownIcon} from '../utils/icons';

const {Root, Div} = elems;

const SAVEDSHIPPINGZONE = 'rg-shipping-zone';

let shippingRateId = 0;

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
 * @param product: shopifyProductObj
*/
function ShippingRate(parentElem, product) {
  shippingRateId++;
  // Product variants are always the same cost to ship.
  const sku = product.variants[0].sku.toLowerCase();

  // To see if a country / zone has been saved into local storage.
  const savedShippingZone = localStorage.getItem(SAVEDSHIPPINGZONE);

  const shippingRateState = Store({
    selectedRegion: savedShippingZone ? savedShippingZone : 'ukMainland',
    sku,
    dropdownOpen: false,
    shippingPrice: 0,
    shippingTime: 99,
  }, `shipping-rate-info-${shippingRateId}`);

  function formatDisplay(time, price) {
    // Set the total price into state.
    let display;
    if (time === 99) {
      // Non standard delivery.
      display = `<p class="undeliverable-area">${deliveryDisplayTexts[time]}</p>`;
    } else if (price[0] === 0) {
      display = `<p><strong>Free delivery</strong></p><p>${deliveryDisplayTexts[time]}</p>`;
    } else {
      display =
      `<p>First item: <strong>${formatMoney(price[0], theme.moneyFormat)}</strong>.
       Subsequent items: <strong>${formatMoney(price[1], theme.moneyFormat)}</strong></p>
      <p>${deliveryDisplayTexts[time]}</p>`;
    }
    return display;
  }

  function updateShippingInfo(newState, shippingInfoElem) {
    const {time, price} = calculateRate(newState.sku, newState.selectedRegion);

    shippingRateState.setState({shippingPrice: price, shippingTime: time});
    shippingInfoElem.innerHTML = formatDisplay(time, price);
  }

  function updateSelectedRegion(value) {
    shippingRateState.setState({selectedRegion: value, dropdownOpen: false});
    localStorage.setItem(SAVEDSHIPPINGZONE, value);
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
          [Div, {className: classes.shipSelectTo, innerHTML: 'Delivery to'}],
          [Div, {
            className: classes.shipSelectSelected,
            listeners: {
              click: [
                () => shippingRateState.setState({dropdownOpen: !shippingRateState.getState().dropdownOpen}),
              ],
            },
          }, [
            [Div, {
              className: classes.shipSelectSelectedText,
              postMountCallbacks: [
                (self) => updateSelectedText(shippingRateState.getState(), self),
              ],
              subscriptions: [
                (self) => shippingRateState.onAttributeUpdate((newState) => updateSelectedText(newState, self), 'selectedRegion'),
              ],
            }],
            [Div, {className: classes.shipSelectSelectedIcon, innerHTML: SortDownIcon}],
          ]],
          [Div, {
            className: classes.shipSelectDropdown,
            subscriptions: [
              (self) => shippingRateState.onAttributeUpdate((newState) => toggleDropdownState(newState, self), 'dropdownOpen'),
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
                  (self) => shippingRateState.onAttributeUpdate((newState) => setSelectionOption(newState, self), 'selectedRegion'),
                ],
              },
            ])),
          ]],
        ]],
        [Div, {
          className: classes.shipInfo,
          postMountCallbacks: [
            (self) => updateShippingInfo(shippingRateState.getState(), self),
          ],
          subscriptions: [
            (self) => shippingRateState.onAttributeUpdate((newState) => updateShippingInfo(newState, self), ['sku', 'selectedRegion']),
          ],
        }],
      ]],
    ],
  ]);
  // This allows parent elements to subscribe to changes in this state (i.e. when user selects a different zone.)
  return shippingRateState;
}

export {ShippingRate};
