const Pages = require('./pages.js')
const createReducer = require('./reducer.js')
const { CHANGE_PAGE, changePage } = require('./action.js')

const createPages = () => new Pages()

module.exports = {
  createPages,
  createPagesReducer: createReducer,
  CHANGE_PAGE,
  changePage
}
