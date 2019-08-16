import EventEmitter from 'eventemitter3';

const storeEvents = {
  STATECREATED: 'state-created',
  STATEUPDATED: 'state-updated',
};

let storeId = 0;

const stateEventEmitter = new EventEmitter();

function Store(initialState, name) {
  storeId++;
  stateEventEmitter.emit(`${name}-${storeEvents.STATECREATED}`, initialState);
  return {
    id: storeId,
    name,
    state: {...initialState},
    getState() {
      return this.state;
    },
    setState(newState, noMerge = false) {
      this.state = noMerge ? {...newState} : {...this.state, ...newState};
      this.eventEmitter.emit(`${this.name}-${storeEvents.STATEUPDATED}`, this.state);
    },
    eventEmitter: stateEventEmitter,
  };
}

export {Store, storeEvents, stateEventEmitter};
