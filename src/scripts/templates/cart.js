/*
  Module / script for /cart page.
*/
import {formatMoney} from '@shopify/theme-currency';
import {debounce} from 'throttle-debounce';
import {updateCartLineQuantity, updateCart, addItemsToCart} from '../utils/api';
import {renderMiniCart} from '../components/mini_cart';


/*
  const state = {
    lineKey1: {
      lineRow: element,
      input: element,
      saveBtn: element,
      deleteBtn: element
      confirmSaveIcon: element,
      lineTotal: element,
      initialQuantity: number
      liveQuantity: number,
      unitPrice: number [7800 is £78]
    },
    lineKey2: {
     etc
    }
  }
  NOTE: lineKey is the unique key code that shopify generates for each line in the shopping cart.
*/
const state = {};

const getElements = {
  lineRows: () => document.querySelectorAll('[data-line-row]'),
  lineTotals: () => document.querySelectorAll('[data-line-total-price]'),
  quantityInputs: () => document.querySelectorAll('[data-quantity-input]'),
  quantitySaveBtns: () => document.querySelectorAll('[data-quantity-save-btn]'),
  confirmSavedIcons: () => document.querySelectorAll('[data-quantity-saved-icon]'),
  updateErrorElem: () => document.querySelector('[data-update-error]'),
  lineItemDeleteBtns: () => document.querySelectorAll('[data-line-delete-btn]'),
  subtotalPrice: () => document.querySelector('[data-subtotal-price]'),
  orderNoteTextarea: () => document.querySelector('[data-order-note-textarea]'),
  confirmNoteSaved: () => document.querySelector('[data-note-saved-message]'),
};

const classes = {
  show: 'show',
  fadeOut: 'fade-out',
};

(function getInitialState() {
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
    // Save data for each line into a state object, accessible via shopify cart line key.
    state[lineKey] = {
      lineRow,
      input,
      saveBtn: saveBtns.find((btn) => btn.dataset.lineKey === lineKey),
      deleteBtn: deleteBtns.find((btn) => btn.dataset.lineKey === lineKey),
      confirmSaveIcon: confirmSavedIcons.find((icon) => icon.dataset.lineKey === lineKey),
      lineTotal: lineTotals.find((price) => price.dataset.lineKey === lineKey),
      initialQuantity: input.value,
      liveQuantity: input.value,
      unitPrice,
      variantId,
    };
  });
})();

(function addEventListeners() {
  // Listen to quantity events
  getElements.quantityInputs().forEach((input) => {
    input.addEventListener('change', (event) => {

      const lineKey = event.target.dataset.lineKey;

      // Update state.
      const line = state[lineKey];
      line.liveQuantity = event.target.value;

      // Show / hide buttons.
      if (event.target.value === line.initialQuantity) {
        line.saveBtn.classList.remove(classes.show);
        line.saveBtn.setAttribute('disabled', 'disabled');
      } else {
        line.saveBtn.removeAttribute('disabled');
        line.saveBtn.classList.add(classes.show);
      }
    });
  });

  // Handle save new quantities
  getElements.quantitySaveBtns().forEach((saveBtn) => {
    saveBtn.addEventListener('click', async (event) => {
      const lineKey = event.target.dataset.lineKey;
      const line = state[lineKey];
      const initialQuantity = line.initialQuantity;
      const newQuantity = line.liveQuantity;
      const quantityChange = newQuantity - initialQuantity;

      // Check that you have enough stock to cover the new value.
      if (quantityChange <= 0) {
        // If quantity is decreased then go ahead and make the update.
        await updateCartLineQuantity({quantity: newQuantity, id: lineKey});
        onUpdateSuccess();
      } else {
        // Else add the difference to the cart via addToCart api call - which will actually return errors if not successful.
        const res = await addItemsToCart({
          id: line.variantId,
          quantity: quantityChange,
        });
        if (res.message === 'Cart Error') {
          const errorTxt = res.description.split(' ')[0] === 'All'
            ? res.description
            : 'Sorry, we don\'t have that many in stock';
          onUpdateFail(errorTxt);
        } else {
          onUpdateSuccess();
        }
      }

      function onUpdateSuccess() {
        // If quantity === 0 then you need to remove the whole lineRow element.
        if (newQuantity === '0') {
          line.lineRow.classList.add(classes.fadeOut);
          setTimeout(() => {
            line.lineRow.parentNode.removeChild(line.lineRow);
          }, 1000);
        }
        line.initialQuantity = newQuantity;
        line.saveBtn.classList.remove(classes.show);
        line.confirmSaveIcon.classList.add(classes.show);
        // Update line total.
        const newTotal = newQuantity * line.unitPrice;
        line.lineTotal.innerHTML = formatMoney(newTotal, theme.moneyFormat);
        updateSubtotal();
        renderMiniCart();
        setTimeout(() => {
          line.confirmSaveIcon.classList.remove(classes.show);
        }, 2000);
      }

      function onUpdateFail(errorMsg) {
        const errorDisplay = getElements.updateErrorElem();
        errorDisplay.innerHTML = errorMsg;
        errorDisplay.classList.add(classes.show);
      }
    });
  });

  // Handle remove line from cart
  getElements.lineItemDeleteBtns().forEach((removeBtn) => {
    removeBtn.addEventListener('click', async (event) => {
      const lineKey = event.target.dataset.lineKey;
      const line = state[lineKey];
      await updateCartLineQuantity({quantity: 0, id: lineKey});
      // Then remove all elements associated with the deleted line.
      line.lineRow.classList.add(classes.fadeOut);
      renderMiniCart();
      setTimeout(() => {
        line.lineRow.parentNode.removeChild(line.lineRow);
      }, 1000);
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

// Based on current state - update subtotal display.
function updateSubtotal() {
  const newSubtotal = Object.values(state).reduce((acum, {liveQuantity, unitPrice}) => acum + (liveQuantity * unitPrice), 0);
  getElements.subtotalPrice().innerHTML = formatMoney(newSubtotal, theme.moneyFormat);
}
