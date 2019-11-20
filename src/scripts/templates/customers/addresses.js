/**
 * Customer Addresses Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Customer Addresses
 * template.
 *
 * @namespace customerAddresses
 */

import {AddressForm} from '@shopify/theme-addresses';

// Setup listeners for label animations.
import '../../components/account_forms';

const selectors = {
  addressContainer: '[data-address]',
  addressFields: '[data-address-fields]',
  addressToggle: '[data-address-toggle]',
  addressForm: '[data-address-form]',
  addressDeleteForm: '[data-address-delete-form]',
  addAddressBtn: '[data-add-address-btn]',
  cancelAddBtn: '[data-cancel-add-btn]',
  addressTitle: '[data-address-title]',
  addressList: '[data-address-list]',
  addressListItem: '[data-address]',
  editAddressBtn: '[data-edit-address-btn]',
  deleteAddressBtn: '[data-delete-address-btn]',
  cancelEditBtn: '[data-cancel-edit-btn]',
};
const hideClass = 'hide';

(function initAddNewAddressListeners() {
  const addBtn = document.querySelector(selectors.addAddressBtn);
  const addressList = document.querySelector(selectors.addressList);
  const addressListItems = Array.from(document.querySelectorAll(selectors.addressListItem)).filter((node) => node);
  const cancelAddBtn = document.querySelector(selectors.cancelAddBtn);
  const addressForm = document.querySelector(selectors.addressForm);
  const addressTitle = document.querySelector(selectors.addressTitle);
  const editAddressBtns = Array.from(document.querySelectorAll(selectors.editAddressBtn)).filter((node) => node);
  const deleteAddressBtns = Array.from(document.querySelectorAll(selectors.deleteAddressBtn)).filter((node) => node);
  const cancelEditBtns = Array.from(document.querySelectorAll(selectors.cancelEditBtn)).filter((node) => node);

  addBtn.addEventListener('click', () => {
    addressList.classList.add(hideClass);
    addBtn.classList.add(hideClass);
  });

  cancelAddBtn.addEventListener('click', () => {
    addressList.classList.remove(hideClass);
    addBtn.classList.remove(hideClass);
  });

  editAddressBtns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      addressListItems.forEach((address) => {
        if (address.dataset.addressId !== event.target.dataset.addressId) {
          address.classList.add(hideClass);
        }
      });
      // Hide the buttons.
      event.target.classList.add(hideClass);
      deleteAddressBtns.find((delBtn) => event.target.dataset.addressId === delBtn.dataset.addressId).classList.add(hideClass);
      // Hide the title.
      addressTitle.classList.add(hideClass);
    });
  });

  cancelEditBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      addressListItems.forEach((add) => add.classList.remove(hideClass));
      deleteAddressBtns.forEach((del) => del.classList.remove(hideClass));
      editAddressBtns.forEach((edit) => edit.classList.remove(hideClass));
      addressTitle.classList.remove(hideClass);
    });
  });

  // Defaults to hidden on every page load.
  addressForm.classList.add(hideClass);

})();

function initializeAddressForm(container) {
  const addressFields = container.querySelector(selectors.addressFields);
  const addressForm = container.querySelector(selectors.addressForm);
  const deleteForm = container.querySelector(selectors.addressDeleteForm);

  container.querySelectorAll(selectors.addressToggle).forEach((button) => {
    button.addEventListener('click', () => {
      addressForm.classList.toggle(hideClass);
    });
  });

  AddressForm(addressFields, 'en', {shippingCountriesOnly: true});

  if (deleteForm) {
    deleteForm.addEventListener('submit', (event) => {
      const confirmMessage = deleteForm.getAttribute('data-confirm-message');

      if (!window.confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
        event.preventDefault();
      }
    });
  }
}

const addressForms = document.querySelectorAll(selectors.addressContainer);

if (addressForms.length) {
  addressForms.forEach((addressContainer) => {
    initializeAddressForm(addressContainer);
  });
}
