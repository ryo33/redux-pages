const { expect } = require('chai')
const { createStore, combineReducers } = require('redux')
const createHistory = require('history').createMemoryHistory
const {
  createPages, createPagesReducer
} = require('../src/index.js')

describe('example', function() {
  it('should work correctly', function() {
    // Pages
    const pages = createPages()
    const indexPage = pages.addPage('/', 'index')
    const postsPage = pages.addPage('/posts', 'posts')
    const postPage = pages.addChildPage(postsPage, '/:id', 'post')
    const usersPage = pages.addPage('/users', 'users')
    const userPage = pages.addPage('/users/:id', 'user')
    const userPostPage = pages.addChildPage(
      userPage, '/posts/:number', 'userPost',
      {number: str => parseInt(str, 10)})
    const errorPage = pages.addPage('/*', 'error')

    const pageReducer = createPagesReducer(indexPage.name, {})
    const reducer = combineReducers({
      page: pageReducer
    })

    const history = createHistory()
    const getCurrentPath = () => history.location.pathname
    const pushPath = (path) => history.push(path)

    const store = createStore(
      reducer,
      pages.storeEnhancer(getCurrentPath, pushPath)
    )
    history.listen((location, action) => {
      pages.handleNavigation(store, location.pathname)
    })

    function expectToBe(pathname, name, params) {
      expect(history.location.pathname).to.equal(pathname)
      expect(store.getState().page).to.eql({ name, params })
    }

    expectToBe('/', 'index', {})

    store.dispatch(postPage.action({id: "3"}))
    expectToBe('/posts/3', 'post', {id: "3"})

    store.dispatch(userPostPage.action({id: "5", number: 2}))
    expectToBe('/users/5/posts/2', 'userPost', {id: "5", number: 2})

    history.push('/users/7')
    expectToBe('/users/7', 'user', {id: "7"})

    history.push('/users/7/posts')
    expectToBe('/users/7/posts', 'error', {})
  })
})
