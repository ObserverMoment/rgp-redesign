/**
 * Main site header section script
 * ------------------------------------------------------------------------------
 * @namespace header
 */

import {renderMiniCart} from '../components/mini_cart';

const classes = {
  active: 'active',
};

const selectors = {
  accountPanelToggle: '[data-account-panel-toggle]',
  accountPanelClose: '[data-account-panel-close]',
  accountPanelContent: '[data-account-panel-content]',
  helpPanelToggle: '[data-help-panel-toggle]',
  helpPanelClose: '[data-help-panel-close]',
  helpPanelContent: '[data-help-panel-content]',
  miniCartToggle: '[data-cart-mini-toggle]',
  miniCartClose: '[data-cart-mini-close]',
  miniCartContent: '[data-cart-mini-content]',
};

// Gets cart data and then builds the mini cart elements.
renderMiniCart();

function toggleShowContent(event, elem) {
  if (elem.classList.contains(classes.active)) {
    elem.classList.remove(classes.active);
  } else {
    elem.classList.add(classes.active);
  }
}

function initEventListeners() {
  const accountPanelContent = document.querySelector(selectors.accountPanelContent);
  const helpPanelContent = document.querySelector(selectors.helpPanelContent);
  const miniCartContent = document.querySelector(selectors.miniCartContent);

  const accountPanelToggles = [
    document.querySelector(selectors.accountPanelToggle),
    document.querySelector(selectors.accountPanelClose),
  ];
  const helpPanelToggles = [
    document.querySelector(selectors.helpPanelToggle),
    document.querySelector(selectors.helpPanelClose),
  ];
  const miniCartToggles = [
    document.querySelector(selectors.miniCartToggle),
    document.querySelector(selectors.miniCartClose),
  ];

  accountPanelToggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => toggleShowContent(event, accountPanelContent));
  });
  helpPanelToggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => toggleShowContent(event, helpPanelContent));
  });
  miniCartToggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => toggleShowContent(event, miniCartContent));
  });
}

initEventListeners();
