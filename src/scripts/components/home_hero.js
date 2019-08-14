import {smoothScrollY} from '../utils/utils';

const getElements = {
  trustbox: () => document.querySelector('[data-trustbox-component]'),
  browseEverythingBtn: () => document.querySelector('[data-browse-everything]'),
  homepageHero: () => document.querySelector('[data-home-hero]'),
};

const headerHeight = 80;

function setTrustboxHeight() {
  getElements.trustbox().setAttribute('data-style-height', `${window.innerHeight * 0.75}px`);
}

function initEventListeners() {
  // Based on the user's window height on page load.
  setTrustboxHeight();

  getElements.browseEverythingBtn().addEventListener('click', () => {
    const start = window.scrollY;
    // Get the top of the bounding client rect of the browse everything section. Scroll the top of the window to this position.
    const destination = getElements.homepageHero().getBoundingClientRect().height - headerHeight;
    smoothScrollY([start, destination], [0.19, 1, 0.22, 1], 1000);
  });
}

initEventListeners();
