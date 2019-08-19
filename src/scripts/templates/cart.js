/*
  Module / script for /cart page.
*/
import {formatMoney} from '@shopify/theme-currency';
import {debounce} from 'throttle-debounce';
import {updateCartLineQuantity, updateCart} from '../utils/api';
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
      const quantity = line.liveQuantity;
      await updateCartLineQuantity({quantity, id: lineKey});
      // If quantity === 0 then you need to remove the whole lineRow element.
      if (quantity === '0') {
        line.lineRow.classList.add(classes.fadeOut);
        setTimeout(() => {
          line.lineRow.parentNode.removeChild(line.lineRow);
        }, 1000);
      } else {
        line.initialQuantity = quantity;
        line.saveBtn.classList.remove(classes.show);
        line.confirmSaveIcon.classList.add(classes.show);
        // Update line total.
        const newTotal = quantity * line.unitPrice;
        line.lineTotal.innerHTML = formatMoney(newTotal, 'GBP');
        updateSubtotal();
        renderMiniCart();
        setTimeout(() => {
          line.confirmSaveIcon.classList.remove(classes.show);
        }, 2000);
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
    }, 1500);
  }));
})();

// Based on current state - update subtotal display.
function updateSubtotal() {
  const newSubtotal = Object.values(state).reduce((acum, {liveQuantity, unitPrice}) => acum + (liveQuantity * unitPrice), 0);
  getElements.subtotalPrice().innerHTML = formatMoney(newSubtotal, theme.moneyFormat);
}
