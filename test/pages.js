const chai = require('chai')
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);
const PathTemplate = require('@ryo33/path-template')
const Pages = require('../src/pages.js')
const { changePage } = require('../src/action.js')

describe('Pages', function() {
  describe('addPage(path, name, mapper)', function() {
    it('should return a page correctly', function() {
      const pages = new Pages()
      const postPage = pages.addPage('/posts/:id', 'post')
      expect(postPage.name).to.equal('post')
      expect(postPage.path({id: 3})).to.equal('/posts/3')
      expect(postPage.action({id: 3})).to.eql(changePage('post', {id: 3}))
    })

    it('should use the template string as the name if name is omitted', function() {
      const pages = new Pages()
      const userPage = pages.addPage('/users/:id')
      expect(userPage.name).to.equal('/users/:id')
      expect(userPage.path({id: 3})).to.equal('/users/3')
      expect(userPage.action({id: 3})).to.eql(changePage('/users/:id', {id: 3}))
    })
  })

  describe('addChildPage(page, path, name, mapper)', function() {
    it('should return a page correctly', function() {
      const pages = new Pages()
      const userPage = pages.addPage('/users/:id')
      const userPostPage = pages.addChildPage(userPage, '/posts/:number', 'userPost')
      expect(userPostPage.name).to.equal('userPost')
      expect(userPostPage.path({id: 3, number: 5})).to.equal('/users/3/posts/5')
      expect(userPostPage.action({id: 3, number: 5}))
        .to.eql(changePage('userPost', {id: 3, number: 5}))
    })

    it('should use the template string as the name if name is omitted', function() {
      const pages = new Pages()
      const userPage = pages.addPage('/users/:id')
      const userPostPage = pages.addChildPage(userPage, '/posts/:number')
      expect(userPostPage.name).to.equal('/users/:id/posts/:number')
      expect(userPostPage.path({id: 3, number: 5})).to.equal('/users/3/posts/5')
      expect(userPostPage.action({id: 3, number: 5}))
        .to.eql(changePage('/users/:id/posts/:number', {id: 3, number: 5}))
    })
  })

  describe('match(path)', function() {
    const toInt = str => parseInt(str, 10)
    const pages = new Pages()
    const postsPage = pages.addPage('/posts', 'posts')
    const postPage = pages.addChildPage(postsPage, '/:id', 'post')
    const usersPage = pages.addPage('/users', 'users')
    const userPage1 = pages.addPage('/users/:id', 'user')
    const userPage2 = pages.addPage('/users/:id', 'unreachable1')
    const userPage3 = pages.addPage('/users/:id', 'unreachable2')
    const logPage = pages.addPage('/logs/:number', 'log', {number: toInt})
    const userPostPage = pages.addChildPage(
      userPage2, '/posts/:number', 'userPost', {number: toInt})

    it('should return a page and params correctly', function() {
      expect(pages.match('/posts')).to.eql({name: 'posts', params: {}})
      expect(pages.match('/posts/11')).to.eql({name: 'post', params: {id: '11'}})
      expect(pages.match('/users')).to.eql({name: 'users', params: {}})
    })

    it('should use the given mapper object', function() {
      expect(pages.match('/logs/3'))
        .to.eql({name: 'log', params: {number: 3}})
      expect(pages.match('/users/3/posts/5'))
        .to.eql({name: 'userPost', params: {id: '3', number: 5}})
    })

    it('should prioritize matches first', function() {
      expect(pages.match('/users/7')).to.eql({name: 'user', params: {id: '7'}})
    })

    it('should throw an error when no match is found', function() {
      expect(() => pages.match('/comments/3'))
        .to.throw(Error, 'no matches found: /comments/3')
      expect(() => pages.match('/users/3/posts'))
        .to.throw(Error, 'no matches found: /users/3/posts')
    })
  })

  describe('handleNavigation(store, path)', function() {
    const pages = new Pages()
    const postsPage = pages.addPage('/posts', 'posts')
    const postPage = pages.addChildPage(postsPage, '/:id', 'post')
    const dispatchSpy = sinon.spy()
    const store = {
      dispatch: dispatchSpy,
      getState: () => ({page: {name: 'error', params: {}}})
    }

    afterEach(function() {
      dispatchSpy.reset()
    })

    it('should dispatch a correct action', function() {
      pages.handleNavigation(store, '/posts/3')
      const args = dispatchSpy.args[0] // args in the first call
      expect(args).to.eql([changePage('post', {id: '3'})])
      expect(dispatchSpy.calledOnce).to.true
    })

    it('should throw an error when no match is found', function() {
      expect(() => pages.handleNavigation(store, '/users'))
        .to.throw(Error, 'no matches found: /users')
    })
  })

  describe('storeEnhancer(pageSelector, getCurrentPath, push)', function() {
    const pages = new Pages()
    const postsPage = pages.addPage('/posts', 'posts')
    const postPage = pages.addChildPage(postsPage, '/:number', 'post',
      {number: str => parseInt(str, 10)})
    const errorPage = pages.addChildPage(postPage, '/*', 'error')

    const dispatchSpy = sinon.spy()
    const getStateStub = sinon.stub()
    const storeCreator = () => ({dispatch: dispatchSpy, getState: getStateStub})
    const pageSelector = state => state.page
    const reducer = (state = {}, action) => state

    const pushSpy = sinon.spy()

    beforeEach(function() {
      getStateStub.returns({page: {name: 'error', params: {}}})
    })

    afterEach(function() {
      dispatchSpy.reset()
      pushSpy.reset()
    })

    it('should dispatch when state is not changed', function() {
      const getCurrentPath = () => '/unknown/path'
      const store = pages
        .storeEnhancer(pageSelector, getCurrentPath, pushSpy)(storeCreator)(reducer)
      const action = changePage('post', {number: 3})
      store.dispatch(action)
      expect(dispatchSpy).to.have.been.calledWithExactly(action)
      expect(dispatchSpy.calledOnce).to.true
    })

    it('should not dispatch when state is not changed', function() {
      getStateStub.returns({page: {name: 'post', params: {number: 3}}})
      const getCurrentPath = () => '/posts/3'
      const store = pages
        .storeEnhancer(pageSelector, getCurrentPath, pushSpy)(storeCreator)(reducer)
      const action = changePage('post', {number: 3})
      store.dispatch(action)
      expect(dispatchSpy).to.not.have.been.called
    })

    it('should push the correct path', function() {
      const getCurrentPath = () => '/unknown/path'
      const store = pages
        .storeEnhancer(pageSelector, getCurrentPath, pushSpy)(storeCreator)(reducer)
      const action = postPage.action({number: 3})
      store.dispatch(action)
      expect(pushSpy).to.have.been.calledWithExactly('/posts/3')
      expect(pushSpy.calledOnce).to.true

      expect(dispatchSpy).to.have.been.calledWithExactly(action)
      expect(dispatchSpy.calledOnce).to.true
    })

    it('should not push the same path as the current one', function() {
      const getCurrentPath = () => '/posts/3'
      const store = pages
        .storeEnhancer(pageSelector, getCurrentPath, pushSpy)(storeCreator)(reducer)
      store.dispatch(postPage.action({number: 3}))
      expect(pushSpy).to.not.have.been.called
      pushSpy.reset()

      store.dispatch(postsPage.action())
      expect(pushSpy).to.have.been.calledWithExactly('/posts')
      expect(pushSpy.calledOnce).to.true
      pushSpy.reset()

      store.dispatch(postPage.action({number: 4}))
      expect(pushSpy).to.have.been.calledWithExactly('/posts/4')
      expect(pushSpy.calledOnce).to.true
    })

    it('should not push a path which matches the next page', function() {
      const getCurrentPath = () => '/posts/3/something'
      const store = pages
        .storeEnhancer(pageSelector, getCurrentPath, pushSpy)(storeCreator)(reducer)
      store.dispatch(errorPage.action({number: 3}))
      expect(pushSpy).to.not.have.been.called
    })
  })
})
