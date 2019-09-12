import {render, elems} from '../utils/Renderer';
import {calculateRate, options} from '../utils/shipping';
import {Store} from '../utils/Store';

const {Root, Div, Select, Option} = elems;

let shippingInfoId = 0;

function ShippingInfo(parentElem, productSku) {
  shippingInfoId++;
  const shippingState = Store({selectedRegion: 'ukMainland', sku: productSku}, `shipping-info-${shippingInfoId}`);

  function formatDisplay({time, price}) {
    let display;
    if (!price) {
      display = `<p>${time}</p>`;
    } else if (price === 'free') {
      display = `<p>Free delivery</p><p>${time}</p>`;
    } else {
      display = `<p>£${price}</p><p>${time}</p>`;
    }

    return display;
  }

  function updateShippingInfo({sku, selectedRegion}, shippingInfoElem) {
    const {time, price} = calculateRate(sku, selectedRegion);
    shippingInfoElem.innerHTML = formatDisplay({time, price});
  }

  render([
    Root, {rootElem: parentElem}, [
      [Div, {innerHTML: 'Shipping to'}, [
        [Select, {
          listeners: {
            input: [(event) => shippingState.setState({selectedRegion: event.target.value})],
          },
        }, [
          ...options.map(({value, text}) => ([
            Option, {attributes: {value}, innerHTML: text},
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
