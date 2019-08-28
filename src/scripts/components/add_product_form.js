import {formatMoney} from '@shopify/theme-currency';
import {submitCartToCheckout} from '../utils/api';
import {elems} from '../utils/Renderer';
import {PadlockIcon} from '../utils/icons';

const {Div, Input, Label, H3, Button, Span, Link} = elems;

const classes = {
  wrapper: 'add-product',
  options: 'add-product__options',
  option: 'add-product__options__option',
  submit: 'add-product__submit',
  quantity: 'add-product__submit__quantity',
  updateQuantity: 'add-product__submit__quantity__update',
  displayQuantity: 'add-product__submit__quantity__display',
  price: 'add-product__submit__price',
  submitBtn: 'add-product__submit-btn',
  error: 'add-product__error',
  success: 'add-product__success',
  successMsg: 'add-product__success__msg',
  successBtns: 'add-product__success__btns',
  reviewCart: 'add-product__success__btns__review-cart',
  checkout: 'add-product__success__btns__checkout',
  show: 'show',
};

let addProductFormId = 0;
function AddProductForm(productState, onQuantityUpdate, onOptionSelect, onSubmit) {

  addProductFormId++;
  const getElements = {
    inputElem: () => document.querySelector(`[data-add-product-form-${addProductFormId}]`),
  };

  const initState = productState.getState();
  const {options, variants, currentVariantId, error} = initState;

  // This should first check to see if a variant is selected - otherwise default to this.
  const initialPrice = currentVariantId
    ? variants.find((variant) => currentVariantId === variant.id).price
    : variants[0].price;

  function isSelected(optionName, optionValue) {
    return productState.getState()[optionName] === optionValue
      ? {checked: true}
      : {};
  }

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

  function getButtonText(state) {
    if (state.variantRequired) {
      if (!state.currentVariantId) {
        return 'Select option(s)';
      } else if (state.variants.find((variant) => variant.id === state.currentVariantId).available) {
        return 'Add to cart';
      } else {
        return 'Sorry, out of stock';
      }
    } else if (state.variants[0].available) {
      return 'Add to cart';
    } else {
      return 'Sorry, out of stock';
    }
  }

  function initSubmitButtonText() {
    return getButtonText(initState);
  }

  function updateSubmitButtonText(newState, buttonTextElem) {
    buttonTextElem.innerHTML = getButtonText(newState);
  }

  function isDisabled(state) {
    if (state.variantRequired) {
      if (state.currentVariantId && state.variants.find((variant) => variant.id === state.currentVariantId).available) {
        return false;
      } else {
        return true;
      }
    } else if (state.variants[0].available) {
      return false;
    } else {
      return true;
    }
  }

  function initSubmitButton() {
    return isDisabled(initState)
      ? {disabled: true}
      : {};
  }

  function updateSubmitButton(newState, inputElem) {
    if (isDisabled(newState)) {
      inputElem.setAttribute('disabled', true);
    } else {
      inputElem.removeAttribute('disabled');
    }
  }

  function updateErrorInfo(newState, errorDisplayElem) {
    if (newState.error) {
      const words = newState.error.split(' ');
      const variantText = newState.variantRequired
        ? ` in ${newState.variants.find(
          (variant) => newState.currentVariantId === variant.id,
          ).title}.`
        : '.';
      const errorText = words[0] === 'All'
        ? `You've already added all ${words[1]} available${variantText}`
        : 'Sorry, we don\'t have that many in stock';
      errorDisplayElem.classList.add(classes.show);
      errorDisplayElem.innerHTML = errorText;
    } else {
      errorDisplayElem.classList.remove(classes.show);
      errorDisplayElem.innerHTML = '';
    }
  }

  function updateAddSuccessInfo(newState, successInfoElem) {
    if (newState.addedToCart) {
      successInfoElem.classList.add(classes.show);
    } else {
      successInfoElem.classList.remove(classes.show);
    }
  }

  return {
    view: () => ([
      Div, {className: classes.wrapper}, [
        [Div, {className: classes.options}, [
          ...options.filter((opt) => opt.name !== 'Title').map((option) => ([
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
                        (self) => productState.onAttributeUpdate(
                          (newState) => updateCheckedAttr(newState, self, option.name, value), 'variantRequired',
                        ),
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
        [Div, {className: classes.submit}, [
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
                (self) => productState.onAttributeUpdate((newState) => updateInputElem(newState, self), 'currentQuantity'),
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
              (self) => productState.onAttributeUpdate(
                (newState) => updatePriceElem(newState, self), ['currentVariantId', 'currentQuantity'],
              ),
            ],
          }],
          [Div, {
            className: classes.error,
            innerHTML: error,
            subscriptions: [
              (self) => productState.onAttributeUpdate((newState) => updateErrorInfo(newState, self), 'error'),
            ],
          }],
        ]],
        [Button, {
          className: classes.submitBtn,
          attributes: {name: 'add', ...initSubmitButton()},
          listeners: {click: onSubmit},
          subscriptions: [
            (self) => productState.onAttributeUpdate(
              (newState) => updateSubmitButton(newState, self), ['variantRequired', 'currentVariantId'],
            ),
          ],
        }, [
          [Span, {
            innerHTML: initSubmitButtonText(productState),
            subscriptions: [
              (self) => productState.onAttributeUpdate(
                (newState) => updateSubmitButtonText(newState, self), ['variantRequired', 'currentVariantId'],
              ),
            ],
          }],
          [Span, {innerHTML: '<i class="fas fa-plus"></i>'}],
        ]],
        [Div, {
          className: classes.success,
          subscriptions: [
            (self) => productState.onAttributeUpdate(
              (newState) => updateAddSuccessInfo(newState, self), 'addedToCart',
            ),
          ],
        }, [
          [Div, {className: classes.successMsg, innerHTML: '&#10003; Added to cart!'}],
          [Div, {className: classes.successBtns}, [
            [Link, {className: classes.reviewCart, innerHTML: 'View cart', attributes: {href: '/cart'}}],
            [Button, {
              className: classes.checkout,
              listeners: {click: [submitCartToCheckout]},
            }, [
              [Span, {innerHTML: PadlockIcon}],
              [Span, {innerHTML: 'Checkout'}],
            ]],
          ]],
        ]],
      ],
    ]),
  };
}

export {AddProductForm};
