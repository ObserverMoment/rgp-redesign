/*
 * Listeners and emitters that export data that is needed app wide.
*/

import EventEmitter from 'eventemitter3';
import {throttle} from 'throttle-debounce';

const globalEmitter = new EventEmitter();

const events = {
  SCROLLING: 'scrolling',
  RESIZING: 'resizing',
};

(function setupGlobalEmitter() {
  window.addEventListener('scroll', throttle(300, () => {
    globalEmitter.emit(events.SCROLLING);
  }));

  window.addEventListener('resize', () => {
    globalEmitter.emit(events.RESIZING);
  });
})();

export {globalEmitter, events};
