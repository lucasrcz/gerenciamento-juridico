import React from 'react'
import { Link } from 'react-router-dom'

function Tabela({partes, handleDelete}) {
  return (
    <table className='table table-striped'>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {
              partes.map((parte) => (
                <tr key={parte.id}>
                  <td>{parte.nome}</td>
                  <td>{parte.tipoPessoa}</td>
                  <td>{parte.email}</td>
                  <td>{parte.telefone}</td>
                  <td>
                    <Link to={`/partes/read/${parte.id}`} className='btn btn-opaque bi bi-eye-fill me-1' title='Visualizar'></Link>
                    <Link to={`/update/${parte.id}`} className='btn btn-opaque bi bi-pencil-fill me-1' title='Editar'></Link>
                    <button onClick={e => handleDelete(parte.id, parte.tipoPessoa)} className='btn btn-opaque text-danger bi bi-trash3-fill' title='Desativar'></button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
  )
}

export default Tabela
