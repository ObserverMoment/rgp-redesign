/**
 * Main site header section script
 * ------------------------------------------------------------------------------
 * @namespace header
 */
import {renderMiniCart} from '../components/mini_cart';
import {scrollPosEmitter, events} from '../utils/global_events';

const {SCROLLING} = events;

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

function updateHeaderStyle() {
  const headerContent = document.querySelector(selectors.headerContent);
  const urlpath = window.location.pathname;
  const scrollY = window.scrollY;
  if (urlpath === '/') {
    if (scrollY <= 60) {
      headerContent.className = 'header-content no-bg';
    } else if (scrollY > 60 && scrollY < 800) {
      headerContent.className = 'header-content black-bg';
    } else {
      headerContent.className = 'header-content white-bg';
    }
  } else {
    headerContent.className = 'header-content';
  }

  if (urlpath !== '/' && scrollY > 60) {
    headerContent.classList.add('scrolled');
  } else {
    headerContent.classList.remove('scrolled');
  }
}

function initEventListeners() {
  // Initialise header style onload.
  updateHeaderStyle();
  // Subscribe updateHeaderStyle to the scroll event.
  scrollPosEmitter.on(SCROLLING, updateHeaderStyle);

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
