import { checkUserIsLogin } from '../utils/checkAuth';
import rootReducer from './rootReducer';
import { createStore, applyMiddleware, compose } from 'redux'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware()));
store.dispatch(await checkUserIsLogin());

export default store;