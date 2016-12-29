const { CHANGE_PAGE } = require('../src/action.js')

module.exports = (defaultPage, params = {}) =>
  (state = {name: defaultPage, params}, action) => {
    if (action.type == CHANGE_PAGE) {
      return action.payload
    } else {
      return state
    }
  }
