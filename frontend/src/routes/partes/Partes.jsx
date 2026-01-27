import { useEffect, useState } from 'react'
import { api } from '../../services/API';
import { Link } from 'react-router-dom'
// import Search from './Search';
import Tabela from './Tabela';

function Partes() {
  // GETTERS E SETTERS
  const [partes, setPartes] = useState([]);
  const [query, setQuery] = useState({});

  // Busca os dados de Partes na API
  useEffect(() => {
    const fetchPartes = async() => {
      try {
        const res = await api.get('/partes', {
          params: {
            nome: query.nome || null,
            tipoPessoa: query.tipoPessoa || null,
            email: query.email || null,
            telefone: query.telefone || null
          }
        });
        setPartes(res.data.content || res.data);
      } catch(err) {
        console.log(err);
      }
    }
    fetchPartes()
  }, [query]);

  // Armazena o filtro
  const handleChange = (e) => {
    setQuery({ ...query, [e.target.name]: e.target.value });
  };

  // Lógica de deletar processo (Tabela)
  const handleDelete = (id, tipoPessoa) => {
    let confirm;
    if(tipoPessoa == "FISICA"){
      confirm = window.confirm("Tem certeza que deseja desativar a pessoa física?");
    } else {
        confirm = window.confirm("Tem certeza que deseja desativar a pessoa jurídica?");
    }
    if(confirm) {
      api.delete('/partes/' + id)
      .then(res => {
          setPartes(partes.filter(p => p.id !== id));
          alert('Parte desativada com sucesso!');
      })
      .catch(err => console.log(err));
    }
  }

  return (
    <div className='d-flex flex-column justify-content-center align-items-center bg-light vh-100'>
      {/* <h2>Pesquisa</h2> */}
      {/* <Search handleChange={handleChange}/> */}

      <h2>Lista de Partes</h2>
      <div className='w-75 rounded bg-white border shadow p-4 m-3'>
        <div className='d-flex gap-2 pb-3'>
          <Link to="/partes/create" className='btn btn-success'>Cadastrar Partes</Link>
        </div>
        <Tabela partes={partes} handleDelete={handleDelete}/>
      </div>
    </div>
  )
}

export default Partes
