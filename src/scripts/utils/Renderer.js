import {globalState, globalEvents} from './global_events';

// Define element type constants - all will be passed to createElement, except Root which must already be an element in the DOM.
const elems = {
  Root: 'root',
  Div: 'div',
  Span: 'span',
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  Img: 'img',
  Ul: 'ul',
  Li: 'li',
  Link: 'a',
  Input: 'input',
  Label: 'label',
  Button: 'button',
  Select: 'select',
  Option: 'option',
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
  if (!parent) {
    throw Error('A parent is required to make a node - make sure you have passed a parent element via {parent} attribute');
  }

  const {
    className = null, innerHTML = null, attributes = null,
    listeners = null, subscriptions = null, postMountCallbacks = null,
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
      let functions = fns;
      if (!Array.isArray(fns)) {
        functions = [fns];
      }
      node.addEventListener(eventType, (event) => {
        functions.forEach((func) => func(event));
      });
    });
  }

  // Subscriptions allows elements to be passed to event subscribers.
  // An array of functions.
  if (subscriptions) {
    subscriptions.forEach((sub) => {
      sub(node);
    });
  }

  // Insert the content - this should usually just be text.
  if (innerHTML) {
    node.innerHTML = innerHTML;
  }

  parent.appendChild(node);

  // Setup or initialisation functions that require the node be mounted to the dom.
  // Can also use this to run a new render method with this element as the root - allowing sub tree sections to be built easily.
  // Generally just run these functions once.
  if (postMountCallbacks) {
    postMountCallbacks.forEach((callback) => {
      callback(node);
    });
  }

  return node;
}

/*
  @param elementType: see elems obj.
  @param config (root): { rootElem, eventCompleteId }
  @param config: { className, attributes:{}, innerHTML: '', listeners: { event: [fn,fn], event: [fn,fn] } }
  @param children: Array[ [elementType, config, children], [elementType, config, children] ]
  @param parent: do not pass this arg - automatically passed during recursion.
*/
function render([elementType, config, children], parent) {
  try {
    if (elementType === elems.Root) {
      if (!(config.rootElem instanceof Element || config.rootElem instanceof HTMLDocument)) {
        throw Error('The top level of your tree must be a DOM element');
      }
      if (!children || !Array.isArray(children) || children.length < 1) {
        throw Error('You must provide an array of children for the root element');
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
    console.error(err);
    console.error('Error rendering node:', [elementType, config, children]);
    console.error('For parent:', parent);
  }
  // Let everyone know that the dom has been updated. Eg lazyloader so it can capture new elements.
  // Pass event id to the subscribers, allowing components to monitor when a render has completed.
  // Pass the containing parent element as default arg.
  if (elementType === elems.Root && config.eventCompleteId) {
    globalState.notify(`${globalEvents.DOMUPDATED}-${config.eventCompleteId}`);
  }
}

export {render, elems};
