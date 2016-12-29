const { expect } = require('chai')
const { CHANGE_PAGE, changePage } = require('../src/action.js')

describe('changePage', function() {
  it('should return a action correctly', function() {
    const action = changePage('posts', {id: '3'})
    expect(action).to.eql({
      type: CHANGE_PAGE,
      payload: {name: 'posts', params: {id: '3'}}
    })
  })
})
