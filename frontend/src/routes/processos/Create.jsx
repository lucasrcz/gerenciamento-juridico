import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/API';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros'
import { Colors } from '../../constants/Colors';

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

  // --- ESTADOS PARA PRAZOS E DOCUMENTOS ---
  const [prazos, setPrazos] = useState([
    { descricao: '', dataVencimento: '' }
  ]);

  const [documentosExtras, setDocumentosExtras] = useState([
    { id: Date.now(), file: null, descricao: '', dataCriacao: new Date().toISOString() } 
  ]);
  
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

  // --- EFFECTS (Busca de dados) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const resAdv = await api.get('/auth/advogados/select', { params: {q: ''} });
        const advData = resAdv.data.content || resAdv.data;
        setAdvogados(Array.isArray(advData) ? advData : []);
        setFilteredAdvogados(Array.isArray(advData) ? advData : []);
        
        const resPartes = await api.get('/partes/select', { params: {q: ''} }); 
        const partesData = resPartes.data.content || resPartes.data;
        setTodasPartes(Array.isArray(partesData) ? partesData : []);
        setFilteredPartes(Array.isArray(partesData) ? partesData : []);

      } catch (err) {
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtros
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

  // Click Outside
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

  // --- HANDLERS ---

  // Prazos
  const handleAddPrazo = () => {
    setPrazos([...prazos, { descricao: '', dataVencimento: '' }]);
  };
  const handleRemovePrazo = (index) => {
    const values = [...prazos];
    values.splice(index, 1);
    setPrazos(values);
  };
  const handlePrazoChange = (index, field, value) => {
    const values = [...prazos];
    values[index][field] = value;
    setPrazos(values);
  };

  // Documentos
  const handleAddDocumento = () => {
    setDocumentosExtras([...documentosExtras, {
      id: Date.now(),
      file: null,
      descricao: '',
      dataCriacao: new Date().toISOString()
      }
    ]);
  };

  const handleRemoveDocumento = (index) => {
    const values = [...documentosExtras];
    values.splice(index, 1);
    setDocumentosExtras(values);
  };

  const handleDocumentoDescChange = (index, value) => {
    const values = [...documentosExtras];
    values[index].descricao = value;
    setDocumentosExtras(values);
  };

  const handleDocumentoFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const values = [...documentosExtras];
      values[index].file = file;
      setDocumentosExtras(values);
    } else {
      alert('Por favor, selecione um arquivo PDF');
      e.target.value = '';
    }
  };

  const handleContratoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setContrato(file);
    } else {
      alert('Por favor, selecione um arquivo PDF');
      e.target.value = '';
    }
  }

  // Advogados
  const toggleAdvogado = (advogadoId) => {
    setProcesso(prev => {
      const isSelected = prev.advogadosIds.includes(advogadoId);
      const novosIds = isSelected 
          ? prev.advogadosIds.filter(id => id !== advogadoId)
          : [...prev.advogadosIds, advogadoId];
      return { ...prev, advogadosIds: novosIds };
    });
    setAdvTerm(''); 
    setShowAdvDropdown(false);
  };
  
  const getAdvogadoNome = (id) => {
    const adv = advogados.find(a => a.id === id);
    return adv ? `${adv.nome} (${adv.cpf})` : 'Desconhecido';
  };

  // Partes
  const isParteSelected = (parteId) => {
    return processo.partes.some(p => p.parteId === parteId);
  };
  const toggleParte = (parte) => {
    setProcesso(prev => {
      const exists = prev.partes.some(p => p.parteId === parte.id);
      if (exists) {
        return { ...prev, partes: prev.partes.filter(p => p.parteId !== parte.id) };
      } else {
        return {
          ...prev,
          partes: [...prev.partes, { parteId: parte.id, tipoParte: 'AUTOR', nome: parte.nomeCpf }]
        };
      }
    });
    setPartesTerm('');
    setShowPartesDropdown(false);
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

    processo.advogadosIds.forEach(id => formData.append('advogadosIds', id));
    
    processo.partes.forEach((p, index) => {
        formData.append(`partes[${index}].parteId`, p.parteId);
        formData.append(`partes[${index}].tipoParte`, p.tipoParte);
    });
    
    if (contrato) formData.append('contrato', contrato);

    prazos.forEach((p, index) => {
      if (p.descricao && p.dataVencimento) {
        formData.append(`prazos[${index}].descricao`, p.descricao);
        formData.append(`prazos[${index}].dataVencimento`, p.dataVencimento);
      }
    });

    documentosExtras.forEach((doc, index) => {
      if (doc.file) {
        formData.append(`documentos[${index}].arquivo`, doc.file);
        formData.append(`documentos[${index}].descricao`, doc.descricao || '');
        formData.append(`documentos[${index}].dataCriacao`, doc.dataCriacao);
        formData.append(`documentos[${index}].nome`, doc.file.name);
        formData.append(`documentos[${index}].formatoArquivo`, doc.file.type);
      } 
    });

    api.post('/processos', formData)
    .then(res => {
      alert('Processo cadastrado com sucesso!');
      navigate('/processos/read/' + res.data.id);
    })
    .catch(err => {
      console.error(err);
      alert(`Erro ao cadastrar: ${err.response?.data?.message || err.message}`);
    });
  }

  const headerStyle = {
    letterSpacing: '0.05em', 
    color: Colors.primaryDark,
    borderColor: Colors.primaryDark,
    backgroundColor: '#f8f9fa',
    padding: '10px 15px',
    borderRadius: '8px',
    marginTop: '20px'
  };

  const actionBtnStyle = {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
    color: Colors.primaryDeep,
    fontWeight: 'bold'
  };

  return (
    <div className='container-fluid bg-light min-vh-100 p-4'>
      <div className='card border-0 shadow-sm rounded-3 bg-white'>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
              
              {/* --- 1. DADOS DO PROCESSO --- */}
              <h5 className="fw-bold border-bottom border-2 pb-2 mb-4" style={headerStyle}>
                Dados do Processo
              </h5>
              
              <div className="row mb-3">
                  <div className='col-12 col-md-4 mb-3'>
                    <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Número do Processo *</label>
                    <input type="text" name='numero' className='form-control'
                    onChange={e => setProcesso({...processo, numero:e.target.value})} required/>
                  </div>

                  <div className='col-12 col-md-4 mb-3'>
                    <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Status *</label>
                    <select name='status' className='form-select' value={processo.status}
                    onChange={e => setProcesso({...processo, status: e.target.value})} required>
                      <option value="">Selecionar</option>
                      <option value="EM_ANDAMENTO">Em Andamento</option>
                      <option value="ARQUIVADO">Arquivado</option>
                      <option value="FINALIZADO">Finalizado</option>
                    </select>
                  </div>

                  <div className='col-12 col-md-4 mb-3'>
                    <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Estado *</label>
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

                  <div className='col-8 mb-2'>
                    <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Contrato</label>
                    <br></br>
                    <small className="text-muted">Arquivo (PDF)</small>
                    <input type="file" name='contrato' className='form-control' accept='.pdf'
                    onChange={handleContratoChange}/>
                  </div>
              </div>

              {/* Prazos */}
              <div className="mb-5">
                <label className="form-label fw-bold d-block mb-2" style={{color: Colors.primaryDeep}}>Prazos e Vencimentos</label>
                {prazos.map((prazo, index) => (
                  <div key={index} className="row g-2 mb-3 align-items-end">
                    <div className='col-md-3'>
                      {index === 0 && <small className="text-muted">Data de Vencimento</small>}
                      <input 
                        type="date" 
                        className="form-control"
                        value={prazo.dataVencimento}
                        onChange={(e) => handlePrazoChange(index, 'dataVencimento', e.target.value)}
                      />
                    </div>

                    <div className="col-md-1">
                      {index === 0 ? (
                        <button type="button" className="btn btn-success w-80" onClick={handleAddPrazo} title="Adicionar Prazo">
                          <i className="bi bi-plus-lg"></i>
                        </button>
                      ) : (
                        <button type="button" className="btn btn-danger w-80" onClick={() => handleRemovePrazo(index)} title="Remover Prazo">
                           <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>

                    <div className="col-md-4">
                      {index === 0 && <small className="text-muted">Descrição</small>}
                      <input 
                        type="text" 
                        className="form-control" 
                        value={prazo.descricao}
                        onChange={(e) => handlePrazoChange(index, 'descricao', e.target.value)}
                        placeholder="Ex: Audiência preliminar"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* --- 2. ADVOGADOS --- */}
              <h5 className="fw-bold border-bottom border-2 pb-2 mb-4" style={headerStyle}>
                Advogados
              </h5>
              
              <div className="row mb-3">
                <div className='col-12 col-md-6 mb-3'>
                    <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Advogado Responsável *</label>
                    <select 
                      className='form-select' 
                      value={processo.advogadoPrincipalId}
                      onChange={(e) => setProcesso({...processo, advogadoPrincipalId: e.target.value})} 
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
              </div>

              <hr></hr>

                <div className='row mb-4' ref={advDropdownRef}>
                  <div className='col-6'>
                    <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Advogados Associados</label>
                    <div className="position-relative">
                      {/* Input de Busca */}
                      <input 
                          type="text" 
                          className='form-control' 
                          placeholder='Busca por nome, nº OAB ou CPF'
                          value={advTerm}
                          onChange={e => setAdvTerm(e.target.value)}
                          onFocus={() => setShowAdvDropdown(true)}
                      />
                      {/* Dropdown de Resultados */}
                      {showAdvDropdown && !loading && (
                        <div className="list-group position-absolute w-100 shadow" 
                          style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1050}}>
                          {filteredAdvogados.length > 0 ? (
                            filteredAdvogados.map(adv => (
                            <button 
                              key={adv.id} type="button"
                              className={`list-group-item list-group-item-action ${processo.advogadosIds.includes(adv.id) ? 'active' : ''}`}
                              onClick={() => toggleAdvogado(adv.id)}>
                              {adv.nome} ({adv.cpf})
                            </button>
                            ))
                          ) : <div className="p-2 bg-white border text-muted">Advogado não encontrado.</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                    {/* Lista Estilizada de Advogados Selecionados */}
                    {processo.advogadosIds.length > 0 ? (
                      <div className="mt-2">
                         {processo.advogadosIds.map((id, index) => (
                            <div key={id} className="row g-2 mb-2 align-items-center">
                                <div className="col-4 col-md-4">
                                    <input 
                                        type="text" 
                                        className="form-control bg-light" 
                                        value={getAdvogadoNome(id)} 
                                        readOnly 
                                        disabled 
                                    />
                                </div>
                                <div className="col-6 col-md-1">
                                    <button 
                                        type="button" 
                                        className="btn btn-danger w-80" 
                                        onClick={() => toggleAdvogado(id)}
                                        title="Remover Advogado">
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                         ))}
                      </div>
                    ) : (
                    <div className="alert alert-light text-center border border-dashed text-muted">
                        Nenhum advogado selecionado. Utilize a busca acima.
                    </div>
                 )}
                </div>

              {/* --- 3. PARTES ENVOLVIDAS --- */}
              <h5 className="fw-bold border-bottom border-2 pb-2 mb-4" style={headerStyle}>
                 Partes Envolvidas
              </h5>
              
              <div className="row mb-3" ref={partesDropdownRef}>
                <div className="col-6">
                   <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Adicionar Parte</label>
                   <div className="position-relative">
                      <input 
                        type="text" 
                        className='form-control' 
                        placeholder='Busca por nome ou CPF/CNPJ'
                        value={partesTerm}
                        onChange={e => setPartesTerm(e.target.value)}
                        onFocus={() => setShowPartesDropdown(true)}
                      />
                       {showPartesDropdown && !loading && (
                        <div className="list-group position-absolute w-100 shadow"
                        style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1050}}>
                          {filteredPartes.length > 0 ? (
                            filteredPartes.map(parte => (
                              <button 
                                key={parte.id} type="button"
                                className={`list-group-item list-group-item-action ${isParteSelected(parte.id) ? 'active' : ''}`}
                                onClick={() => toggleParte(parte)}>
                                {parte.nomeCpf}
                              </button>
                            ))
                          ) : <div className="p-2 bg-white border text-muted">Parte não encontrada.</div>}
                        </div>
                      )}
                   </div>
                </div>
              </div>

              <div className="mb-5">
                {processo.partes.length > 0 ? (
                  processo.partes.map((p, idx) => (
                    <div key={p.parteId} className="row g-2 mb-2 align-items-end">
                      <div className="col-4 col-md-4">
                        {idx === 0 && <small className="text-muted">Nome da Parte</small>}
                        <input type="text" className="form-control bg-light" value={p.nome} readOnly disabled />
                      </div>

                      <div className="col-2 col-md-2">
                        {idx === 0 && <small className="text-muted">Tipo de Parte</small>}
                        <select 
                          className="form-select" 
                          value={p.tipoParte}
                          onChange={e => {
                            const novasPartes = [...processo.partes];
                            novasPartes[idx].tipoParte = e.target.value;
                            setProcesso({ ...processo, partes: novasPartes });
                          }} 
                          required
                        >
                          <option value="AUTOR">Autor</option>
                          <option value="REU">Réu</option>
                          <option value="TERCEIRO">Terceiro</option>
                          <option value="ASSISTENTE">Assistente</option>
                          <option value="INTERESSADO">Interessado</option>
                        </select>
                      </div>

                      <div className="col-8 col-md-1">
                        <button type="button" className="btn btn-danger w-80" onClick={() => toggleParte({id: p.parteId})}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="alert alert-light text-center border border-dashed text-muted">
                    Nenhuma parte selecionada. Utilize a busca acima.
                  </div>
                )}
              </div>

              {/* --- 4. DOCUMENTOS --- */}
              <h5 className="fw-bold border-bottom border-2 pb-2 mb-4" style={headerStyle}>
                Documentos Extras
              </h5>
              
              <div className="mb-5">
                {documentosExtras.map((doc, index) => (
                  <div key={doc.id} className="row g-2 mb-2 align-items-end">
                    
                    <div className="col-12 col-md-5">
                      {index === 0 && <small className="text-muted">Arquivo (PDF)</small>}
                      <input 
                        type="file" 
                        className="form-control" 
                        accept=".pdf"
                        onChange={(e) => handleDocumentoFileChange(index, e)}
                      />
                    </div>

                    <div className="col-12 col-md-1">
                      {index === 0 ? (
                        <button type="button" className="btn btn-success w-80" onClick={handleAddDocumento}>
                          <i className="bi bi-plus-lg"></i>
                        </button>
                      ) : (
                        <button type="button" className="btn btn-danger w-80" onClick={() => handleRemoveDocumento(index)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>

                    <div className="col-8 col-md-4">
                      {index === 0 && <small className="text-muted">Descrição</small>}
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Ex: Comprovante de Residência"
                        value={doc.descricao}
                        onChange={(e) => handleDocumentoDescChange(index, e.target.value)}
                      />
                    </div>

                  </div>
                ))}
              </div>

              <hr></hr>

              {/* --- 5. OBSERVAÇÕES (RODAPÉ) --- */}
              <div className='mb-4'>
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Observações</label>
                <textarea 
                    rows="4"
                    name='observacoes' 
                    className='form-control'
                    placeholder="Digite aqui, se houver, observações adicionais sobre o processo."
                    onChange={e => setProcesso({...processo, observacoes:e.target.value})}>
                </textarea>
              </div>

              <div className="d-flex justify-content-end gap-3 mt-5">
                <Link to="/processos" className='btn btn-outline-secondary px-4'>Cancelar</Link>
                
                <button className='btn px-4 fw-bold' style={actionBtnStyle}>
                  Cadastrar Processo
                </button>
              </div>

           </form>
       </div>
    </div>
    </div>
  )
}

export default Create