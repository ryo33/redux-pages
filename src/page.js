const PathTemplate = require('@ryo33/path-template')
const { changePage } = require('../src/action.js')

module.exports = class Page {
  constructor(name, template) {
    this.name = name
    this.template = template
  }

  path(params = {}) {
    return PathTemplate.format(this.template, params)
  }

  action(params = {}) {
    return changePage(this.name, params)
  }
}
