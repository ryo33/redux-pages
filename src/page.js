const PathTemplate = require('@ryo33/path-template')
const { changePage, CHANGE_PAGE } = require('../src/action.js')

module.exports = (name, template) => ({
  name,
  template,
  path(params = {}) {
    return PathTemplate.format(template, params)
  },
  action(params = {}) {
    return changePage(name, params)
  },
  check({ type, payload }) {
    return type === CHANGE_PAGE && payload.name === name
  }
})
