/*
 ** Example of tree definition structure.
 {
   Node: {root: miniCartContainer},
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
 }
*/

function buildElement({Node, parent}) {
  const {
    type = 'DIV', className = '', innerHTML = null,
    attributes = null,
  } = Node;
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

function render({Node, children, quantity = 1, parent}) {
  try {
    if (Node.root) {
      if (!children || !Array.isArray(children) || children.length < 1) {
        throw Error('You must provide some children for the root element');
      }
      children.forEach((child) => render({Node: child.Node, children: child.children, parent: Node.root}));
    } else {
      // Handle multiple identical siblings.
      let i = 1;
      while (i <= quantity) {
        const newNode = buildElement({Node, parent});
        if (children) {
          children.forEach((child) => render({Node: child.Node, children: child.children, parent: newNode}));
        }
        i++;
      }
    }
  } catch (err) {
    console.log(err);
  }
}

function formatMoney(input, currencyCode) {
  try {
    if (!currencyCode) { throw Error('Please supply a currency code'); }

    const formatted = {
      GBP: `£${parseFloat(input / 100).toFixed(2)}`,
    }[currencyCode];

    if (!formatted) { throw Error('Please supply a valid currency code'); }

    return formatted;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export {render, formatMoney};
