/*
 * Listeners and emitters that export data that is needed app wide.
*/

import EventEmitter from 'eventemitter3';
import {throttle} from 'throttle-debounce';

const scrollPosEmitter = new EventEmitter();
const screenResizeEmitter = new EventEmitter();

const events = {
  SCROLLING: 'scrolling',
  RESIZING: 'resizing',
};

function setupScrollEvent() {
  window.addEventListener('scroll', throttle(300, () => {
    scrollPosEmitter.emit(events.SCROLLING);
  }));
}

function setupResizeEvent() {
  window.addEventListener('resize', () => {
    screenResizeEmitter.emit(events.RESIZING);
  });
}

(function setupGlobalEmitters() {
  setupScrollEvent();
  setupResizeEvent();
})();

export {scrollPosEmitter, screenResizeEmitter, events};
