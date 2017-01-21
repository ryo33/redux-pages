const { expect } = require('chai')
const PathTemplate = require('@ryo33/path-template')
const createPage = require('../src/page.js')
const { changePage } = require('../src/action.js')

describe('Page', function() {
  const template = PathTemplate.parse('/:a/:b')
  const page = createPage('page1', template)

  const staticTemplate = PathTemplate.parse('/static/page')
  const staticPage = createPage('page2', staticTemplate)

  it('should have \'name\' and \'template\' key', function() {
    expect(page.name).to.equal('page1')
    expect(page.template).to.equal(template)
  })

  describe('path(params)', function() {
    it('should return a path correctly', function() {
      const path = page.path({a: 'posts', b: 3})
      expect(path).to.equal('/posts/3')
    })

    it('should allow omitting empty objects', function() {
      const path = staticPage.path()
      expect(path).to.equal('/static/page')
    })
  })

  describe('action(params)', function() {
    it('should return an action correctly', function() {
      const action = page.action({a: 'posts', b: 3})
      expect(action).to.eql(changePage('page1', {a: 'posts', b: 3}))
    })

    it('should allow omitting empty objects', function() {
      const action = staticPage.action({})
      expect(action).to.eql(changePage('page2', {}))
    })
  })

  describe('check(action)', function() {
    it('should check an action correctly', function() {
      expect(page.check(changePage('page1', {a: 'a', b: 'b'}))).to.true
      expect(page.check(changePage('page1', {}))).to.true
      expect(page.check(changePage('page2', {a: 'a', b: 'b'}))).to.false
    })

    it('should allow any actions', function() {
      expect(page.check({type: 'ANY_ACTION'})).to.false
    })
  })

  it('should work without this', function() {
    const path = page.path.call(null, {a: 'posts', b: 3})
    expect(path).to.equal('/posts/3')
    const action = page.action.call(null, {a: 'posts', b: 3})
    expect(action).to.eql(changePage('page1', {a: 'posts', b: 3}))
  })
})
