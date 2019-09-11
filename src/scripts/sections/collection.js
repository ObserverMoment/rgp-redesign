import {ProductCard} from '../components/product_card';
import {getCollectionProducts} from '../utils/api';
import {render, elems} from '../utils/Renderer';
import {globalState, globalEvents} from '../utils/global_events';
import {Loader} from '../components/loader';

const {Root, Link} = elems;

const url = window.location.pathname;
const collectionHandle = url.split('/')[2];
const loaderDataAttr = `data-loader-collection-${collectionHandle}`;

const getElements = {
  productsContainer: () => document.querySelector('[data-collection-products]'),
  collectionLoader: () => document.querySelector(`[${loaderDataAttr}]`),
};

const classes = {
  productLink: 'collection__products__product-link',
};

function renderLoader() {
  const productsContainer = getElements.productsContainer();

  render([
    Root, {rootElem: productsContainer}, [
      Loader(null, loaderDataAttr),
    ],
  ]);
}

function renderProductsList({products}) {
  const productsContainer = getElements.productsContainer();
  const urlRoot = `/collections/${collectionHandle}/products`;
  const sortedProducts = products.sort((prodA, prodB) =>
    (parseFloat(prodA.variants[0].price) <= parseFloat(prodB.variants[0].price) ? -1 : 1));

  const eventId = `collection-${collectionHandle}-rendered`;

  globalState.subscribe(`${globalEvents.DOMUPDATED}-${eventId}`, () => {
    const loaderElem = getElements.collectionLoader();
    loaderElem.classList.add('hide');
  });

  render([
    Root, {rootElem: productsContainer, eventCompleteId: eventId}, [
      ...sortedProducts
        .map((product) =>
          [
            Link,
            {
              className: classes.productLink,
              attributes: {href: `${urlRoot}/${product.handle}`},
              postMountCallbacks: [
                (self) => ProductCard(self, product),
              ],
            },
            [],
          ]),
    ],
  ]);
}

async function initCollection() {
  renderLoader();
  const data = await getCollectionProducts(collectionHandle);
  renderProductsList(data);
}

initCollection();
