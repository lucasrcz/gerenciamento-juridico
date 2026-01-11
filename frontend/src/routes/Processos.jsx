import { useEffect, useState } from 'react'
import { api } from '../services/API';
import { Link } from 'react-router-dom'

function Processos() {
  const [processos, setProcessos] = useState([])

  useEffect(()=> {
    api.get('/processos')
    .then(res => setProcessos(res.data.content || res.data))
    .catch(err => console.log(err));
  }, [])

  const handleDelete = (id) => {
    const confirm = window.confirm("Tem certeza que deseja deletar o processo?" );
    if(confirm) {
      api.delete('/processos/' + id)
      .then(res => {
        setProcessos(processos.filter(p => p.id !== id));
      })
      .catch(err => console.log(err));
    }
  }

  return (
    <div className='d-flex flex-column justify-content-center align-items-center bg-light vh-100'>

      <h2>Lista de Processos Jurídicos</h2><br></br>
      <div className='w-75 rounded bg-white border shadow p-4'>
        <div className='d-fex justify-content-end'>
          <Link to="/create" className='btn btn-success'>Cadastrar Processo</Link>
        </div>

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
      </div>
    </div>
  )
}

export default Processos
