const getElements = {
  trustbox: () => document.querySelector('[data-trustbox-component]'),
  browseEverythingBtn: () => document.querySelector('[data-browse-everything]'),
  homepageHero: () => document.querySelector('[data-home-hero]'),
};

function updateTrustboxHeight() {
  getElements.trustbox().setAttribute('data-style-height', `${window.innerHeight * 0.75}px`);
}

function initEventListeners() {
  updateTrustboxHeight();

  getElements.browseEverythingBtn().addEventListener('click', () => {
    // Need to check to see if you are already scrolled down - if so - cancel action.
    console.log('scrolling');
    // Get the top of the bounding client rect of the browse everything section. Scroll the top of the window to this position.
    const homeHeroLoc = getElements.homepageHero().getBoundingClientRect();
    console.log('homeHeroLoc', homeHeroLoc);
    window.scrollTo(0, homeHeroLoc.bottom);
  });
}

initEventListeners();
