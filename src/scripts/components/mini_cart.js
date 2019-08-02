import {getCartData} from '../utils/api';

const getElements = {
  miniCartContainer: () => document.querySelector('[data-mini-cart-container]'),
};

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

function buildElement({nodeDef, parent}) {
  console.log('nodeDef', nodeDef);
  const {
    type = 'DIV', className = '', innerHTML = null,
    attributes = null,
  } = nodeDef;
  // Make the node.
  const node = document.createElement(type);
  node.className = className;

  // Add all the attributes (props).
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });
  }

  // Insert the content - this should usually just be text.
  if (innerHTML) {
    node.innerHTML = innerHTML;
  }

  // Append to parent.
  if (!parent) {
    throw Error('A parent is required to make a node - make sure you have passed a parent element via [parent] attribute');
  }
  parent.appendChild(node);

  return node;
}

/*
  * @param {parent} = Element
  * @param {children} = Element[]
*/
function makeNode({Node, quantity = 1, parent}) {
  const {
     root = null, children = null,
  } = Node;

  try {
    if (root) {
      if (!children) {
        throw Error('You must provide some children for the root element');
      }
      children.forEach((child) => makeNode({Node: child, parent: root}));
    } else {
      // Handle multiple identical siblings.
      let i = 1;
      while (i <= quantity) {
        const newNode = buildElement({nodeDef: Node.Node, parent});
        if (children) {
          children.forEach((child) => makeNode({Node: child, parent: newNode}));
        }
        i++;
      }
    }
  } catch (err) {
    console.log(err);
  }
}

async function renderMiniCart() {
  const data = await getCartData();
  const miniCartContainer = getElements.miniCartContainer();

  makeNode({
    Node: {
      root: miniCartContainer,
      children: data.items
        .map(({featured_image, product_title, variant_title, quantity, final_price, final_line_price}) => (
          {
            Node: {className: classes.cartLine}, children: [
              {
                Node: {className: classes.imageWrapper}, children: [
                  {Node: {type: 'IMG', className: classes.imageElem, attributes: {src: featured_image.url}}},
                ],
              },
              {
                Node: {className: classes.info}, children: [
                  {Node: {className: classes.infoTitle, innerHTML: `${product_title} (${variant_title})`}},
                  {Node: {className: classes.infoUnit}, children: [
                    {Node: {className: classes.unitCost, innerHTML: final_price}},
                    {Node: {className: classes.infoUnitQuantity, innerHTML: quantity}},
                  ]},
                ],
              },
              {
                Node: {className: classes.totalPrice, innerHTML: final_line_price},
              },
            ],
          }
        )),
    },
  });

}

export {renderMiniCart};
