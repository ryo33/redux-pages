import React from 'react'

export default ({ params, posts }) => {
  const id = params.id
  const { title, text } = posts[id]
  return (
    <div>
      <h2>{title}</h2>
      <p>id: {id}</p>
      <p>text: {text}</p>
    </div>
  )
}
