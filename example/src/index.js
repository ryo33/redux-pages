import React from 'react'
import ReactDOM from 'react-dom'
import {
  createStore, combineReducers, applyMiddleware
} from 'redux'
import { Provider } from 'react-redux'
import createLogger from 'redux-logger'
import createHistory from 'history/createHashHistory'
import { createPagesReducer } from 'redux-pages'
import App from './App'
import { pages, rootPage } from './pages'
import { reducers } from './reducers'
import middlewares from './middlewares'

// Create a reducer
const pageReducer = createPagesReducer(rootPage.name, {})
const reducer = combineReducers({
  ...reducers,
  page: pageReducer
})

// Define the selector for the page state
const pageSelector = state => state.page

// Define getCurrentPath and pushPath
const history = createHistory({
})
const getCurrentPath = () => history.location.pathname
const pushPath = (path) => history.push(path)

const logger = createLogger()

// Create the pagesMiddleware
const pagesMiddleware = pages
  .middleware(pageSelector, getCurrentPath, pushPath)

// Create the store
const store = createStore(
  reducer,
  applyMiddleware(pagesMiddleware, ...middlewares, logger),
)

// Apply the current path
pages.handleNavigation(store, history.location.pathname)

// Listen for changes
history.listen((location, action) => {
  pages.handleNavigation(store, location.pathname)
})

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
