const PathTemplate = require('@ryo33/path-template')
const { changePage } = require('../src/action.js')

module.exports = (name, template) => ({
  name,
  template,
  path(params = {}) {
    return PathTemplate.format(template, params)
  },
  action(params = {}) {
    return changePage(name, params)
  }
})
