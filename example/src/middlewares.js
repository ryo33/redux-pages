import { CHANGE_PAGE } from 'redux-pages'
import {
  createMiddleware, createReplacer, composeMiddleware
} from 'redux-middlewares'
import { postPage, postsPage, delayPage } from './pages'
import { postsSelector } from './reducers'

const undefinedPostMiddleware = createReplacer(
  CHANGE_PAGE,
  ({getState, action}) => {
    if (action.payload.name === postPage.name) {
      const { params } = action.payload
      const posts = postsSelector(getState())
      return typeof posts[params.id] === 'undefined'
    } else {
      return false
    }
  },
  () => postsPage.action()
)

const delayMiddleware = () => {
  let timeout = null
  const cancelMiddleware = createMiddleware(
    CHANGE_PAGE,
    ({ nextDispatch, action }) => {
      if (timeout) {
        // Cancellation
        clearTimeout(timeout)
        timeout = null
      }
      return nextDispatch(action)
    }
  )
  const timeoutMiddleware = createMiddleware(
    CHANGE_PAGE,
    ({ action }) => action.payload.name === delayPage.name,
    ({ nextDispatch, action }) => {
      const { params } = action.payload
      timeout = setTimeout(() => nextDispatch(action), params.msec)
    }
  )
  return composeMiddleware(
    cancelMiddleware, timeoutMiddleware
  )
}

export default [
  undefinedPostMiddleware,
  delayMiddleware()
]
