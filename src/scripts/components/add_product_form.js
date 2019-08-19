import {formatMoney} from '@shopify/theme-currency';
import {elems} from '../utils/Renderer';

const {Div, Input, Label, H3, Button, Span} = elems;

const classes = {
  wrapper: 'add-product',
  options: 'add-product__options',
  option: 'add-product__options__option',
  quantity: 'add-product__quantity',
  updateQuantity: 'add-product__quantity__update',
  displayQuantity: 'add-product__quantity__display',
  price: 'add-product__price',
  submit: 'add-product__submit',
};

let addProductFormId = 0;
function AddProductForm(productState, onQuantityUpdate, onOptionSelect, onSubmit) {

  addProductFormId++;
  const getElements = {
    inputElem: () => document.querySelector(`[data-add-product-form-${addProductFormId}]`),
  };

  const {options, variants, currentVariantId} = productState.getState();
  const curVariant = variants.find((variant) => variant.id === currentVariantId);

  // This should first check to see if a variant is selected - otherwise default to this.
  const initialPrice = currentVariantId
    ? variants.find((variant) => currentVariantId === variant.id).price
    : variants[0].price;

  function isDisabled() {
    return curVariant && curVariant.available
      ? {}
      : {disabled: true};
  }

  function isSelected(optionName, optionValue) {
    return productState.getState()[optionName] === optionValue
      ? {checked: true}
      : {};
  }

  // Updater functions - via state subscription.
  function updateInputElem(newState, inputElem) {
    inputElem.value = newState.currentQuantity;
  }

  function updatePriceElem(newState, priceElem) {
    const variantId = newState.currentVariantId || newState.variants[0].id;
    const unitPrice = variants.find((variant) => variantId === variant.id).price;
    priceElem.innerHTML = formatMoney(unitPrice * newState.currentQuantity, theme.moneyFormat);
  }

  function updateCheckedAttr(newState, inputElem, optionName, optionValue) {
    if (newState[optionName] === optionValue) {
      inputElem.setAttribute('checked', '');
    } else {
      inputElem.removeAttribute('checked');
    }
  }

  function updateSubmitButton(newState, inputElem) {
    if (newState.variants.find((variant) => variant.id === newState.currentVariantId).available) {
      inputElem.removeAttribute('disabled');
    } else {
      inputElem.setAttribute('disabled', true);
    }
  }

  function updateSubmitButtonText(newState, buttonTextElem) {
    if (newState.variants.find((variant) => variant.id === newState.currentVariantId).available) {
      buttonTextElem.innerHTML = 'Add to cart';
    } else {
      buttonTextElem.innerHTML = 'Sorry, out of stock';
    }
  }

  return {
    view: () => ([
      Div, {className: classes.wrapper}, [
        [Div, {className: classes.options}, [
          ...options.map((option) => ([
            Div, {className: classes.option}, [
              [H3, {innerHTML: `Select ${option.name.toLowerCase()}`}],
              [Div, {className: `${classes.option}__${option.name}`}, [
                ...option.values.map((value) => ([
                  Div, {className: `${classes.option}__${option.name}__value`}, [
                    [Input, {
                      attributes: {
                        type: 'radio', id: `input-${option.name}-${value}`, value, name: option.name, ...isSelected(option.name, value),
                      },
                      subscriptions: [
                        (self) => productState.onStateUpdate((newState) => updateCheckedAttr(newState, self, option.name, value)),
                      ],
                    }],
                    [Label, {
                      className: `${value}`,
                      attributes: {for: `input-${option.name}-${value}`},
                      listeners: {click: [
                        () => onOptionSelect(option.name, value),
                      ]},
                    }],
                  ],
                ])),
              ]],
            ],
          ])),
        ]],
        [Div, {className: classes.quantity}, [
          [Div, {
            className: classes.updateQuantity,
            innerHTML: '<i class="far fa-minus-square"></i>',
            listeners: {click: [() => onQuantityUpdate(Math.max(1, parseInt(getElements.inputElem().value, 10) - 1))]},
          }],
          [Input, {
            className: classes.displayQuantity,
            attributes: {type: 'number', name: 'quantity', value: '1', min: '1', [`data-add-product-form-${addProductFormId}`]: ''},
            listeners: {change: [(event) => onQuantityUpdate(parseInt(event.target.value, 10))]},
            subscriptions: [
              (self) => productState.onStateUpdate((newState) => updateInputElem(newState, self)),
            ],
          }],
          [Div, {
            className: classes.updateQuantity,
            innerHTML: '<i class="far fa-plus-square"></i>',
            listeners: {click: [() => onQuantityUpdate(Math.max(1, parseInt(getElements.inputElem().value, 10) + 1))]},
          }],
        ]],
        [Div, {
          className: classes.price,
          innerHTML: formatMoney(initialPrice, theme.moneyFormat),
          attributes: {[`data-add-product-form-price-${addProductFormId}`]: ''},
          subscriptions: [
            (self) => productState.onStateUpdate((newState) => updatePriceElem(newState, self)),
          ],
        }],
        [Button, {
          className: classes.submit,
          attributes: {name: 'add', ...isDisabled()},
          listeners: {click: onSubmit},
          subscriptions: [
            (self) => productState.onStateUpdate((newState) => updateSubmitButton(newState, self)),
          ],
        }, [
          [Span, {
            innerHTML: curVariant.available ? 'Add to cart' : 'Out of stock',
            subscriptions: [
              (self) => productState.onStateUpdate((newState) => updateSubmitButtonText(newState, self)),
            ],
          }],
          [Span, {innerHTML: '<i class="fas fa-plus"></i>'}],
        ]],
      ],
    ]),
  };
}

export {AddProductForm};
