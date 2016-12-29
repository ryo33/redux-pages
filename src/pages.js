const PathTemplate = require('@ryo33/path-template')
const Page = require('./page.js')
const { CHANGE_PAGE, changePage } = require('./action.js')

module.exports = class Pages {
  constructor() {
    this.pages = []
    this._pagesMap = {}
  }

  addPage(path, name) {
    const template = PathTemplate.parse(path)
    if (typeof name === 'undefined') {
      // name is omitted
      name = PathTemplate.inspect(template)
    }
    const page = new Page(name, template)
    this.pages.push(page)
    this._pagesMap[name] = page
    return page
  }

  addChildPage(parent, path, name) {
    const template = PathTemplate.add(parent.template, path)
    if (typeof name === 'undefined') {
      // name is omitted
      name = PathTemplate.inspect(template)
    }
    const page = new Page(name, template)
    this.pages.push(page)
    this._pagesMap[name] = page
    return page
  }

  match(path) {
    for (let i = 0; i < this.pages.length; i ++) {
      const params = PathTemplate.match(this.pages[i].template, path)
      if (typeof params !== 'undefined') {
        const name = this.pages[i].name
        return {name, params}
      }
    }
    throw new Error(`no matches found: ${path}`)
  }

  handleNavigation(store, path) {
    const {name, params} = this.match(path)
    store.dispatch(changePage(name, params))
  }

  storeEnhancer(getCurrentPath, push) {
    return next => (...args) => {
      const store = next(...args)
      const nextDispatch = store.dispatch
      const dispatch = (action) => {
        if (action.type == CHANGE_PAGE) {
          const { name, params } = action.payload
          const page = this._pagesMap[name]
          const matchParams = PathTemplate.match(page.template, getCurrentPath())
          if (typeof matchParams === 'undefined') {
            // The current path does not match the next page
            const path = page.path(params)
            push(path)
          }
        }
        nextDispatch(action)
      }
      return Object.assign(store, {dispatch})
    }
  }
}
