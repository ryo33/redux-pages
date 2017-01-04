import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  rootPage,
  postsPage,
  postPage,
  delayPage,
  errorPage
} from './pages'
import Root from './Root'
import Posts from './Posts'
import Post from './Post'
import Delay from './Delay'
import Error from './Error'


const mapStateToProps = ({ page, posts }) => ({page, posts})
const actionCreators = {
  rootPageAction: rootPage.action,
  postsPageAction: postsPage.action,
  postPageAction: postPage.action,
  delayPageAction: delayPage.action,
}

class App extends Component {
  router() {
    const { page, posts, postPageAction } = this.props
    const { name, params } = page
    switch (name) {
      case rootPage.name:
        return <Root />
      case postsPage.name:
        return <Posts posts={posts} actionCreator={postPageAction} />
      case postPage.name:
        return <Post params={params} posts={posts} />
      case delayPage.name:
        return <Delay params={params} />
      case errorPage.name:
        return <Error />
      default:
        return <div />
    }
  }

  render() {
    const {
      page, rootPageAction, postsPageAction, postPageAction, delayPageAction
    } = this.props

    const link = (text, action, params = {}) => (
      <button onClick={() => action(params)}>{text}</button>
    )

    return (
      <div>
        <a href="https://github.com/ryo33/redux-pages/tree/master/example/src">
          https://github.com/ryo33/redux-pages/tree/master/example/src
        </a>
        <h1>Example</h1>
        <p><a href="https://github.com/evgenyrodionov/redux-logger">redux-logger</a> is used on this example.</p>
        <ul>
          <li>
            {link('/', rootPageAction)}
          </li>
          <li>
            {link('/posts', postsPageAction)}
          </li>
          <li>
            {link('/posts/0', postPageAction, {id: 0})}
          </li>
          <li>
            {link('/post/4', postPageAction, {id: 4})} (does not exist)
          </li>
          <li>
            {link('/delay/1000', delayPageAction, {msec: 1000})} (1000ms delay)
          </li>
          <li>
            <a href="#/unknown/path">/unknown/path</a> (404)
          </li>
        </ul>
        <pre>{`
{
  name: "${page.name}",
  params: ${JSON.stringify(page.params)}
}
        `}</pre>
        {this.router(page)}
      </div>
    )
  }
}

export default connect(mapStateToProps, actionCreators)(App)
