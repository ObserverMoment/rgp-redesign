import {ProductCard} from '../components/product_card';
import {getCollectionProducts} from '../utils/api';
import {render, elems} from '../utils/Renderer';

const {Root, Link} = elems;

const getElements = {
  productsContainer: () => document.querySelector('[data-collection-products]'),
};

const classes = {
  productLink: 'collection__products__product-link',
};

const url = window.location.pathname;
const collectionHandle = url.split('/')[2];

function renderProductsList(data) {
  const productsContainer = getElements.productsContainer();
  const urlRoot = `/collections/${collectionHandle}/products`;
  render([
    Root, {rootElem: productsContainer}, data.products
      .map((product) =>
        [
          Link,
          {className: classes.productLink, attributes: {href: `${urlRoot}/${product.handle}`}},
          [ProductCard(product, true)],
        ]),
  ]);
}

async function initCollection() {
  const data = await getCollectionProducts(collectionHandle);
  renderProductsList(data);
}

initCollection();
