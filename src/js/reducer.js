/** @jsx h */
import reducers from './reducers';
import { combineReducers } from 'redux';

const reducer = combineReducers(reducers);
const reducerWithPerf = (state, action) => {
    const before = new Date();
    const newState = reducer(state, action);
    const after = new Date();
    const perf = after - before;
    return Object.assign({}, newState, { perf });
};

export default reducerWithPerf;
