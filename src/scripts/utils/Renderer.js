// Define element type constants - all will be passed to createElement, except Root which must already be an element in the DOM.
const elems = {
  Root: 'root',
  Div: 'div',
  Span: 'span',
  H1: 'h1',
  H2: 'h2',
  Img: 'img',
  Ul: 'ul',
  Li: 'li',
  Link: 'a',
};

/*
** Example of tree definition structure.
const tree = [
  Root, {rootElem: 'minicartContainer'}, [
    Div, {className: 'somename', innerHTML: 'innerHTML', attributes: 'attributes'}, [
      Img, {className: 'name', attributes: ''}, [
        Ul, {className: 'unordered list', attributes: {'data-main-list': '', 'data-other-custom-attribute': 'anything'}}, [
          Li, {className: 'list item', quantity: 9, classNameSuffix: 'index'},
        ],
      ],
    ],
  ],
];
*/


function buildElement({elementType, config, parent}) {
  const {
    className = null, innerHTML = null,
    attributes = null, listeners = null,
  } = config;
  // Make the node.
  const node = document.createElement(elementType);

  if (className) {
    node.className = className;
  }

  // Add all the attributes (props).
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });
  }

  if (listeners) {
    Object.entries(listeners).forEach(([eventType, fns]) => {
      node.addEventListener(eventType, (event) => {
        fns.forEach((func) => func(event));
      });
    });
  }

  // Insert the content - this should usually just be text.
  if (innerHTML) {
    node.innerHTML = innerHTML;
  }

  // Append to parent.
  if (!parent) {
    throw Error('A parent is required to make a node - make sure you have passed a parent element via {parent} attribute');
  }
  parent.appendChild(node);

  return node;
}

/*
  @param elementType: see elems obj.
  @param config: { className, attributes:{}, innerHTML: '', listeners: { event: [fn,fn], event: [fn,fn] } }
  @param children: Array[ [elementType, config, children], [elementType, config, children] ]
  @param parent: do not pass this arg - automatically passed during recursion.
*/
function render([elementType, config, children], parent) {
  try {
    if (elementType === 'root') {
      if (!(config.rootElem instanceof Element || config.rootElem instanceof HTMLDocument)) {
        throw Error('The top level of your tree must be a DOM element');
      }
      if (!children || !Array.isArray(children) || children.length < 1) {
        throw Error('You must provide and array of children for the root element');
      }
      children.forEach(([_type, _config, _children]) => render([_type, _config, _children], config.rootElem));
    } else {
      // Handle multiple identical siblings.
      let i = 1;
      const numSiblings = config.quantity || 1;
      while (i <= numSiblings) {
        const newNode = buildElement({elementType, config, parent});
        if (children) {
          children.forEach(([_type_, _config_, _children_]) => render([_type_, _config_, _children_], newNode));
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

export {render, formatMoney, elems};
