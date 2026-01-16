import React, { useEffect, useState } from 'react'
import { api } from '../../services/API';
import { Link, useParams } from 'react-router-dom';

function Read() {
  const [processo, setProcesso] = useState({})
  const { id } = useParams();

  useEffect(()=> {
    api.get('/processos/' + id)
      .then(res => setProcesso(res.data))
      .catch(err => console.log(err));
  }, [id])

  return (
    <div className='d-flex w-100 vh-100 justify-content-center align-items-center bg-light'>
        <div className='w-50 border bg-white shadow px-5 pt-3 pb-5 rounded'>
            <h3>Detalhes do Processo</h3>
            <div className='mb-2'>
                <strong>Nº Processo:</strong> {processo.numero}
            </div>
            <div className='mb-2'>
                <strong>Status:</strong> {processo.status}
            </div>
            <div className='mb-3'>
                <strong>Estado:</strong> {processo.estado}
            </div>
            <div className='mb-3'>
                <strong>Observação:</strong> {processo.observacoes}
            </div>
            <div className='mb-3'>
                <strong>Contrato:</strong> {processo.contrato ? (
                          <span className="file-exists">Arquivo anexado</span> 
                      ) : (
                          <span className="file-missing">Sem contrato</span>
                      )}
            </div>
            <Link to={`/update/${id}`} className='btn btn-success'>Editar</Link>
            <Link to="/processos" className='btn btn-primary ms-3'>Voltar</Link>
        </div>
    </div>
  )
}

export default Read