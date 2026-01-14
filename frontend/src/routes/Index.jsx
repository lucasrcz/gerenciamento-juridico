import React from 'react'
import { Link } from 'react-router-dom'

function Index() {
  return (
    <div className='p-3'>
      <h2>Em construção...</h2>
      <p>Enquanto isso, continue em <Link to="/processos/list">Processos</Link></p>
    </div>
  )
}

export default Index
