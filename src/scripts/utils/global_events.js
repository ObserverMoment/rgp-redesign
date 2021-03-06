/*
 * Listeners and global state object for data that is needed app wide.
*/
import {throttle} from 'throttle-debounce';
import {Store} from './Store';

const globalEvents = {
  DOMUPDATED: 'dom-updated',
};

function initGlobalState() {
  const globalState = Store({
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    scrollY: window.scrollY,
  }, 'global-state');

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
