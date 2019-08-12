import {ProductCard} from './product_card';
import {getCollectionData} from '../utils/api';
import {render, elems} from '../utils/Renderer';

const {Root} = elems;

const getElements = {
  productFilters: () => document.querySelector('[data-product-browser-filters]'),
  productsContainer: () => document.querySelector('[data-product-browser-products]'),
};

async function initCollection() {
  const data = await getCollectionData('everything');
  console.log('data', data);
  const productsContainer = getElements.productsContainer();

  render([
    Root, {rootElem: productsContainer}, data.products.map((product) => ProductCard(product)),
  ]);
}

initCollection();
