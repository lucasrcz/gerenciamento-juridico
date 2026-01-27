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
    advogadosIds: [],
    partes: []
  })

  const navigate = useNavigate();
  const [contrato, setContrato] = useState(null);

  // Estados para Advogados
  const [advogados, setAdvogados] = useState([]);
  const [advTerm, setAdvTerm] = useState('');
  const [filteredAdvogados, setFilteredAdvogados] = useState([]);
  const [showAdvDropdown, setShowAdvDropdown] = useState(false);

  // Estados para Partes
  const [todasPartes, setTodasPartes] = useState([]);
  const [partesTerm, setPartesTerm] = useState('');
  const [filteredPartes, setFilteredPartes] = useState([]);
  const [showPartesDropdown, setShowPartesDropdown] = useState(false);

  const [loading, setLoading] = useState(true);
    
  const advDropdownRef = useRef(null);
  const partesDropdownRef = useRef(null);

  const tiposParte = ["AUTOR", "REU", "TERCEIRO", "ASSISTENTE", "INTERESSADO"];

  // Buscar advogados ao carregar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const resAdv = await api.get('/auth/advogados/select', {
          params: {q: ''}
        });
        const advData = resAdv.data.content || resAdv.data;
        const advList = Array.isArray(advData) ? advData : [];

        setAdvogados(advList);
        setFilteredAdvogados(advList);
        
        const resPartes = await api.get('/partes/select', {
          params: {q: ''}
        }); 
        
        const partesData = resPartes.data.content || resPartes.data;
        const partesList = Array.isArray(partesData) ? partesData : [];

        setTodasPartes(partesList);
        setFilteredPartes(partesList);

      } catch (err) {
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtrar Advogados
  useEffect(() => {
      if (!advTerm.trim()) {
        setFilteredAdvogados(advogados);
      } else {
        const filtered = advogados.filter(adv => 
          adv.nome?.toLowerCase().includes(advTerm.toLowerCase()) ||
          adv.cpf?.includes(advTerm)
        );
        setFilteredAdvogados(filtered);
      }
  }, [advTerm, advogados]);

  // Filtrar Partes
  useEffect(() => {
    if (!partesTerm.trim()) {
      setFilteredPartes(todasPartes);
    } else {
      const filtered = todasPartes.filter(p => 
        p.nomeCpf?.toLowerCase().includes(partesTerm.toLowerCase())
      );
      setFilteredPartes(filtered);
    }
  }, [partesTerm, todasPartes]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
    const handleClickOutside = (event) => {
      if (advDropdownRef.current && !advDropdownRef.current.contains(event.target)) {
        setShowAdvDropdown(false);
      }
      if (partesDropdownRef.current && !partesDropdownRef.current.contains(event.target)) {
        setShowPartesDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setContrato(file);
    } else {
      alert('Por favor, selecione um arquivo PDF');
      e.target.value = '';
    }
  }

  // Lógicas de Advogados
  const toggleAdvogado = (advogadoId) => {
    setProcesso(prev => {
      const isSelected = prev.advogadosIds.includes(advogadoId);
      const novosIds = isSelected 
          ? prev.advogadosIds.filter(id => id !== advogadoId)
          : [...prev.advogadosIds, advogadoId];
      
      return { ...prev, advogadosIds: novosIds };
    });
  };

  const getAdvogadoNome = (id) => {
    const adv = advogados.find(a => a.id === id);
    return adv ? adv.nome : 'Desconhecido';
  };

  // Lógicas de Partes
  const isParteSelected = (parteId) => {
    return processo.partes.some(p => p.parteId === parteId);
  };

  const toggleParte = (parte) => {
    setProcesso(prev => {
      const exists = prev.partes.some(p => p.parteId === parte.id);
      
      if (exists) {
        return {
          ...prev,
          partes: prev.partes.filter(p => p.parteId !== parte.id)
        };
      } else {
        return {
          ...prev,
          partes: [...prev.partes, { 
            parteId: parte.id, 
            tipoParte: 'AUTOR',
            nome: parte.nomeCpf
          }]
        };
      }
    });
  };

  const updateTipoParte = (parteId, novoTipo) => {
    setProcesso(prev => ({
      ...prev,
      partes: prev.partes.map(p => 
        p.parteId === parteId ? { ...p, tipoParte: novoTipo } : p
      )
    }));
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

    processo.partes.forEach((p, index) => {
        formData.append(`partes[${index}].parteId`, p.parteId);
        formData.append(`partes[${index}].tipoParte`, p.tipoParte);
    });
    
    if (contrato) {
      formData.append('contrato', contrato);
    }

    api.post('/processos', formData)
    .then(res => {
      console.log(res);
      alert('Processo cadastrado com sucesso!');
      navigate('/processos/read/' + res.data.id);
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
                  onChange={(e) => {
                    console.log('Selecionou advogado:', e.target.value); // DEBUG
                    setProcesso({...processo, advogadoPrincipalId: e.target.value});
                  }} 
                  required
                  disabled={loading}>
                  <option value="">Selecionar</option>
                  {Array.isArray(advogados) && advogados.map((advogado) => (
                    <option key={advogado.id} value={advogado.id}>
                      {advogado.nome} - {advogado.cpf}
                    </option>
                  ))}
                </select>
              </div>

              <div className='mb-3' ref={advDropdownRef}>
                <label htmlFor="advogados"><b>Advogados Associados</b></label>
                <div className="position-relative">
                  <input 
                    type="text" 
                    className='form-control mb-2' 
                    placeholder='Buscar advogado por nome ou CPF'
                    value={advTerm}
                    onChange={e => setAdvTerm(e.target.value)}
                    onFocus={() => setShowAdvDropdown(true)}
                  />
                  
                  {/* Lista de advogados disponíveis */}
                  {showAdvDropdown && !loading && (
                      <div className="border rounded bg-white position-absolute w-100"
                        style={{
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 1050,
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                        {filteredAdvogados.length > 0 ? (
                        filteredAdvogados.map(adv => (
                          <div 
                            key={adv.id}
                            className={`p-2 border-bottom cursor-pointer ${processo.advogadosIds.includes(adv.id) ? 'bg-success text-white' : 'hover-bg-light'}`}
                            onClick={() => toggleAdvogado(adv.id)}
                            style={{cursor: 'pointer'}}>
                            <small>{adv.nome} ({adv.cpf})</small>
                          </div>
                        ))
                        ) : <div className="p-2 text-muted">Não encontrado.</div>}
                      </div>
                  )}

                  {/* Chips Advogados Selecionados */}
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {processo.advogadosIds.map(id => (
                    <span key={id} className="badge bg-secondary d-flex align-items-center gap-1">
                        {getAdvogadoNome(id)}
                        <button type="button" className="btn-close btn-close-white btn-sm" onClick={() => toggleAdvogado(id)} style={{fontSize: '0.5rem'}}></button>
                    </span>
                    ))}
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              <div className='mb-3' ref={partesDropdownRef}>
                <label><b>Envolvidos (Partes)</b></label>
                <div className="position-relative">
                  <input 
                    type="text" 
                    className='form-control mb-2' 
                    placeholder='Buscar parte por nome ou documento...'
                    value={partesTerm}
                    onChange={e => setPartesTerm(e.target.value)}
                    onFocus={() => setShowPartesDropdown(true)}
                  />
                  
                  {/* Dropdown de Busca de Partes */}
                  {showPartesDropdown && !loading && (
                    <div className="border rounded bg-white position-absolute w-100"
                    style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1050, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                      {filteredPartes.length > 0 ? (
                        filteredPartes.map(parte => (
                          <div 
                            key={parte.id}
                            className={`p-2 border-bottom cursor-pointer ${isParteSelected(parte.id) ? 'bg-primary text-white' : 'hover-bg-light'}`}
                            onClick={() => toggleParte(parte)}
                            style={{cursor: 'pointer'}}
                          >
                            <small>{parte.nomeCpf}</small>
                          </div>
                        ))
                      ) : <div className="p-2 text-muted">Parte não encontrada.</div>}
                    </div>
                  )}
                </div>

                {/* Lista de Partes Selecionadas com Classificação */}
                {processo.partes.length > 0 && (
                  <div className="mt-2 border rounded p-2 bg-light">
                     <small className="text-muted mb-2 d-block">Partes selecionadas:</small>
                     {processo.partes.map((p, idx) => (
                       <div key={p.parteId} className="d-flex align-items-center justify-content-between mb-2 border-bottom pb-1">
                          <span className="fw-bold text-truncate w-50" title={p.nome}>
                            {p.nome || "Parte " + p.parteId}
                          </span>
                          
                          <div className="d-flex gap-2">
                            {/* Select do Tipo da Parte */}
                            <select 
                                className="form-select form-select-sm" 
                                value={p.tipoParte}
                                onChange={(e) => updateTipoParte(p.parteId, e.target.value)}
                                style={{width: '130px'}}
                            >
                                {tiposParte.map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>

                            <button 
                                type="button" 
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => toggleParte({id: p.parteId})}
                            >
                                X
                            </button>
                          </div>
                       </div>
                     ))}
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
