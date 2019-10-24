import {ProductCard} from './product_card';
import {getCollectionProducts} from '../utils/api';
import {render, elems} from '../utils/Renderer';
import {Store} from '../utils/Store';
import productConfig from '../utils/productTypes';
import {FilterIcon, SortDownIcon} from '../utils/icons';
import {Loader} from './loader';
import {globalState, globalEvents} from '../utils/global_events';

const {Root, Div, Link} = elems;

const loaderDataAttr = 'data-loader-product-browser';

const getElements = {
  productFilters: () => document.querySelector('[data-product-browser-filters]'),
  productsContainer: () => document.querySelector('[data-product-browser-products]'),
  productBrowserLoader: () => document.querySelector(`[${loaderDataAttr}]`),
};

const classes = {
  filterBtnsContainer: 'product-browser__header__filters__btns-container',
  filterSelectBtn: 'product-browser__header__filters__btn',
  filterMobileIcon: 'product-browser__header__filters__icon',
  selectedFilter: 'product-browser__header__filters__selected',
  selectedFilterDisplay: 'product-browser__header__filters__selected__text',
  selectedFilterToggle: 'product-browser__header__filters__selected__toggle',
  productLink: 'product-browser__products__product-link',
  show: 'show',
  active: 'active',
};

function updateProductDisplay(productLink, newState) {
  // Remove all items first before adding them back in to trigger keyframe animnations.
  if (
    productLink.dataset.productType === newState.selectedProductType ||
    newState.selectedProductType === 'everything'
    ) {
    productLink.classList.add(classes.show);
  } else {
    productLink.classList.remove(classes.show);
  }
}

function updateFilterSelect(filterSelectBtn, newState) {
  if (filterSelectBtn.dataset.productType === newState.selectedProductType) {
    filterSelectBtn.classList.add(classes.active);
  } else {
    filterSelectBtn.classList.remove(classes.active);
  }
}

function getUITextForCollection(productType) {
  return productType === 'everything'
    ? 'Everything'
    : productConfig[productType].uiDisplay;
}

function updateSelectedFilterDisplay(newState, selectedFilterElem) {
  const {selectedProductType} = newState;
  selectedFilterElem.innerHTML = getUITextForCollection(selectedProductType);
}

function updateMobileDropdown(dropdownElem, newState) {
  if (newState.filterOpen) {
    dropdownElem.classList.add(classes.active);
  } else {
    dropdownElem.classList.remove(classes.active);
  }
}

function renderLoader() {
  const productsContainer = getElements.productsContainer();

  render([
    Root, {rootElem: productsContainer}, [
      Loader(null, loaderDataAttr),
    ],
  ]);
}

function renderFilters(productTypes = ['everything'], State) {
  const productFilters = getElements.productFilters();
  const {selectedProductType} = State.getState();
  const selectedCollection = getUITextForCollection(selectedProductType);

  render([
    Root,
    {rootElem: productFilters},
    [
      [Div, {className: classes.filterMobileIcon, innerHTML: FilterIcon}],
      [Div, {
        className: classes.selectedFilter,
        listeners: {
          click: [() => State.setState({filterOpen: !State.getState().filterOpen})],
        },
      }, [
        [Div, {
          className: classes.selectedFilterDisplay,
          innerHTML: `Showing: ${selectedCollection}`,
          postMountCallbacks: [(self) => updateSelectedFilterDisplay(State.getState(), self)],
          subscriptions: [(self) => State.onAttributeUpdate((newState) => updateSelectedFilterDisplay(newState, self), 'selectedProductType')],
        }],
        [Div, {className: classes.selectedFilterToggle, innerHTML: SortDownIcon}],
      ]],
      [Div, {
        className: classes.filterBtnsContainer,
        subscriptions: [
          (self) => State.onAttributeUpdate((newState) => updateMobileDropdown(self, newState), 'filterOpen'),
        ],
      }, [
        ...productTypes.map((handle) => (
          [Div,
            {
              className: classes.filterSelectBtn,
              innerHTML: handle === 'everything' ? 'Everything' : productConfig[handle].uiDisplay,
              attributes: {'data-product-type': handle},
              listeners: {
                click: [
                  () => State.setState({selectedProductType: handle, filterOpen: !State.getState().filterOpen}),
                ],
              },
              subscriptions: [
                (self) => State.onAttributeUpdate((newState) => updateFilterSelect(self, newState), 'selectedProductType'),
              ],
              postMountCallbacks: [
                (self) => updateFilterSelect(self, State.getState()),
              ],
            }])),
      ]],
    ],
  ]);
}

function renderProductsList(products, State) {
  const productsContainer = getElements.productsContainer();
  const urlRoot = '/products';

  const eventId = 'product-browser-rendered';

  globalState.subscribe(`${globalEvents.DOMUPDATED}-${eventId}`, () => {
    const loaderElem = getElements.productBrowserLoader();
    loaderElem.classList.add('hide');
  });

  render([
    Root, {rootElem: productsContainer, eventCompleteId: eventId}, products.map((product) =>
      [
        Link,
        {
          className: classes.productLink,
          attributes: {href: `${urlRoot}/${product.handle}`, 'data-product-type': product.product_type},
          subscriptions: [
            (self) => State.onAttributeUpdate((newState) => updateProductDisplay(self, newState), 'selectedProductType'),
          ],
          postMountCallbacks: [
            (self) => updateProductDisplay(self, State.getState()),
            (self) => ProductCard(self, product),
          ],
        },
      ]),
  ]);
}

async function initCollection() {
  renderLoader();
  const State = Store({selectedProductType: 'everything', filterOpen: false});
  const {products} = await getCollectionProducts('everything');
  // Sort by price - low to high.
  const sortedProducts = products.sort((prodA, prodB) =>
    (parseFloat(prodA.variants[0].price) <= parseFloat(prodB.variants[0].price) ? -1 : 1));

  const uniqueProductTypes = ['everything', 'Poker Chipset', 'Poker Mat', 'Poker Table Top', 'Freestanding Poker Table'];
  renderFilters(uniqueProductTypes, State);
  renderProductsList(sortedProducts, State);
}

initCollection();
