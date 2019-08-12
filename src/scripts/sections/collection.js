import {getCollectionData} from '../utils/api';
import {render, elems} from '../utils/Renderer';

const {Root, Div} = elems;

const colours = ['Red', 'Green', 'Blue', 'Black'];

const getElements = {
  allProducts: () => document.querySelectorAll('[data-product]'),
  allProductInfos: () => document.querySelectorAll('[data-product-info]'),
};

const classes = {
  productColourIcon: 'collection__products__product__info__colour',
};

const url = window.location.pathname;
const collectionHandle = url.split('/')[2];
console.log(collectionHandle);

async function initCollection() {
  const collectionData = await getCollectionData(collectionHandle);
  console.log('collectionData', collectionData);
  if (collectionHandle !== 'poker-chips') {
    // For each product - retrieve the available colour variants and render to the page.
    const allProductInfos = getElements.allProductInfos();
    console.log('allProductInfos', allProductInfos);
    allProductInfos.forEach((productInfoElem) => {
      // Get the variants of the product.
      const productData = collectionData.products.find((product) => product.id === parseInt(productInfoElem.dataset.productId, 10));
      console.log('productData', productData);
      if (productData && productData.variants) {
        const colourVariants = productData.variants.filter((variant) => colours.includes(variant.title)).map((colour) => colour.title);
        render([
          Root, {rootElem: productInfoElem}, colourVariants.map((title) => [
            Div, {className: `${classes.productColourIcon} ${title}`},
          ]),
        ]);
      }
    });
  }
}

initCollection();
