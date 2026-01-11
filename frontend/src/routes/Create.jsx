import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/API';

function Create() {
  const [processo, setProcesso] = useState({
    numero: '',
    status: '',
    estado: '',
    observacoes: ''
  })

  const navigate = useNavigate();
  const [contrato, setContrato] = useState(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setContrato(file);
    } else {
      alert('Por favor, selecione um arquivo PDF');
      e.target.value = '';
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('numero', processo.numero);
    formData.append('status', processo.status);
    formData.append('estado', processo.estado);
    formData.append('observacoes', processo.observacoes);
    
    if (contrato) {
      formData.append('contrato', contrato);
    }

    api.post('/processos', formData)
    .then(res => {
      console.log(res);
      alert('Processo cadastrado com sucesso!');
      navigate('/processos');
    })
    .catch(err => {
      console.error('❌ Erro completo:', err);
      console.error('Status:', err.response?.status);
      console.error('Mensagem:', err.response?.data);
      console.error('Headers da resposta:', err.response?.headers);
      alert(`Erro ao cadastrar: ${err.response?.data?.message || err.message}`);
    });
  }

  return (
    <div className='d-flex w-100 vh-100 justify-content-center align-items-center bg-light'>
      <div className='w-50 border bg-white shadow px-5 pt-3 pb-5 rounded'>
          <center><h2>Novo Processo</h2><br></br></center>
          <form onSubmit={handleSubmit}>
              <div className='mb-2'>
                <label htmlFor="numero"><strong>Nº Processo:</strong></label>
                <input type="text" name='numero' className='form-control'
                onChange={e => setProcesso({...processo, numero:e.target.value})} required/>
              </div>

              <div className='mb-2'>
                <label htmlFor="status"><strong>Status</strong></label>
                <select name='status' className='form-control' value={processo.status}
                onChange={e => setProcesso({...processo, status: e.target.value})} required>
                  <option value="">Selecionar</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="ARQUIVADO">Arquivado</option>
                  <option value="FINALIZADO">Finalizado</option>
                </select>
              </div>

              <div className='mb-3'>
                <label htmlFor="estado"><strong>Estado</strong></label>
                <input type="text" name='estado' className='form-control'
                onChange={e => setProcesso({...processo, estado:e.target.value})}/>
              </div>

              <div className='mb-3'>
                <label htmlFor="observacoes"><strong>Observações</strong></label>
                <input type="text" name='observacoes' className='form-control'
                onChange={e => setProcesso({...processo, observacoes:e.target.value})}/>
              </div>

              <div className='mb-3'>
                <label htmlFor="contrato"><strong>Contrato</strong></label>
                <input type="file" name='contrato' className='form-control' accept='.pdf'
                onChange={handleFileChange}/>
              </div>

              <center><br></br>
                <button className='btn btn-success'>Cadastrar</button>
                <Link to="/processos" className='btn btn-primary ms-3'>Voltar</Link>
              </center>
           </form>
       </div>
    </div>
  )
}

export default Create