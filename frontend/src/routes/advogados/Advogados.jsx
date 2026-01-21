import { useEffect, useState } from 'react'
import { api } from '../../services/API';
import { Link } from 'react-router-dom'
// import Search from './Search';
import Tabela from './Tabela';

function Advogados() {
  // GETTERS E SETTERS
  const [advogados, setAdvogados] = useState([]);
  const [query, setQuery] = useState({});

  // Busca os dados de Advogados da API
  useEffect(() => {
    const fetchAdvogados = async() => {
      try {
        const res = await api.get('/auth/advogados', {
          params: {
            nome: query.nome || null,
            cpf: query.cpf || null,
            email: query.email || null,
            telefone: query.telefone || null,
            numeroOAB: query.numeroOAB || null,
            seccional: query.seccional || null
          }
        });
        setAdvogados(res.data.content || res.data);
      } catch(err) {
        console.log(err);
      }
    }
    fetchAdvogados()
  }, [query]);

  // Armazena o filtro
  const handleChange = (e) => {
    setQuery({ ...query, [e.target.name]: e.target.value });
  };

  // Lógica de deletar processo (Tabela)
  const handleDelete = (id) => {
    const confirm = window.confirm("Tem certeza que deseja desativar o advogado?" );
    if(confirm) {
      api.delete('/auth/advogados/' + id)
      .then(res => {
        setAdvogados(advogados.filter(p => p.id !== id));
      })
      .catch(err => console.log(err));
    }
  }

  return (
    <div className='d-flex flex-column justify-content-center align-items-center bg-light vh-100'>
      {/* <h2>Pesquisa</h2> */}
      {/* <Search handleChange={handleChange}/> */}

      <h2>Lista de Advogados</h2>
      <div className='w-75 rounded bg-white border shadow p-4 m-3'>
        <div className='d-flex gap-2 pb-3'>
          <Link to="/advogados/create" className='btn btn-success'>Cadastrar Advogado</Link>
        </div>
        <Tabela advogados={advogados} handleDelete={handleDelete}/>
      </div>
    </div>
  )
}

export default Advogados
