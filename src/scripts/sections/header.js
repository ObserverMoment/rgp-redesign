/**
 * Main site header section script
 * ------------------------------------------------------------------------------
 */
import {renderMiniCart} from '../components/mini_cart';
import {globalState} from '../utils/global_events';

const classes = {
  active: 'active',
  noHeroImage: 'no-hero-image',
};

const selectors = {
  headerContent: '[data-header-content]',
  accountPanelToggle: '[data-account-panel-toggle]',
  accountPanelClose: '[data-account-panel-close]',
  accountPanelContent: '[data-account-panel-content]',
  helpPanelToggle: '[data-help-panel-toggle]',
  helpPanelClose: '[data-help-panel-close]',
  helpPanelContent: '[data-help-panel-content]',
  miniCartToggle: '[data-cart-mini-toggle]',
  miniCartClose: '[data-cart-mini-close]',
  miniCartContent: '[data-cart-mini-content]',
  openMenuBtn: '[data-open-menu]',
  closeMenuBtn: '[data-close-menu]',
  mobileNavContent: '[data-mobile-nav-content]',
};

// Gets cart data and then builds the mini cart elements.
renderMiniCart();

function toggleShowContent(elem) {
  if (elem.classList.contains(classes.active)) {
    elem.classList.remove(classes.active);
  } else {
    elem.classList.add(classes.active);
  }
}

function deactivateContent(elem) {
  elem.classList.remove(classes.active);
}

function activateContent(elem) {
  elem.classList.add(classes.active);
}

function updateHeaderStyle(newScrollState) {
  const headerContent = document.querySelector(selectors.headerContent);
  const urlpath = window.location.pathname;
  const scrollY = newScrollState.scrollY;

  if (urlpath === '/' && scrollY <= 50) {
    headerContent.className = 'header-content no-bg';
  } else {
    headerContent.className = 'header-content white-bg';
  }

  if (scrollY > 50) {
    headerContent.classList.add('scrolled');
  } else {
    headerContent.classList.remove('scrolled');
  }
}

function initHeader() {
  // Initialise header style onload.
  updateHeaderStyle(globalState.getState());
  // Subscribe updateHeaderStyle to the scroll event. i.e. when globalState.scrollY is updated.
  globalState.onAttributeUpdate((newState) => updateHeaderStyle(newState), 'scrollY');

  const accountPanelContent = document.querySelector(selectors.accountPanelContent);
  const helpPanelContent = document.querySelector(selectors.helpPanelContent);
  const miniCartContent = document.querySelector(selectors.miniCartContent);
  const mobileNavContent = document.querySelector(selectors.mobileNavContent);
  const closeMenuBtn = document.querySelector(selectors.closeMenuBtn);
  const openMenuBtn = document.querySelector(selectors.openMenuBtn);

  const accountPanelToggles = [
    ...document.querySelectorAll(selectors.accountPanelToggle),
    document.querySelector(selectors.accountPanelClose),
  ];
  const helpPanelToggles = [
    ...document.querySelectorAll(selectors.helpPanelToggle),
    document.querySelector(selectors.helpPanelClose),
  ];
  const miniCartToggles = [
    document.querySelector(selectors.miniCartToggle),
    document.querySelector(selectors.miniCartClose),
  ];
  const navMenuToggles = [
    document.querySelector(selectors.openMenuBtn),
    document.querySelector(selectors.closeMenuBtn),
  ];

  // When user is logged in these elements will not exist - the filter avoids any errors caused by this.
  accountPanelToggles.filter((toggle) => toggle).forEach((toggle) => {
    toggle.addEventListener('click', () => {
      toggleShowContent(accountPanelContent);
      deactivateContent(mobileNavContent);
      deactivateContent(closeMenuBtn);
      activateContent(openMenuBtn);
    });
  });
  helpPanelToggles.filter((toggle) => toggle).forEach((toggle) => {
    toggle.addEventListener('click', () => {
      toggleShowContent(helpPanelContent);
      deactivateContent(mobileNavContent);
      deactivateContent(closeMenuBtn);
      activateContent(openMenuBtn);
    });
  });
  miniCartToggles.filter((toggle) => toggle).forEach((toggle) => {
    toggle.addEventListener('click', () => toggleShowContent(miniCartContent));
  });
  navMenuToggles.filter((toggle) => toggle).forEach((toggle) => {
    toggle.addEventListener('click', () => {
      toggleShowContent(mobileNavContent);
      toggleShowContent(openMenuBtn);
      toggleShowContent(closeMenuBtn);
    });
  });
}

export {initHeader};
