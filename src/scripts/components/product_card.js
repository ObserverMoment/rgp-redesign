import {elems} from '../utils/Renderer';

const {Div} = elems;

// Returns a single array of the form required by Render.render().
// [Type, {config}, [children]]
function ProductCard(productObj) {
  // console.log('render a single product card', productObj);
  return [Div, {className: 'test', innerHTML: productObj.title}];
}

export {ProductCard};
