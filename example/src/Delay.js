import React from 'react'

export default ({ params }) => (
  <div>
    <h2>Delay</h2>
    <p>It was displayed after {params.msec} ms delay</p>
  </div>
)
