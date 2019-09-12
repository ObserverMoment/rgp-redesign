import {render, elems} from '../utils/Renderer';
import {calculateRate, options} from '../utils/shipping';
import {deliveryDisplayTexts} from '../utils/shipping_rates';
import {Store} from '../utils/Store';
import {SortDownIcon} from '../utils/icons';

const {Root, Div} = elems;

let shippingInfoId = 0;

const classes = {
  shipInfo: 'shipping-info',
  shipInfoSelected: 'shipping-info__selected',
  shipInfoSelectedText: 'shipping-info__selected__text',
  shipInfoSelectedIcon: 'shipping-info__selected__icon',
  shipInfoDropdown: 'shipping-info__dropdown',
  shipInfoDropdownOption: 'shipping-info__dropdown__option',
  open: 'open',
  active: 'active',
};

/*
 * @param products: [{quantity, sku}, {quantity, sku}]
*/
function ShippingInfo(parentElem, products = []) {

  shippingInfoId++;
  const shippingState = Store({
    selectedRegion: 'ukMainland',
    products: Array.isArray(products) ? products : [products],
    dropdownOpen: false,
  }, `shipping-info-${shippingInfoId}`);

  function formatDisplay({time, price}) {
    let display;
    if (time === 99) {
      // Non standard delivery.
      display = `<p>${deliveryDisplayTexts[time]}</p>`;
    } else if (price === 0) {
      display = `<p>Free delivery</p><p>${deliveryDisplayTexts[time]}</p>`;
    } else {
      display = `<p>£${price}</p><p>${deliveryDisplayTexts[time]}</p>`;
    }
    return display;
  }

  function updateShippingInfo(newState, shippingInfoElem) {
    const delInfo = newState.products.reduce((total, nextProduct) => {
      const {time, price} = calculateRate(nextProduct.sku, newState.selectedRegion);
      total.time = Math.max(time, total.time);
      total.price += price * nextProduct.quantity;
      return total;
    }, {time: 1, price: 0});
    shippingInfoElem.innerHTML = formatDisplay(delInfo);
  }

  function updateSelectedRegion(value) {
    shippingState.setState({selectedRegion: value, dropdownOpen: false});
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
      [Div, {className: classes.shipInfo, innerHTML: 'Shipping to'}, [
        [Div, {
          className: classes.shipInfoSelected,
          listeners: {
            click: [
              () => shippingState.setState({dropdownOpen: !shippingState.getState().dropdownOpen}),
            ],
          },
        }, [
          [Div, {
            className: classes.shipInfoSelectedText,
            postMountCallbacks: [
              (self) => updateSelectedText(shippingState.getState(), self),
            ],
            subscriptions: [
              (self) => shippingState.onAttributeUpdate((newState) => updateSelectedText(newState, self), 'selectedRegion'),
            ],
          }],
          [Div, {className: classes.shipInfoSelectedIcon, innerHTML: SortDownIcon}],
        ]],
        [Div, {
          className: classes.shipInfoDropdown,
          subscriptions: [
            (self) => shippingState.onAttributeUpdate((newState) => toggleDropdownState(newState, self), 'dropdownOpen'),
          ],
        }, [
          ...options.map(({value, text}) => ([
            Div, {
              className: `${classes.shipInfoDropdownOption} `,
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
        postMountCallbacks: [
          (self) => updateShippingInfo(shippingState.getState(), self),
        ],
        subscriptions: [
          (self) => shippingState.onAttributeUpdate((newState) => updateShippingInfo(newState, self), 'selectedRegion'),
        ],
      }],
    ],
  ]);
}

export {ShippingInfo};
