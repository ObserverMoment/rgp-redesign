import {formatMoney} from '@shopify/theme-currency';
import {Store, storeEvents, stateEventEmitter} from '../utils/Store';
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
function AddProductForm(product, onSubmit) {
  addProductFormId++;
  const getElements = {
    inputElem: () => document.querySelector(`[data-add-product-form-${addProductFormId}]`),
  };

  // Create form state.
  const productFormState = Store({
    productId: product.id,
    variants: product.variants,
    options: product.options,
    quantity: 1,
    unitPrice: product.final_price,
  }, `add-product-form-${product.id}`);

  // This should first check to see if a variant is selected - otherwise default to this.
  const price = product.variants[0].price;

  /*
    Listeners.
      Option-Colour - onClick.
      Input - onChange.
      Decrement - onClick.
      Increment - onClick.
      Submit - onClick
  */
  function updateQuantity(delta) {
    const inputElem = getElements.inputElem();
    const newValue = Math.max(1, parseInt(inputElem.value, 10) + delta);
    inputElem.setAttribute('value', newValue);
  }

  return {
    state: productFormState,
    view: () => ([
      Div, {className: classes.wrapper}, [
        [Div, {className: classes.options}, [
          ...product.options.map((option) => ([
            Div, {className: classes.option}, [
              [H3, {innerHTML: `Select ${option.name.toLowerCase()}`}],
              [Div, {className: `${classes.option}__${option.name}`}, [
                ...option.values.map((value) => ([
                  Div, {className: `${classes.option}__${option.name}__value`}, [
                      [Input, {attributes: {type: 'radio', name: value}}],
                      [Label, {className: `${value}`}],
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
            listeners: {click: [() => updateQuantity(-1)]},
          }],
          [Input, {
            className: classes.displayQuantity,
            attributes: {type: 'number', name: 'quantity', value: '1', min: '1', [`data-add-product-form-${addProductFormId}`]: ''},
          }],
          [Div, {
            className: classes.updateQuantity,
            innerHTML: '<i class="far fa-plus-square"></i>',
            listeners: {click: [() => updateQuantity(1)]},
          }],
        ]],
        [Div, {className: classes.price, innerHTML: formatMoney(price, theme.moneyFormat)}],
        [Button, {
          className: classes.submit,
          attributes: {name: 'add'},
          listeners: {click: onSubmit},
        }, [
          [Span, {innerHTML: 'Add to cart'}],
          [Span, {innerHTML: '<i class="fas fa-plus"></i>'}],
        ]],
      ],
    ]),
  };
}

export {AddProductForm};
