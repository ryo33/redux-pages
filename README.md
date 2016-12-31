# redux-pages
A middleware-friendly routing helper that encapsulates raw URL paths.

## Features
- Middleware friendly
- Raw URL paths is only used at definition
- Rich template syntax

redux-pages uses [@ryo33/path-template](https://github.com/ryo33/path-template).

## Workflow
- `[P]` Change the current path
- `[A]` Dispatch an action
- `[M]` Middlewares (redirecting, handling side effects, etc.)
- `[S]` Change the state

### When changing the current path directly
```
[P] ---> [A] ---> [M] ---> [S]
```


### When dispatching an action to change the page
```
[A] -+-> [M] ---> [S]
     +-> [P]
```

## Installation
```bash
$ npm install -S redux-pages
```

## Example
- [Demo](http://ryo33.com/redux-pages/#/)
- [src](https://github.com/ryo33/redux-pages/tree/master/example/src)

## Usage
```javascript
import { createStore,
  combineReducers, applyMiddleware } from 'redux'
import createHistory from 'history/createBrowserHistory'
import { createPages, createPagesReducer } from 'redux-pages'

// Define pages
const pages = createPages()
const indexPage = pages.addPage('/', 'index')
const postsPage = pages.addPage('/posts', 'posts')
const postPage = pages.addPage('/posts/:id', 'post')
const usersPage = pages.addPage('/users', 'users')
const userPage = pages.addPage('/users/:id', 'user')
const userPostPage = pages.addChildPage(
  userPage, '/posts/:number', 'userPost',
  {number: str => parseInt(str, 10)})
const errorPage = pages.addPage('/*', 'error')

const pageReducer = createPagesReducer(indexPage.name, {})
const reducer = combineReducers({
  page: pageReducer
})

const pageSelector = state => state.page

const history = createHistory()
const getCurrentPath = () => history.location.pathname
const pushPath = (path) => history.push(path)
const pagesMiddleware = pages.middleware(pageSelector, getCurrentPath, pushPath)

const store = createStore(
  reducer,
  applyMiddleware(pagesMiddleware)
)
pages.handleNavigation(store, history.location.pathname)
history.listen((location, action) => {
  pages.handleNavigation(store, location.pathname)
})

// Dispatch the action to change the page
store.dispatch(userPostPage.action({id: '5', number: 2}))
// history.location.pathname => '/users/5/posts/2'
// store.getState().page => {name: 'userPost', params: {id: '5', number: 2}}

// Change the path directly
history.push(userPage.path({id: '7'}))
// history.location.pathname => '/users/7'
// store.getState().page => {name: 'user', params: {id: '7'}}

// Go to the error page
history.push('/users/7/posts')
// history.location.pathname => '/users/7/posts'
// store.getState().page => {name: 'error', params: {}}
```

## API

```javascript
import {
  createPages,
  createPagesReducer,
  changePage,
  CHANGE_PAGE
} from 'redux-pages'
```

### `createPages() => pages`
Creates a pages object.

- `pages` A pages object

### `pages.addPage(template, name, [mapperObject]) => page`
Adds a page.

- `template` The URL path template
[Template Syntax](https://github.com/ryo33/path-template#template-syntax)
- `name` The name of the page
- `mapperObject` An object to map parsed params  
  [Example]  
  parsedParams: `{id: '3', number: '5'}`  
  mapperObject: `{number: str => parseInt(str, 10)}`  
  paramsForState: `{id: '3', number: 5}`  
- `page` A page object
  - `page.name` The name of the page
  - `page.path([params])` Returns a path with the given `params`
  - `page.action([params])` Returns a action with the given `params`

### `pages.addChildPage(page, template, name, [mapperObject]) => childPage`
Adds a child page for the given `page`.

### `pages.handleNavigation(store, pathname)`
Handles a navigation event.

It matches the given pathname in order of `addPage`/`addChildPage` is called.

- `store` A store
- `pathname` A pathname

### `pages.middleware(pageSelector, getCurrentPath, pushPath) => middleware`
Changes the path when the middleware receives an changePage action.

- `pageSelector` A selector for the page state
- `getCurrentPath` A function to get the current path
- `pushPath` A function to push the path

### `createPagesReducer([name], [params]) => reducer`
Create a reducer.

The state shape is `{name, params}`.

- `name` `params` The initial state

### `changePage(name, params) => action`
Creates an action with given name and params.

- `action` `{ type: CHANGE_PAGE, payload: {name: 'PAGE_NAME', params: PAGE_PARAMS}}`

### `CHANGE_PAGE`
The type of actions to change the page.

## Author
Ryo Hashiguchi (Ryo33)

## LICENSE
MIT
