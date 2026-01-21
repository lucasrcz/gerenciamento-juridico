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
              <th><center>Ações</center></th>
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
                    <Link to={`/processos/read/${processo.id}`} className='btn btn-opaque bi bi-eye-fill me-1' title='Visualizar'></Link>
                    <Link to={`/update/${processo.id}`} className='btn btn-opaque bi bi-pencil-fill me-1' title='Editar'></Link>
                    <button onClick={e => handleDelete(processo.id)} className='btn btn-opaque text-danger bi bi-trash3-fill' title='Deletar'></button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
  )
}

export default Tabela
