import React from 'react'

export default ({ params, posts, actionCreator }) => (
  <div>
    <h2>Posts</h2>
    <ul>
      {
        posts.map((post, i) => (
          <li key={i}>
            <button onClick={() => actionCreator({id: i})}>{post.title}</button>
          </li>
        ))
      }
    </ul>
  </div>
)
