import React from 'react'
import { Link } from 'react-router-dom'

function Tabela({advogados, handleDelete}) {
  return (
    <table className='table table-striped'>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
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
                    <Link to={`/advogados/read/${advogado.id}`} className='btn btn-sm btn-info me-2'>Visualizar</Link>
                    <Link to={`/update/${advogado.id}`} className='btn btn-sm btn-primary me-2'>Editar</Link>
                    <button onClick={e => handleDelete(advogado.id)} className='btn btn-sm btn-danger'>Deletar</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
  )
}

export default Tabela
