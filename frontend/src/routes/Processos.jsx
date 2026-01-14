import { useEffect, useState } from 'react'
import { api } from '../services/API';
import { Link } from 'react-router-dom'
import Search from './Search';
import Tabela from './Tabela';

function Processos() {
  // GETTERS E SETTERS
  const [processos, setProcessos] = useState([]);
  const [query, setQuery] = useState({});

  // Busca os dados de processos da API
  useEffect(() => {
    const fetchProcessos = async() => {
      try {
        const res = await api.get('/processos/list', {
          params: {
            numero: query.numero || null,
            status: query.status || null,
            estado: query.estado || null,
            advogadoId: query.advogadoId || null,
            advogadosIds: query.advogadosIds || null,
            partesIds: query.partesIds || null
          }
        });
        setProcessos(res.data.content || res.data);
      } catch(err) {
        console.log(err);
      }
    }
    fetchProcessos()
  }, [query]);

  // Armazena o filtro
  const handleChange = (e) => {
    setQuery({ ...query, [e.target.name]: e.target.value });
  };

  // Lógica de deletar processo (Tabela)
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
      <h2>Pesquisa</h2>
      <Search handleChange={handleChange}/>

      <h2>Lista de Processos Jurídicos</h2>
      <div className='w-75 rounded bg-white border shadow p-4 m-3'>
        <div className='d-flex gap-2 pb-3'>
          <Link to="/create" className='btn btn-success'>Cadastrar Processo</Link>
          <Link to="" className='btn btn-primary'>Prazos</Link>
          <Link to="" className='btn btn-primary'>Contratos</Link>
          <Link to="" className='btn btn-primary'>Documentos</Link>
        </div>
        <Tabela processos={processos} handleDelete={handleDelete}/>
      </div>
    </div>
  )
}

export default Processos
