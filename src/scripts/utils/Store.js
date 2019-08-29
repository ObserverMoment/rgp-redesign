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
    // Warning - setting noMarge to true will overwrite state object!
    setState(newState, noMerge = false) {
      const oldStateMemo = {...state};
      if (noMerge) {
        // Notify all listeners of the state that is about to be overwritten.
        Object.keys(state).forEach((key) => stateEventEmitter.emit(`${storeName}-${storeEvents.STATEUPDATED}-${key}`, state));
        state = {...newState};
      } else {
        state = {...state, ...newState};
        // Emit individual attribute change events, but only when the key has actually changed.
        // Watch out for shallow comparison issues with nested objects!
        Object.keys(newState).forEach((key) => {
          if (newState[key] !== oldStateMemo[key]) {
            stateEventEmitter.emit(`${storeName}-${storeEvents.STATEUPDATED}-${key}`, state);
          }
        });
      }

      // Then the general state change event.
      stateEventEmitter.emit(`${storeName}-${storeEvents.STATEUPDATED}`, state);
    },
    // Allows for creation of, and subscription to, any custom events on the individual store.
    notify(eventName) {
      stateEventEmitter.emit(`${storeName}-${eventName}`, state);
    },
    subscribe(eventName, subscriberFn) {
      stateEventEmitter.on(`${storeName}-${eventName}`, (newState) => subscriberFn(newState));
    },
    // Subscribe to any updates to any attributes on the state.
    onStateUpdate(subscriberFn) {
      stateEventEmitter.on(`${storeName}-${storeEvents.STATEUPDATED}`, (newState) => subscriberFn(newState));
    },
    // Subscribe to changes to a specific key or array of keys in state (similar to react Hooks deps array.)
    onAttributeUpdate(subscriberFn, keys) {
      if (!keys) { throw Error('Keys arg is required to subscribe to an attribute change'); }
      const depsArray = Array.isArray(keys) ? keys : [keys];
      depsArray.forEach((key) => {
        // Check that the key is actually in the state object and a valid dependency.
        if (Object.keys(state).includes(key)) {
          stateEventEmitter.on(`${storeName}-${storeEvents.STATEUPDATED}-${key}`, (newState) => subscriberFn(newState));
        } else {
          throw Error(`Store.onAttributeUpdate - the key '${key}' does not exist on the state object you are trying to subscribe to.`);
        }
      });
    },
    viewSubscriptions() {
      return {
        eventsHistory: stateEventEmitter._events,
        subscriberCount: stateEventEmitter._eventsCount,
      };
    },
  };
}

export {Store, storeEvents};
