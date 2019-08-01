import {getCartData} from '../utils/api'

const getElements = {
  miniCartContainer: () => document.querySelector('[data-mini-cart-container]'),
}

const wrapperClass = 'mini-cart';

const classes = {
  cartLine: `${wrapperClass}__line`,
  imageWrapper: `${wrapperClass}__line__image`,
  imageElem: `${wrapperClass}__line__image__elem`,
  info: `${wrapperClass}__line__info`,
  infoTitle: `${wrapperClass}__line__info__title`,
  infoUnit: `${wrapperClass}__line__info__unit`,
  infoUnitCost: `${wrapperClass}__line__info__unit__cost`,
  infoUnitQuantity: `${wrapperClass}__line__info__unit__quantity`,
  totalPrice: `${wrapperClass}__line__total-price`,
  removeLine: `${wrapperClass}__line__remove-line`,
};

/*
  * @param {parent} = Element
  * @param {children} = Element[]
*/
function makeNode({
    elementType = 'DIV', className = '', innerHTML = null, attributes = null, parent = null, children = null,
  }) {
  // Make node.
  const node = document.createElement(elementType);
  node.className = className;

  // Append to parent if exists.
  if (parent) {
    parent.appendChild(node);
  }

  if (innerHTML) {
    node.innerHTML = innerHTML;
  }

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });
  }

  // Append children if exist.
  if (children) {
    children.forEach((child) => {
      node.appendChild(child);
    });
  }
  return node;
}

async function renderMiniCart() {
  const data = await getCartData();
  const miniCartContainer = getElements.miniCartContainer();

  const containerChildren = data.items
    .map(({featured_image, product_title, variant_title, quantity, final_price, final_line_price}) => {

      const infoUnitChildren = [
        makeNode({className: classes.unitCost, innerHTML: final_price}),
        makeNode({className: classes.infoUnitQuantity, innerHTML: quantity}),
      ];

      const infoChildren = [
        makeNode({className: classes.infoTitle, innerHTML: `${product_title} (${variant_title})`}),
        makeNode({className: classes.infoUnit, children: infoUnitChildren}),
      ];

      const imageAttributes = {
        src: featured_image.url,
      };

      const imageChildren = [
        makeNode({elementType: 'IMG', className: classes.imageElem, attributes: imageAttributes}),
      ];

      const lineChildren = [
        makeNode({className: classes.imageWrapper, children: imageChildren}),
        makeNode({className: classes.info, children: infoChildren}),
        makeNode({className: classes.totalPrice, innerHTML: final_line_price}),
      ];

      const cartLine = makeNode({className: classes.cartLine, parent: miniCartContainer, children: lineChildren});
      return cartLine;
    });

  containerChildren.forEach((child) => {
    miniCartContainer.appendChild(child);
  });
}

export {renderMiniCart};
