import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/API';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';

function Create() {
  const [processo, setProcesso] = useState({
    numero: '',
    status: '',
    estado: '',
    observacoes: '',
    advogadoPrincipalId: '',
    advogadosIds: []
  })

  const navigate = useNavigate();
  const [contrato, setContrato] = useState(null);

  // Estados para advogados
  const [advogados, setAdvogados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAdvogados, setFilteredAdvogados] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
    
  const dropdownRef = useRef(null);

  // Buscar advogados ao carregar o componente
  useEffect(() => {
    const fetchAdvogados = async () => {
      try {
        setLoading(true);
        const res = await api.get('/auth/advogados/select');
        console.log('Advogados recebidos:', res.data); // DEBUG

        // Verifica se é array ou objeto com content
        const advogadosData = Array.isArray(res.data) ? res.data : (res.data.content || []);

        setAdvogados(advogadosData);
        setFilteredAdvogados(advogadosData);
      } catch (err) {
        console.error('Erro ao buscar advogados:', err);
        alert('Erro ao carregar lista de advogados');
        setAdvogados([]);
        setFilteredAdvogados([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvogados();
  }, []);

  // Filtrar advogados conforme digitação
  useEffect(() => {
      if (!Array.isArray(advogados)) {
        setFilteredAdvogados([]);
        return;
      }
  
      if (searchTerm.trim() === '') {
        setFilteredAdvogados(advogados);
      } else {
        const filtered = advogados.filter(adv => 
          adv.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          adv.cpf?.includes(searchTerm)
        );
        setFilteredAdvogados(filtered);
      }
    }, [searchTerm, advogados]);

    // Fechar dropdown ao clicar fora
      useEffect(() => {
        const handleClickOutside = (event) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowDropdown(false);
          }
        };
    
        if (showDropdown) {
          document.addEventListener('mousedown', handleClickOutside);
        }
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [showDropdown]);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setContrato(file);
    } else {
      alert('Por favor, selecione um arquivo PDF');
      e.target.value = '';
    }
  }

  // Adicionar/remover advogados selecionados
  const toggleAdvogado = (advogadoId) => {
    setProcesso(prev => {
      const isSelected = prev.advogadosIds.includes(advogadoId);
      return {
        ...prev,
        advogadosIds: isSelected 
          ? prev.advogadosIds.filter(id => id !== advogadoId)
          : [...prev.advogadosIds, advogadoId]
      };
    });
  };

  // Verifica se advogado está selecionado
  const isAdvogadoSelected = (advogadoId) => {
    return processo.advogadosIds.includes(advogadoId);
  };

  // Obter nome do advogado pelo ID
  const getAdvogadoNome = (id) => {
    const adv = advogados.find(a => a.id === id);
    return adv ? adv.nome : '';
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!processo.advogadoPrincipalId) {
      alert('Por favor, selecione o Advogado Responsável');
      return;
    }

    const formData = new FormData();
    formData.append('numero', processo.numero);
    formData.append('status', processo.status);
    formData.append('estado', processo.estado);
    formData.append('observacoes', processo.observacoes);
    formData.append('advogadoPrincipalId', processo.advogadoPrincipalId);

    processo.advogadosIds.forEach(id => {
      formData.append('advogadosIds', id);
    });
    
    if (contrato) {
      formData.append('contrato', contrato);
    }

    api.post('/processos', formData)
    .then(res => {
      console.log(res);
      alert('Processo cadastrado com sucesso!');
      navigate('/processos/read/' + id);
    })
    .catch(err => {
      console.error(err);
      alert(`Erro ao cadastrar: ${err.response?.data?.message || err.message}`);
    });
  }

  return (
    <div className='d-flex w-100 vh-100 justify-content-center align-items-center bg-light'>
      <div className='w-50 border bg-white shadow px-5 pt-3 pb-5 rounded'>
          <center><h2>Novo Processo</h2><br></br></center>
          <form onSubmit={handleSubmit}>
              <div className='mb-2'>
                <label htmlFor="numero"><b>Nº Processo:</b></label>
                <input type="text" name='numero' className='form-control'
                onChange={e => setProcesso({...processo, numero:e.target.value})} required/>
              </div>

              <div className='mb-2'>
                <label htmlFor="status"><b>Status</b></label>
                <select name='status' className='form-select' value={processo.status}
                onChange={e => setProcesso({...processo, status: e.target.value})} required>
                  <option value="">Selecionar</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="ARQUIVADO">Arquivado</option>
                  <option value="FINALIZADO">Finalizado</option>
                </select>
              </div>

              <div className='mb-2'>
                <label htmlFor="estado"><b>Estado</b></label>
                <select name='estado' className='form-select' value={processo.estado}
                onChange={e => setProcesso({...processo, estado: e.target.value})} required>
                  <option value="">Selecionar</option>
                  {EstadosBrasileiros.map((estado) => (
                    <option key={estado.sigla} value={estado.sigla}>
                      {estado.sigla} - {estado.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className='mb-2'>
                <label htmlFor="advogadoPrincipalId"><b>Advogado Responsável *</b></label>
                <select 
                  name='advogadoPrincipalId' 
                  className='form-select' 
                  value={processo.advogadoPrincipalId}
                  onChange={e => setProcesso({...processo, advogadoPrincipalId: e.target.value})} 
                  required
                  disabled={loading}>
                  <option value="">Selecionar</option>
                  {Array.isArray(advogados) && advogados.map((advogado) => (
                    <option key={advogado.id} value={advogado.id}>
                      {advogado.nome} - {advogado.cpf}
                    </option>
                  ))}
                </select>
                {!loading && advogados.length === 0 && (
                  <small className="text-danger">Nenhum advogado cadastrado no sistema.</small>
                )}
              </div>

              <div className='mb-3' ref={dropdownRef}>
                <label htmlFor="advogados"><b>Advogados Associados</b></label>
                <div className="position-relative">
                  <input 
                    type="text" 
                    className='form-control mb-2' 
                    placeholder='Buscar advogado por nome ou CPF'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    disabled={loading}
                  />
                  
                  {/* Lista de advogados disponíveis */}
                  {showDropdown && !loading && (
                    <div className="border rounded bg-white position-absolute w-100" style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1000}}>
                      {Array.isArray(filteredAdvogados) && filteredAdvogados.length > 0 ? (
                        filteredAdvogados.map(advogado => (
                          <div 
                            key={advogado.id}
                            className={`p-2 border-bottom cursor-pointer ${isAdvogadoSelected(advogado.id) ? 'bg-success text-white' : 'hover-bg-light'}`}
                            onClick={() => toggleAdvogado(advogado.id)}
                            style={{cursor: 'pointer'}}
                            onMouseEnter={(e) => {
                              if (!isAdvogadoSelected(advogado.id)) {
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isAdvogadoSelected(advogado.id)) {
                                e.currentTarget.style.backgroundColor = '';
                              }
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={isAdvogadoSelected(advogado.id)}
                              onChange={() => {}}
                              className="me-2"
                            />
                            {advogado.nome} - {advogado.cpf}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-muted">Nenhum advogado encontrado.</div>
                      )}
                    </div>
                  )}

                  <button 
                    type="button" 
                    className="btn btn-sm btn-secondary"
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={loading}
                  >
                    {showDropdown ? 'Fechar' : 'Mostrar Lista'}
                  </button>
                </div>

                {processo.advogadosIds.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">Advogados selecionados:</small>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                      {processo.advogadosIds.map(id => (
                        <span key={id} className="badge bg-primary d-flex align-items-center gap-1">
                          {getAdvogadoNome(id)}
                          <button 
                            type="button"
                            className="btn-close btn-close-white btn-sm"
                            onClick={() => toggleAdvogado(id)}
                            style={{fontSize: '0.6rem'}}
                            aria-label="Remover"
                          ></button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className='mb-3'>
                <label htmlFor="observacoes"><b>Observações</b></label>
                <input type="text" name='observacoes' className='form-control'
                onChange={e => setProcesso({...processo, observacoes:e.target.value})}/>
              </div>

              <div className='mb-3'>
                <label htmlFor="contrato"><b>Contrato</b></label>
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
