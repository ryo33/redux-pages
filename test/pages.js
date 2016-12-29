const chai = require('chai')
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);
const PathTemplate = require('@ryo33/path-template')
const Pages = require('../src/pages.js')
const { changePage } = require('../src/action.js')

describe('Pages', function() {
  describe('addPage(name, path)', function() {
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

  describe('addChildPage(page, name, template)', function() {
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
    const pages = new Pages()
    const postsPage = pages.addPage('/posts', 'posts')
    const postPage = pages.addChildPage(postsPage, '/:id', 'post')
    const usersPage = pages.addPage('/users', 'users')
    const userPage1 = pages.addPage('/users/:id', 'user')
    const userPage2 = pages.addPage('/users/:id', 'unreachable1')
    const userPage3 = pages.addPage('/users/:id', 'unreachable2')
    const userPostPage = pages.addChildPage(userPage2, '/posts/:number')

    it('should return a page and params correctly', function() {
      expect(pages.match('/posts')).to.eql({name: 'posts', params: {}})
      expect(pages.match('/posts/11')).to.eql({name: 'post', params: {id: '11'}})
      expect(pages.match('/users')).to.eql({name: 'users', params: {}})
      expect(pages.match('/users/3/posts/5'))
        .to.eql({name: '/users/:id/posts/:number', params: {id: '3', number: '5'}})
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

    it('should dispatch the correct action when the given path', function() {
      const dispatchSpy = sinon.spy()
      const store = {
        dispatch: dispatchSpy
      }
      pages.handleNavigation(store, '/posts/3')
      const args = dispatchSpy.args[0] // args in the first call
      expect(args).to.eql([changePage('post', {id: '3'})])
      expect(dispatchSpy.calledOnce).to.true
    })

    it('should throw an error when no match is found', function() {
      const store = {
        dispatch(action) {}
      }
      expect(() => pages.handleNavigation(store, '/users'))
        .to.throw(Error, 'no matches found: /users')
    })
  })

  describe('storeEnhancer(getCurrentPath, push)', function() {
    const pages = new Pages()
    const postsPage = pages.addPage('/posts', 'posts')
    const postPage = pages.addChildPage(postsPage, '/:id', 'post')
    const errorPage = pages.addChildPage(postPage, '/*', 'error')

    const dispatch = () => {}
    const storeCreator = () => ({dispatch})
    const reducer = (state = {}, action) => state

    let pushSpy

    beforeEach(function() {
      pushSpy = sinon.spy()
    })

    it('should push the correct path', function() {
      const getCurrentPath = () => '/unknown/path'
      const store = pages.storeEnhancer(getCurrentPath, pushSpy)(storeCreator)(reducer)
      store.dispatch(postPage.action({id: 3}))
      expect(pushSpy).to.have.been.calledWithExactly('/posts/3')
      expect(pushSpy.calledOnce).to.true
    })

    it('should not push the same path as the current one', function() {
      const getCurrentPath = () => '/posts/3'
      const store = pages.storeEnhancer(getCurrentPath, pushSpy)(storeCreator)(reducer)
      store.dispatch(postPage.action({id: 3}))
      expect(pushSpy).to.not.have.been.called
      store.dispatch(postsPage.action())
      expect(pushSpy).to.have.been.calledWithExactly('/posts')
      expect(pushSpy.calledOnce).to.true
    })

    it('should not push a path which matches the next page', function() {
      const getCurrentPath = () => '/posts/3/something'
      const store = pages.storeEnhancer(getCurrentPath, pushSpy)(storeCreator)(reducer)
      store.dispatch(errorPage.action({}))
      expect(pushSpy).to.not.have.been.called
    })
  })
})
