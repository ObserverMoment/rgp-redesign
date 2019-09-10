import LazyLoad from 'vanilla-lazyload';
import {globalState, globalEvents} from './global_events';

// Uncomment for logging.
function logEvent(eventName, element) {
  console.log(
    Date.now(),
    eventName,
    element.getAttribute('data-src'),
    element.getAttribute('src'),
  );
}

const defaultOptions = {
  elements_selector: 'img',
  threshold: 400,
  // Uncomment for logging.
  callback_enter: (element) => {
    logEvent('ENTERED', element);
  },
  callback_load: (element) => {
    logEvent('LOADED', element);
  },
  callback_set: (element) => {
    logEvent('SET', element);
  },
  callback_error: (element) => {
    logEvent('ERROR', element);
    element.src = 'https://placehold.it/220x280?text=Placeholder';
  },
};

function createLazyloader(customOptions = {}, scrollableElement = null) {
  const opts = scrollableElement
    ? {...defaultOptions, ...customOptions, container: scrollableElement}
    : {...defaultOptions, ...customOptions};
  const lazyloader = new LazyLoad(opts);
  globalState.subscribe(globalEvents.DOMUPDATED, () => lazyloader.update());
}

export {createLazyloader};
