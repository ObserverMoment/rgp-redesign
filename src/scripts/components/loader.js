import {elems} from '../utils/Renderer';

const {Div} = elems;

function Loader(customClass, loaderDataAttr) {

  const dataAttr = loaderDataAttr ? loaderDataAttr : 'data-loader';
  const className = customClass ? `loader ${customClass}` : 'loader';

  return ([
    Div, {
      className,
      attributes: {[dataAttr]: ''},
      innerHTML: '<div></div><div></div><div></div>',
    },
  ]);
}

export {Loader};
