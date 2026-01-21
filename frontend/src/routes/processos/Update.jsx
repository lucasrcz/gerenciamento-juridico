import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/API';

function Update() {
  const { id } = useParams();
  const [processo, setProcesso] = useState({
    numero: '',
    status: '',
    estado: '',
    observacoes: ''
    })

  const navigate = useNavigate();
  const [contrato, setContrato] = useState(null);

  // Carregamento de dados do processo
  useEffect(()=> { 
    api.get('/processos/' + id)
      .then(res => setProcesso(res.data))
      .catch(err => console.log(err));
  }, [id])

  // Adição de arquivo PDF no contrato
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setContrato(file);
    } else {
      alert('Por favor, selecione um arquivo PDF');
      e.target.value = '';
    }
  }

  // Atualização do processo (envia objeto formData (dados + arquivo PDF))
  const handleUpdate = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('numero', processo.numero);
    formData.append('status', processo.status);
    formData.append('estado', processo.estado);
    formData.append('observacoes', processo.observacoes);
    
    if (contrato) {
      formData.append('contrato', contrato);
    }

    api.put('/processos/' + id, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => {
      console.log(res);
      navigate('/processos/read/' + id);
    })
    .catch(err => console.log(err));
  }

  return (
    <div className='d-flex w-100 vh-100 justify-content-center align-items-center bg-light'>
      <div className='w-50 border bg-white shadow px-5 pt-3 pb-5 rounded'>
          <center><h2>Atualizar Processo</h2></center><br></br>
          <form onSubmit={handleUpdate}>
              <div className='mb-2'>
                <label htmlFor="numero"><strong>Nº Processo:</strong></label>
                <input type="text" name='numero' className='form-control'
                value={processo.numero}
                onChange={e => setProcesso({...processo, numero:e.target.value})} required/>
              </div>

              <div className='mb-2'>
                <label htmlFor="status"><strong>Status</strong></label>
                <select name='status' className='form-control'
                value={processo.status}
                onChange={e => setProcesso({...processo, status: e.target.value})} required>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="ARQUIVADO">Arquivado</option>
                  <option value="FINALIZADO">Finalizado</option>
                </select>
              </div>

              <div className='mb-3'>
                <label htmlFor="estado"><strong>Estado</strong></label>
                <input type="text" name='estado' className='form-control'
                value={processo.estado}
                onChange={e => setProcesso({...processo, estado:e.target.value})}/>
              </div>

              <div className='mb-3'>
                <label htmlFor="observacoes"><strong>Observações</strong></label>
                <input type="text" name='observacoes' className='form-control'
                value={processo.observacoes}
                onChange={e => setProcesso({...processo, observacoes:e.target.value})}/>
              </div>

              <div className='mb-3'>
                <label htmlFor="contrato"><strong>Contrato</strong></label>
                <input type="file" name='contrato' className='form-control' accept='.pdf'
                onChange={handleFileChange}/>
              </div>

              <center><br></br>
                <button className='btn btn-success'>Atualizar</button>
                <Link to="/processos" className='btn btn-primary ms-3'>Voltar</Link>
              </center>
           </form>
       </div>
    </div>
  )
}

export default Update
