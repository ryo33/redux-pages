import { CHANGE_PAGE } from 'redux-pages';
import { postPage, postsPage, delayPage } from './pages';
import { postsSelector } from './reducers';

const pageMiddleware = store => next => action => {
  const isChangePage = action.type === CHANGE_PAGE;
  if (isChangePage && action.payload.name === postPage.name) {
    const { params } = action.payload;
    const posts = postsSelector(store.getState());
    const post = posts[params.id];
    if (typeof post !== 'undefined') {
      next(action);
    } else {
      // The post doesn't exist.
      store.dispatch(postsPage.action());
    }
  } else {
    return next(action);
  }
}

const delayMiddleware = () => {
  let timeout = null;
  return store => next => action => {
    if (action.type === CHANGE_PAGE) {
      if (timeout) { // Cancellation
        clearTimeout(timeout);
        timeout = null;
      }
      if (action.payload.name === delayPage.name) {
        const { params } = action.payload;
        timeout = setTimeout(() => next(action), params.msec);
      } else {
        return next(action);
      }
    } else {
      return next(action);
    }
  }
}

export default [
  pageMiddleware,
  delayMiddleware()
]
