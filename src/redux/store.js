import { checkUserIsLogin } from '../utils/checkAuth';
import { setError } from './actions/app.action';
import rootReducer from './rootReducer';
import { createStore, applyMiddleware, compose } from 'redux';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware()));

const initializeStore = async () => {
  try {
    store.dispatch(await checkUserIsLogin());
  } catch (error) {
    store.dispatch(setError());
    if (window.location.pathname.includes('/outside') === false) {
      window.location.href = '/outside/error';
    }
  }
};

initializeStore();

export default store;
