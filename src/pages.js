const PathTemplate = require('@ryo33/path-template')
const equal = require('deep-equal')
const createPage = require('./page.js')
const { CHANGE_PAGE, changePage } = require('./action.js')

module.exports = class Pages {
  constructor() {
    this.pages = {}
    this.pagesList = []
    this.mappers = {}
    this._lastPushedPath = []
  }

  addPage(path, name, mapper = {}) {
    const template = PathTemplate.parse(path)
    if (typeof name === 'undefined') {
      // name is omitted
      name = PathTemplate.inspect(template)
    }
    const page = createPage(name, template)
    this.pagesList.push(page)
    this.pages[name] = page
    this.mappers[name] = mapper
    return page
  }

  addChildPage(parent, path, name, mapper = {}) {
    const template = PathTemplate.add(parent.template, path)
    if (typeof name === 'undefined') {
      // name is omitted
      name = PathTemplate.inspect(template)
    }
    const page = createPage(name, template)
    this.pagesList.push(page)
    this.pages[name] = page
    this.mappers[name] = mapper
    return page
  }

  _mapParams(name, params) {
    const mapper = this.mappers[name]
    Object.keys(mapper).forEach(key => {
      params[key] = mapper[key](params[key])
    })
  }

  match(path) {
    for (let i = 0; i < this.pagesList.length; i ++) {
      const page = this.pagesList[i]
      const params = PathTemplate.match(page.template, path)
      if (typeof params !== 'undefined') {
        const name = page.name
        this._mapParams(name, params)
        return {name, params}
      }
    }
    throw new Error(`no matches found: ${path}`)
  }

  handleNavigation(store, path) {
    if (this._lastPushedPath[0] === path) {
      this._lastPushedPath.shift()
    } else {
      const {name, params} = this.match(path)
      store.dispatch(changePage(name, params))
    }
  }

  middleware(pageSelector, getCurrentPath, push) {
    return store => next => action => {
      if (action.type == CHANGE_PAGE) {
        const { name, params } = action.payload

        // Push
        const page = this.pages[name]
        const path = page.path(params)
        const currentPath = getCurrentPath()
        if (path !== currentPath) {
          const matchParams = PathTemplate.match(page.template, currentPath)
          let doesNotMatch = false
          if (typeof matchParams !== 'undefined') {
            this._mapParams(name, matchParams)
            if (!equal(params, matchParams)) {
              doesNotMatch = true
            }
          } else {
            doesNotMatch = true
          }
          if (doesNotMatch) {
            this._lastPushedPath.push(path)
            push(path)
          }
        }

        // Dispatch
        const currentPage = pageSelector(store.getState())
        if (currentPage.name !== name || !equal(currentPage.params, params)) {
          next(action)
        }
      } else {
        next(action)
      }
    }
  }
}
