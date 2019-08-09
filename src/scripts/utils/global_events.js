/*
 * Listeners and emitters that export data that is needed app wide.
*/

import EventEmitter from 'eventemitter3';
import {throttle} from 'throttle-debounce';

const scrollPosEmitter = new EventEmitter();

function setupScrollEvent() {
  window.addEventListener('scroll', throttle(300, () => {
    scrollPosEmitter.emit('scrolling');
  }));
}

function setupGlobalEmitters() {
  setupScrollEvent();
}

export {setupGlobalEmitters, scrollPosEmitter};
