const { expect } = require('chai')
const PathTemplate = require('@ryo33/path-template')
const Page = require('../src/page.js')
const { changePage } = require('../src/action.js')
const createReducer = require('../src/reducer.js')

describe('createReducer(page, params)', function() {
  const template1 = PathTemplate.parse('/:a/:b')
  const template2 = PathTemplate.parse('/:a')
  const template3 = PathTemplate.parse('/')
  const page1 = new Page('page1', template1)
  const page2 = new Page('page2', template2)
  const page3 = new Page('page3', template3)
  const reducer = createReducer(page1.name, {a: 3, b: 5})

  it('should use the given page as the default state', function() {
    expect(reducer(undefined, {type: 'INIT'})).to.eql({
      name: 'page1',
      params: {
        a: 3,
        b: 5
      }
    })
  })

  it('should allow omitting empty objects', function() {
    const reducer = createReducer(page3.name)
    expect(reducer(undefined, {type: 'INIT'})).to.eql({
      name: 'page3',
      params: {}
    })
  })

  it('should change the state', function() {
    let state = reducer(undefined, {type: 'INIT'})

    state = reducer(state, page2.action({a: 7}))
    expect(state).to.eql({
      name: 'page2',
      params: {
        a: 7
      }
    })

    state = reducer(state, page1.action({a: 5, b: 3}))
    expect(state).to.eql({
      name: 'page1',
      params: {
        a: 5,
        b: 3
      }
    })
  })

  it('should ignore unknown actions', function() {
    let state = reducer(undefined, {type: 'INIT'})

    action = page2.action({a: 7})
    action.type = 'UNKNOWN_ACTION'
    state = reducer(state, action)
    expect(state).to.equal(state)
  })
})
