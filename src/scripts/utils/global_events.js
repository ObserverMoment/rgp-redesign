/*
 * Listeners and global state object for data that is needed app wide.
*/
import {throttle} from 'throttle-debounce';
import {Store} from './Store';
import {createLazyloader} from './initLazyload';

const globalEvents = {
  DOMUPDATED: 'dom-updated',
};

function initGlobalState() {
  const globalState = Store({
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    scrollY: window.scrollY,
  }, 'global-state');

  // Setup global lazy loading.
  const lazyLoader = createLazyloader({
    elements_selector: '.lazyContainer',
    callback_enter: (element) => {
      // Uncomment for logging.
      // console.log('ENTERED', element);
      createLazyloader({thresholds: '50px 500px'}, element);
    },
  });
  globalState.setState({lazyLoader});

  window.addEventListener('load', () => {
    globalState.setState({
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
      scrollY: window.scrollY,
    });
  });

  window.addEventListener('scroll', throttle(300, () => {
    globalState.setState({
      scrollY: window.scrollY,
    });
  }));

  window.addEventListener('resize', throttle(300, (event) => {
    globalState.setState({
      innerHeight: event.target.innerHeight,
      innerWidth: event.target.innerWidth,
    });
  }));

  return globalState;
}

const globalState = initGlobalState();


export {globalState, globalEvents};
