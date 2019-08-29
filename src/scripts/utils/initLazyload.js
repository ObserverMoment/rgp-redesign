import LazyLoad from 'vanilla-lazyload';
import {globalState, globalEvents} from './global_events';

function logEvent(eventName, element) {
  console.log(
    Date.now(),
    eventName,
    element.getAttribute('data-src'),
    element.getAttribute('src'),
  );
}

const lazyLoadOptions = {
  elements_selector: '.lazy',
  to_webp: true,
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

// TOD: You need to create a superLazy instance here, which will look for all .lazyContainer elements.
// Then using the callback_enter func - when the elements enters the global viewport you use the createLazyloader() func below.
// And pass the element.


function createLazyloader(scrollableElement = null, customOptions = {}) {
  const container = scrollableElement ? {container: scrollableElement} : {};
  new LazyLoad({
    ...lazyLoadOptions,
    ...customOptions,
    container,
  });
  // globalState.subscribe(globalEvents.DOMUPDATED, () => lazyloader.update());
}

createLazyloader(null, {
  elements_selector: '.lazyContainer',
  callback_enter: (element) => {
    logEvent('ENTERED', element);
    createLazyloader(element, {thresholds: '300px 600px'});
  },
});
