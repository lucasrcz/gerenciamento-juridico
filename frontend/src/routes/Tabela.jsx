import React from 'react'
import { Link } from 'react-router-dom'

function Tabela({processos, handleDelete}) {
  return (
    <table className='table table-striped'>
          <thead>
            <tr>
              <th>Nº Processo</th>
              <th>Status</th>
              <th>Estado</th>
              <th>Observações</th>
              <th>Contrato</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {
              processos.map((processo) => (
                <tr key={processo.id}>
                  <td>{processo.numero}</td>
                  <td>{processo.status}</td>
                  <td>{processo.estado}</td>
                  <td>{processo.observacoes}</td>
                  <td>{processo.contrato ? (
                          <span className="file-exists">Arquivo anexado</span> 
                      ) : (
                          <span className="file-missing">Sem contrato</span>
                      )}</td>
                  <td>
                    <Link to={`/read/${processo.id}`} className='btn btn-sm btn-info me-2'>Visualizar</Link>
                    <Link to={`/update/${processo.id}`} className='btn btn-sm btn-primary me-2'>Editar</Link>
                    <button onClick={e => handleDelete(processo.id)} className='btn btn-sm btn-danger'>Deletar</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
  )
}

export default Tabela
