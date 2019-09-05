import {ProductCard} from './product_card';
import {getCollectionProducts} from '../utils/api';
import {render, elems} from '../utils/Renderer';
import {Store} from '../utils/Store';
import productConfig from '../utils/productTypes';

const {Root, Div, Link} = elems;

const getElements = {
  productFilters: () => document.querySelector('[data-product-browser-filters]'),
  productsContainer: () => document.querySelector('[data-product-browser-products]'),
};

const classes = {
  filterSelectBtn: 'product-browser__header__filters__btn',
  productLink: 'product-browser__products__product-link',
  show: 'show',
  active: 'active',
};

const validProductTypes = ['Poker Chipset', 'Freestanding Poker Table', 'Poker Table Top', 'Poker Mat'];

function updateProductDisplay(productLink, newState) {
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

function renderFilters(productTypes = ['everything'], state) {
  const productFilters = getElements.productFilters();
  render([
    Root,
    {rootElem: productFilters},
    [
      ...productTypes.map((handle) => (
        [Div,
          {
            className: classes.filterSelectBtn,
            innerHTML: handle === 'everything' ? 'Everything' : productConfig[handle].collection,
            attributes: {'data-product-type': handle},
            listeners: {
              click: [() => state.setState({selectedProductType: handle})],
            },
            subscriptions: [
              (self) => state.onAttributeUpdate((newState) => updateFilterSelect(self, newState), 'selectedProductType'),
            ],
            postMountCallbacks: [
              (self) => updateFilterSelect(self, state.getState()),
            ],
          }])),
    ],
  ]);
}

function renderProductsList(products, state) {
  const productsContainer = getElements.productsContainer();
  const urlRoot = '/products';
  render([
    Root, {rootElem: productsContainer}, products.map((product) =>
      [
        Link,
        {
          className: classes.productLink,
          attributes: {href: `${urlRoot}/${product.handle}`, 'data-product-type': product.product_type},
          subscriptions: [
            (self) => state.onAttributeUpdate((newState) => updateProductDisplay(self, newState), 'selectedProductType'),
          ],
          postMountCallbacks: [
            (self) => updateProductDisplay(self, state.getState()),
          ],
        },
          [ProductCard(product, true)],
      ]),
  ]);
}

async function initCollection() {
  const state = Store({selectedProductType: 'everything'});
  const {products} = await getCollectionProducts('everything');
  const productTypes = products.map((product) => product.product_type).filter((type) => validProductTypes.includes(type));
  const uniqueProductTypes = ['everything', ...new Set(productTypes)];
  renderFilters(uniqueProductTypes, state);
  renderProductsList(products, state);
}

initCollection();
