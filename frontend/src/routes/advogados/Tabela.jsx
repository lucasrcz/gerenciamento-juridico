import React from 'react'
import { Link } from 'react-router-dom'

function Tabela({advogados, handleDelete}) {
  return (
    <table className='table table-striped'>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Número OAB</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {
              advogados.map((advogado) => (
                <tr key={advogado.id}>
                  <td>{advogado.nome}</td>
                  <td>{advogado.cpf}</td>
                  <td>{advogado.email}</td>
                  <td>{advogado.telefone}</td>
                  <td>{advogado.numeroOAB}/{advogado.seccional}</td>
                  <td>
                    <Link to={`/advogados/read/${advogado.id}`} className='btn btn-opaque bi bi-eye-fill me-1' title='Visualizar'></Link>
                    <Link to={`/advogados/update/${advogado.id}`} className='btn btn-opaque bi bi-pencil-fill me-1' title='Editar'></Link>
                    <button onClick={e => handleDelete(advogado.id)} className='btn btn-opaque text-danger bi bi-trash3-fill' title='Deletar'></button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
  )
}

export default Tabela
