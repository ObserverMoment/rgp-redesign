/*
  Module / script for /cart page.
*/
import {formatMoney} from '@shopify/theme-currency';
import {debounce} from 'throttle-debounce';
import {getCartData, updateCartLineQuantity, updateCart, addItemsToCart} from '../utils/api';
import {renderMiniCart} from '../components/mini_cart';
import {ShippingTotal} from '../components/shipping_total';
import {Store} from '../utils/Store';

/*
  const lineStates = {
    lineKey1: {
      Store({
      lineRow: element,
      input: element,
      saveBtn: element,
      deleteBtn: element
      confirmSaveIcon: element,
      lineTotal: element,
      initialQuantity: number
      liveQuantity: number,
      unitPrice: number [7800 is £78]
      }, 'cart-line-lineKey1')
    },
    lineKey2: {
     etc
    }
  }
  NOTE: lineKey is the unique key code that shopify generates for each line in the shopping cart.
*/
// One store object for each cart line, plus a global state which holds the subtotal and the shipping total.
const lineStates = {};
const cartStates = {};

const getElements = {
  lineRows: () => document.querySelectorAll('[data-line-row]'),
  lineTotals: () => document.querySelectorAll('[data-line-total-price]'),
  quantityInputs: () => document.querySelectorAll('[data-quantity-input]'),
  quantityAdjustBtns: () => document.querySelectorAll('[data-quantity-adjust]'),
  quantitySaveBtns: () => document.querySelectorAll('[data-quantity-save-btn]'),
  confirmSavedIcons: () => document.querySelectorAll('[data-quantity-saved-icon]'),
  updateErrorElem: () => document.querySelector('[data-update-error]'),
  lineItemDeleteBtns: () => document.querySelectorAll('[data-line-delete-btn]'),
  subtotalPrice: () => document.querySelector('[data-subtotal-price]'),
  shippingPrice: () => document.querySelector('[data-delivery-price]'),
  totalPrice: () => document.querySelector('[data-total-price]'),
  orderNoteTextarea: () => document.querySelector('[data-order-note-textarea]'),
  confirmNoteSaved: () => document.querySelector('[data-note-saved-message]'),
  checkoutBtn: () => document.querySelector('[data-checkout-btn]'),
};

const classes = {
  show: 'show',
  fadeOut: 'fade-out',
};

(async function getInitialState() {
  const cartData = await getCartData();
  cartStates.cartData = cartData;

  const lineRows = [...getElements.lineRows()];
  const inputs = getElements.quantityInputs();
  const saveBtns = [...getElements.quantitySaveBtns()];
  const deleteBtns = [...getElements.lineItemDeleteBtns()];
  const confirmSavedIcons = [...getElements.confirmSavedIcons()];
  const lineTotals = [...getElements.lineTotals()];

  // Get data from inputs - line item key and line item quantity (input.val)
  inputs.forEach((input) => {
    const lineKey = input.dataset.lineKey;
    const lineRow = lineRows.find((row) => row.dataset.lineKey === lineKey);
    const unitPrice = lineRow.dataset.lineUnitPrice;
    const variantId = lineRow.dataset.lineVariantId;
    const sku = lineRow.dataset.lineSku.toLowerCase();
    // Save data for each line into a state object, accessible via shopify cart line key.
    lineStates[lineKey] = Store({
      lineRow,
      input,
      saveBtn: saveBtns.find((btn) => btn.dataset.lineKey === lineKey),
      deleteBtn: deleteBtns.find((btn) => btn.dataset.lineKey === lineKey),
      confirmSaveIcon: confirmSavedIcons.find((icon) => icon.dataset.lineKey === lineKey),
      lineTotal: lineTotals.find((price) => price.dataset.lineKey === lineKey),
      initialQuantity: parseInt(input.value, 10),
      liveQuantity: parseInt(input.value, 10),
      unitPrice,
      variantId,
      sku,
    }, `cart-line-${lineKey}`);

    // Setup subscribers to each state.
    lineStates[lineKey].onStateUpdate((newLineState) => {
      checkInputChange(newLineState);
    });
  });
  // Setup shipping state and render UI component.
  const shippingState = ShippingTotal(getElements.shippingPrice(), cartStates.cartData.items);
  cartStates.shippingState = shippingState;
  shippingState.onAttributeUpdate(() => updateTotal(), 'shippingPrice');

  updateTotal();
})();

