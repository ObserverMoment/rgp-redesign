import {ProductCard} from './product_card';
import {getCollectionProducts} from '../utils/api';
import {render, elems} from '../utils/Renderer';

const {Root, Div, Link} = elems;

const getElements = {
  productFilters: () => document.querySelector('[data-product-browser-filters]'),
  productsContainer: () => document.querySelector('[data-product-browser-products]'),
};

const classes = {
  productLink: 'product-browser__products__product-link',
};

function renderFilters() {
  const productFilters = getElements.productFilters();
  render([
    Root, {rootElem: productFilters}, [
      [Div, {innerHTML: 'filter1'}],
      [Div, {innerHTML: 'filter2'}],
      [Div, {innerHTML: 'filter3'}],
    ],
  ]);
}

function renderProductsList(data) {
  const productsContainer = getElements.productsContainer();
  const urlRoot = '/products';
  render([
    Root, {rootElem: productsContainer}, data.products
      .map((product) =>
        [
          Link,
          {className: classes.productLink, attributes: {href: `${urlRoot}/${product.handle}`}},
          [ProductCard(product, '500x500', true)],
        ]),
  ]);
}

async function initCollection() {
  const data = await getCollectionProducts('everything');
  renderFilters();
  renderProductsList(data);
}

initCollection();
