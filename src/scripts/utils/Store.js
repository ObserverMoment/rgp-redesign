import EventEmitter from 'eventemitter3';

const storeEvents = {
  STATECREATED: 'state-created',
  STATEUPDATED: 'state-updated',
};

let storeId = 0;

function Store(initialState, name) {
  storeId++;
  let state = {...initialState};
  const id = storeId;
  const storeName = name;
  const stateEventEmitter = new EventEmitter();
  stateEventEmitter.emit(`${storeName}-${storeEvents.STATECREATED}`, initialState);

  return {
    getId() {
      return id;
    },
    getName() {
      return storeName;
    },
    getState() {
      return {...state};
    },
    setState(newState, noMerge = false) {
      state = noMerge ? {...newState} : {...state, ...newState};
      stateEventEmitter.emit(`${storeName}-${storeEvents.STATEUPDATED}`, state);
    },
    onStateUpdate(subscriberFn) {
      stateEventEmitter.on(`${storeName}-${storeEvents.STATEUPDATED}`, (newState) => subscriberFn(newState));
    },
  };
}

export {Store, storeEvents};