(function addEventListeners() {
  // Listen to quantity events
  getElements.quantityInputs().forEach((input) => {
    input.addEventListener('change', (event) => {
      const lineKey = event.target.dataset.lineKey;
      const newValue = Math.max(0, parseInt(event.target.value, 10));
      lineStates[lineKey].setState({liveQuantity: newValue});
    });
  });

  // Listen to qty adjust increase events.
  getElements.quantityAdjustBtns().forEach((btn) => {
    btn.addEventListener('click', () => {
      const lineKey = btn.dataset.lineKey;
      const input = lineStates[lineKey].getState().input;
      const curValue = parseInt(input.value, 10);
      const newValue = btn.dataset.type === 'minus' ? Math.max(0, curValue - 1) : curValue + 1;
      // Update the input value.
      input.value = newValue;
      // Update state.
      lineStates[lineKey].setState({liveQuantity: newValue});
    });
  });

  // Handle save new quantities
  getElements.quantitySaveBtns().forEach((saveBtn) => {
    saveBtn.addEventListener('click', async (event) => {
      const lineKey = event.target.dataset.lineKey;
      const lineState = lineStates[lineKey];
      const initialQuantity = lineState.getState().initialQuantity;
      const newQuantity = lineState.getState().liveQuantity;
      const quantityChange = newQuantity - initialQuantity;

      // Check that you have enough stock to cover the new value.
      if (quantityChange <= 0) {
        // If quantity is decreased then go ahead and make the update.
        await updateCartLineQuantity({quantity: newQuantity, id: lineKey});
        onUpdateSuccess(lineKey);
      } else {
        // Else add the difference to the cart via addToCart api call - which will actually return errors if not successful.
        const res = await addItemsToCart({
          id: lineState.getState().variantId,
          quantity: quantityChange,
        });
        if (res.message === 'Cart Error') {
          const errorTxt = res.description.split(' ')[0] === 'All'
            ? res.description
            : 'Sorry, we don\'t have that many in stock';
          onUpdateFail(errorTxt);
        } else {
          onUpdateSuccess(lineKey);
        }
      }

      function onUpdateFail(errorMsg) {
        const errorDisplay = getElements.updateErrorElem();
        errorDisplay.innerHTML = errorMsg;
        errorDisplay.classList.add(classes.show);
        setTimeout(() => {
          errorDisplay.classList.remove(classes.show);
        }, 6000);
      }
    });
  });

  // Handle remove line from cart
  getElements.lineItemDeleteBtns().forEach((removeBtn) => {
    removeBtn.addEventListener('click', async (event) => {
      const {lineKey} = event.target.dataset;
      await updateCartLineQuantity({quantity: 0, id: lineKey});
      // Remove all elements associated with the deleted line.
      removeRow(lineKey);

      const {products} = cartStates.shippingState.getState();
      const curLineState = lineStates[lineKey].getState();
      const updatedProducts = products.filter((product) => product.sku !== curLineState.sku);
      // Then update the shippingState component.
      cartStates.shippingState.setState({products: updatedProducts});
    });
  });

  // Listen textarea user typing - automatic debounced api call.
  getElements.orderNoteTextarea().addEventListener('keyup', debounce(2000, async (event) => {
    await updateCart({note: event.target.value});
    const confirmNoteSaved = getElements.confirmNoteSaved();
    confirmNoteSaved.classList.add(classes.show);
    setTimeout(() => {
      confirmNoteSaved.classList.remove(classes.show);
    }, 2000);
  }));
})();

function onUpdateSuccess(lineKey) {
  // If quantity === 0 then you need to remove the whole lineRow element.
  // And update the shippingState by removing the item from the array.
  const {products} = cartStates.shippingState.getState();
  const curLineState = lineStates[lineKey].getState();
  const updatedQuantity = curLineState.liveQuantity;

  if (updatedQuantity === 0) {
    removeRow(lineKey);
    const updatedProducts = products.filter((product) => product.sku !== curLineState.sku);
    // Update the shippingState component.
    cartStates.shippingState.setState({products: updatedProducts});
  } else {
    // Update the initial quantity after change.
    lineStates[lineKey].setState({initialQuantity: updatedQuantity});
    curLineState.saveBtn.classList.remove(classes.show);
    curLineState.confirmSaveIcon.classList.add(classes.show);

    // Update line total.
    const newTotal = updatedQuantity * curLineState.unitPrice;
    curLineState.lineTotal.innerHTML = formatMoney(newTotal, theme.moneyFormat);

    const updatedProducts = products.map((product) =>
      (product.sku === curLineState.sku
        ? {sku: curLineState.sku, quantity: updatedQuantity}
        : product
    ));
    // Update the shippingState component.
    cartStates.shippingState.setState({products: updatedProducts});
  }

  updateTotal();
  renderMiniCart();
  setTimeout(() => {
    curLineState.confirmSaveIcon.classList.remove(classes.show);
  }, 4000);
}

function checkInputChange(newLineState) {
  // Show / hide save button.
  if (newLineState.liveQuantity === newLineState.initialQuantity) {
    newLineState.saveBtn.classList.remove(classes.show);
    newLineState.saveBtn.setAttribute('disabled', 'disabled');
  } else {
    newLineState.saveBtn.removeAttribute('disabled');
    newLineState.saveBtn.classList.add(classes.show);
  }
}

function removeRow(lineKey) {
  const {lineRow} = lineStates[lineKey].getState();
  lineRow.classList.add(classes.fadeOut);

  setTimeout(() => {
    // Fade out the node and then remove the line attribute from the state object.
    lineRow.parentNode.removeChild(lineRow);
    delete lineStates[lineKey];
    updateTotal();
    renderMiniCart();
  }, 1000);
}

// Based on current state - update subtotal display.
function calcSubtotal() {
  const sub = Object.keys(lineStates)
    .reduce((acum, lineKey) => {
      if (lineKey === 'shippingState') {
        return acum;
      } else {
        const {liveQuantity, unitPrice} = lineStates[lineKey].getState();
        const nextAcum = acum + (liveQuantity * unitPrice);
        return nextAcum;
      }
    }, 0);
  getElements.subtotalPrice().innerHTML = formatMoney(sub, theme.moneyFormat);
  return sub;
}

function checkDeliveryRegion({shippingTime}) {
  const checkoutBtn = getElements.checkoutBtn();
  if (shippingTime === 99) {
    // 99 means can't ship here as standard.
    checkoutBtn.setAttribute('disabled', 'disabled');
  } else {
    checkoutBtn.removeAttribute('disabled');
  }
}

function updateTotal() {
  const curShippingState = cartStates.shippingState.getState();
  // Make sure that we can actually deliver to the selected region. Else disable checkout btn.
  checkDeliveryRegion(curShippingState);
  // Calculate delivery and sub total.
  const {shippingPrice, shippingTime} = curShippingState;
  const subTotal = calcSubtotal();
  getElements.totalPrice().innerHTML = shippingTime === 99
    ? 'Contact us for delivery cost'
    : formatMoney(subTotal + shippingPrice, theme.moneyFormat);
}
