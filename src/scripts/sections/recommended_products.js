import {ProductCard} from '../components/product_card';
import {render, elems} from '../utils/Renderer';
// import {Loader} from './loader';
import {getRecommendedProducts, getProductJSON} from '../utils/api';

const {Root, Div, Link} = elems;

const getElements = {
  container: () => document.querySelector('[data-recommended-products-wrapper]'),
};

const classes = {
  productGrid: 'recommended-products__grid',
  productItem: 'recommended-products__grid__product-link',
};

const productId = getElements.container().dataset.productId;
const urlRoot = '/products';

// Component.
async function RecommendedProducts(parentElem) {
  const {products} = await getRecommendedProducts(productId, 3);

  async function getProductImages(handle) {
    const {images} = await getProductJSON(handle);
    return images;
  }

  const productsWithImages = await Promise.all(
    products.map(async (product) => {
      const images = await getProductImages(product.handle);
      return {...product, images};
    }),
  );

  render([
    Root, {rootElem: parentElem}, [
      [Div, {className: classes.productGrid},
        productsWithImages.map((product) => [
          Link, {
            className: classes.productItem,
            attributes: {href: `${urlRoot}/${product.handle}`},
            postMountCallbacks: [
              (self) => ProductCard(self, product),
            ],
          },
        ]),
      ],
    ],
  ]);
}

// Initialise coponent.
RecommendedProducts(getElements.container());
