import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/API';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros'
import { Colors, headerStyle, actionBtnStyle } from '../../constants/Colors';

function Create() {
  // --- CONTROLE DE FLUXO (WIZARD) ---
  const [step, setStep] = useState(1); // 1: Processo, 2: Prazos/Docs
  const [createdProcessId, setCreatedProcessId] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- DADOS DO PROCESSO (ETAPA 1) ---
  const [processo, setProcesso] = useState({
    numero: '',
    status: '',
    estado: '',
    observacoes: '',
    advogadoPrincipalId: '',
    advogadosIds: [],
    partes: []
  });
  const [contrato, setContrato] = useState(null);

  // --- DADOS ADICIONAIS (ETAPA 2) ---
  const [prazos, setPrazos] = useState([
    { descricao: '', dataVencimento: '' }
  ]);
  const [documentosExtras, setDocumentosExtras] = useState([
    { id: Date.now(), file: null, descricao: '' } 
  ]);

  // --- LISTAS ---
  const [advogados, setAdvogados] = useState([]);
  const [todasPartes, setTodasPartes] = useState([]);
  
  const [advPrincipalTerm, setAdvPrincipalTerm] = useState('');
  const [filteredAdvPrincipal, setFilteredAdvPrincipal] = useState([]);
  const [showAdvPrincipalDropdown, setShowAdvPrincipalDropdown] = useState(false);
  const advPrincipalDropdownRef = useRef(null);

  const [advTerm, setAdvTerm] = useState('');
  const [filteredAdvogados, setFilteredAdvogados] = useState([]);
  const [showAdvDropdown, setShowAdvDropdown] = useState(false);
  const advDropdownRef = useRef(null);
  
  const [partesTerm, setPartesTerm] = useState('');
  const [filteredPartes, setFilteredPartes] = useState([]);
  const [showPartesDropdown, setShowPartesDropdown] = useState(false);
  const partesDropdownRef = useRef(null);

  // --- BUSCA INICIAL DE DADOS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resAdv, resPartes] = await Promise.all([
           api.get('/auth/advogados/select', { params: {q: ''} }),
           api.get('/partes/select', { params: {q: ''} })
        ]);

        const advData = resAdv.data.content || resAdv.data;
        setAdvogados(Array.isArray(advData) ? advData : []);
        setFilteredAdvogados(Array.isArray(advData) ? advData : []);
        
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

  // --- EFEITOS DE FILTRO ---
  useEffect(() => {
      if (!advTerm.trim()) setFilteredAdvogados(advogados);
      else setFilteredAdvogados(advogados.filter(adv => adv.nome?.toLowerCase().includes(advTerm.toLowerCase()) || adv.cpf?.includes(advTerm)));
  }, [advTerm, advogados]);

  useEffect(() => {
    if (!advPrincipalTerm.trim()) {
      setFilteredAdvPrincipal(advogados);
      if (processo.advogadoPrincipalId && advPrincipalTerm === '') setProcesso(prev => ({ ...prev, advogadoPrincipalId: '' }));
    } else {
      setFilteredAdvPrincipal(advogados.filter(adv => adv.nome?.toLowerCase().includes(advPrincipalTerm.toLowerCase()) || adv.cpf?.includes(advPrincipalTerm)));
    }
  }, [advPrincipalTerm, advogados, processo.advogadoPrincipalId]);

  useEffect(() => {
    if (!partesTerm.trim()) setFilteredPartes(todasPartes);
    else setFilteredPartes(todasPartes.filter(p => p.nomeCpf?.toLowerCase().includes(partesTerm.toLowerCase())));
  }, [partesTerm, todasPartes]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (advDropdownRef.current && !advDropdownRef.current.contains(event.target)) setShowAdvDropdown(false);
      if (advPrincipalDropdownRef.current && !advPrincipalDropdownRef.current.contains(event.target)) setShowAdvPrincipalDropdown(false);
      if (partesDropdownRef.current && !partesDropdownRef.current.contains(event.target)) setShowPartesDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- HELPERS ---
  const getInputStyle = (value) => (value && value.toString().trim() !== '') ? { backgroundColor: '#eef6ff', color: '#000' } : {};
  
  const handleProcessoMask = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 20) value = value.slice(0, 20);
    value = value.replace(/^(\d{7})(\d)/, '$1-$2');
    value = value.replace(/^(\d{7}-\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{7}-\d{2}\.\d{4})(\d)/, '$1.$2');
    value = value.replace(/^(\d{7}-\d{2}\.\d{4}\.\d)(\d)/, '$1.$2');
    value = value.replace(/^(\d{7}-\d{2}\.\d{4}\.\d\.\d{2})(\d)/, '$1.$2');
    setProcesso({ ...processo, numero: value });
  };

  const getAdvogadoNome = (id) => {
    const adv = advogados.find(a => a.id === id);
    return adv ? `${adv.nome} (${adv.cpf})` : 'Desconhecido';
  };

  const selectAdvogadoPrincipal = (adv) => {
    setProcesso(prev => ({ ...prev, advogadoPrincipalId: adv.id }));
    setAdvPrincipalTerm(adv.nome);
    setShowAdvPrincipalDropdown(false);
  };

  const toggleAdvogado = (advogadoId) => {
    setProcesso(prev => {
      const isSelected = prev.advogadosIds.includes(advogadoId);
      const novosIds = isSelected ? prev.advogadosIds.filter(id => id !== advogadoId) : [...prev.advogadosIds, advogadoId];
      return { ...prev, advogadosIds: novosIds };
    });
    setAdvTerm(''); 
    setShowAdvDropdown(false);
  };

  const toggleParte = (parte) => {
    setProcesso(prev => {
      const exists = prev.partes.some(p => p.parteId === parte.id);
      if (exists) return { ...prev, partes: prev.partes.filter(p => p.parteId !== parte.id) };
      else return { ...prev, partes: [...prev.partes, { parteId: parte.id, tipoParte: '', nome: parte.nomeCpf }] };
    });
    setPartesTerm('');
    setShowPartesDropdown(false);
  };

  // --- PRAZOS E DOCS ---
  const handleAddPrazo = () => setPrazos([...prazos, { descricao: '', dataVencimento: '' }]);
  const handleRemovePrazo = (idx) => setPrazos(prazos.filter((_, i) => i !== idx));
  const handlePrazoChange = (idx, field, val) => {
    const newPrazos = [...prazos];
    newPrazos[idx][field] = val;
    setPrazos(newPrazos);
  };

  const handleAddDocumento = () => setDocumentosExtras([...documentosExtras, { id: Date.now(), file: null, descricao: '' }]);
  const handleRemoveDocumento = (idx) => setDocumentosExtras(documentosExtras.filter((_, i) => i !== idx));
  const handleDocumentoDescChange = (idx, val) => {
    const newDocs = [...documentosExtras];
    newDocs[idx].descricao = val;
    setDocumentosExtras(newDocs);
  };
  const handleDocumentoFileChange = (idx, e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        const newDocs = [...documentosExtras];
        newDocs[idx].file = file;
        setDocumentosExtras(newDocs);
    } else {
        alert('Por favor, selecione um arquivo PDF');
        e.target.value = '';
    }
  };


  // --- SUBMITS ---

  const handleStep1Submit = async (e) => {
    e.preventDefault();

    if (!processo.advogadoPrincipalId) {
      alert('Por favor, selecione o Advogado Responsável');
      return;
    }

    try {
        setLoading(true);
        const formData = new FormData();
        const numeroLimpo = processo.numero.replace(/\D/g, '');
        formData.append('numero', numeroLimpo);
        formData.append('status', processo.status);
        formData.append('estado', processo.estado);
        formData.append('observacoes', processo.observacoes);
        formData.append('advogadoPrincipalId', processo.advogadoPrincipalId);
        
        // Envia CPFs dos advogados associados (O backend espera CPF em 'advogadosIds')
        processo.advogadosIds.forEach(id => {
            const adv = advogados.find(a => a.id === id);
            if (adv && adv.cpf) {
                 formData.append('advogadosIds', adv.cpf);
            }
        });
        
        processo.partes.forEach((p, index) => {
            formData.append(`partes[${index}].parteId`, p.parteId);
            formData.append(`partes[${index}].tipoParte`, p.tipoParte);
        });
        
        if (contrato) formData.append('contrato', contrato);

        const res = await api.post('/processos', formData);
        
        setCreatedProcessId(res.data.id || res.data);
        setStep(2);
        window.scrollTo(0, 0);

    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || err.message;
        if (msg.includes("Unique index") || msg.includes("Constraint")) {
            alert("Já existe um processo cadastrado com este número.");
        } else {
            alert(`Erro ao criar processo: ${msg}`);
        }
    } finally {
        setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!createdProcessId) return;

    try {
        setLoading(true);
        const promises = [];

        const prazosValidos = prazos.filter(p => p.descricao && p.dataVencimento);
        prazosValidos.forEach(p => {
            promises.push(api.post('/prazos', {
                dataVencimento: p.dataVencimento,
                descricao: p.descricao,
                idProcesso: createdProcessId
            }));
        });

        const docsValidos = documentosExtras.filter(d => d.file);
        if (docsValidos.length > 0) {
            const formData = new FormData();
            docsValidos.forEach(d => {
                formData.append('arquivos', d.file);
                formData.append('descricoes', d.descricao || 'Sem descrição');
            });
            promises.push(api.post(`/documentos/${createdProcessId}`, formData));
        }

        if (promises.length > 0) {
            await Promise.all(promises);
            alert('Cadastro finalizado com sucesso!');
        } else {
            alert('Processo salvo! Nenhum item extra foi adicionado.');
        }

        navigate(`/processos/read/${createdProcessId}`);

    } catch (err) {
        console.error("Erro ao salvar itens extras:", err);
        alert('O Processo foi criado, mas houve erro ao salvar Prazos ou Documentos.');
        navigate(`/processos/read/${createdProcessId}`);
    } finally {
        setLoading(false);
    }
  };

  const handleSkipStep2 = () => {
      navigate(`/processos/read/${createdProcessId}`);
  };

  return (
    <div className='container-fluid bg-light min-vh-100 p-4'>
      <div className='card border-0 shadow-sm rounded-3 bg-white'>
        <div className="card-body p-4">
          
          <div className="d-flex justify-content-between align-items-center border-bottom border-2 pb-2 mb-4">
             <h4 className="fw-bold mb-0" style={headerStyle}>
               {step === 1 ? 'Novo Processo: Dados Principais' : 'Novo Processo: Prazos e Documentos'}
             </h4>
             <span className="badge bg-secondary">Etapa {step} de 2</span>
          </div>

          {step === 1 && (
          <form onSubmit={handleStep1Submit}>
            <div className="row mb-3">
              <div className='col-12 col-md-4 mb-3'>
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Número do Processo<span className='fw-bold text-danger'> *</span></label>
                <input type="text" className='form-control' placeholder="0000000-00.0000.0.00.0000"
                value={processo.numero} style={getInputStyle(processo.numero)} maxLength={25}
                onChange={handleProcessoMask} required/>
              </div>

              <div className='col-12 col-md-4 mb-3'>
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Status<span className='fw-bold text-danger'> *</span></label>
                <select className='form-select' value={processo.status} style={getInputStyle(processo.status)}
                  onChange={e => setProcesso({...processo, status: e.target.value})} required>
                  <option value="">Selecionar</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="ARQUIVADO">Arquivado</option>
                  <option value="FINALIZADO">Finalizado</option>
                </select>
              </div>

              <div className='col-12 col-md-4 mb-3'>
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Estado<span className='fw-bold text-danger'> *</span></label>
                <select className='form-select' value={processo.estado} style={getInputStyle(processo.estado)}
                  onChange={e => setProcesso({...processo, estado: e.target.value})} required>
                    <option value="">Selecionar</option>
                    {EstadosBrasileiros.map((uf) => <option key={uf.sigla} value={uf.sigla}>{uf.sigla} - {uf.nome}</option>)}
                </select>
              </div>

              <div className='col-8 mb-2'>
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Contrato (PDF)<span className='fw-bold text-danger'> *</span></label>
                  <input type="file" className='form-control' accept='.pdf' onChange={(e) => setContrato(e.target.files[0])} style={getInputStyle(contrato)} required/>
              </div>
            </div>

            <h5 className="fw-bold text-secondary mt-4 mb-3 bg-light p-2">
              <i className="bi bi-person-badge me-2"></i>  
              Advogados
            </h5>
            <hr/>
            <div className="row mb-3" ref={advPrincipalDropdownRef}>
              <div className='col-12 col-md-6 mb-3'>
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Advogado Responsável<span className='fw-bold text-danger'> *</span></label>
                <div className="position-relative">
                  <input type="text" className="form-control" placeholder="Busca por nome..."
                    style={getInputStyle(advPrincipalTerm)} value={advPrincipalTerm}
                    onChange={e => {
                      setAdvPrincipalTerm(e.target.value);
                      if(e.target.value === '') setProcesso({...processo, advogadoPrincipalId: ''});
                    }}
                    onFocus={() => setShowAdvPrincipalDropdown(true)} required={!processo.advogadoPrincipalId}/>
                  {showAdvPrincipalDropdown && (
                    <div className="list-group position-absolute w-100 shadow" style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1060}}>
                      {filteredAdvPrincipal.map(adv => (
                          <button key={adv.id} type="button" className={`list-group-item list-group-item-action ${processo.advogadoPrincipalId === adv.id ? 'active' : ''}`}
                            onClick={() => selectAdvogadoPrincipal(adv)}>{adv.nome} ({adv.cpf})</button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='row mb-4' ref={advDropdownRef}>
              <div className='col-6'>
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Advogados Associados<span className='fw-bold text-danger'> *</span></label>
                <div className="position-relative">
                  <input type="text" className='form-control' placeholder='Busca por nome...'
                    value={advTerm} onChange={e => setAdvTerm(e.target.value)} onFocus={() => setShowAdvDropdown(true)}/>
                  {showAdvDropdown && (
                    <div className="list-group position-absolute w-100 shadow" style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1050}}>
                      {filteredAdvogados.map(adv => (
                        <button key={adv.id} type="button" className={`list-group-item list-group-item-action ${processo.advogadosIds.includes(adv.id) ? 'active' : ''}`}
                          onClick={() => toggleAdvogado(adv.id)}>{adv.nome} ({adv.cpf})</button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              {processo.advogadosIds.map((id) => (
                <span key={id} className="badge bg-light text-dark border me-2 mb-2 p-2">
                  {getAdvogadoNome(id)} <i className="bi bi-x ms-2 cursor-pointer text-danger" onClick={() => toggleAdvogado(id)}></i>
                </span>
              ))}
            </div>

            <h5 className="fw-bold text-secondary mt-4 mb-3 bg-light p-2">
              <i className="bi bi-people me-2"></i>
              Partes Envolvidas
            </h5>
            <hr/>
            <div className="row mb-3" ref={partesDropdownRef}>
              <div className="col-6">
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Adicionar Parte<span className='fw-bold text-danger'> *</span></label>
                <div className="position-relative">
                  <input type="text" className='form-control' placeholder='Busca por nome...'
                    value={partesTerm} onChange={e => setPartesTerm(e.target.value)} onFocus={() => setShowPartesDropdown(true)}/>
                  {showPartesDropdown && (
                  <div className="list-group position-absolute w-100 shadow" style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1050}}>
                      {filteredPartes.map(parte => (
                        <button key={parte.id} type="button" className={`list-group-item list-group-item-action ${processo.partes.some(p => p.parteId === parte.id) ? 'active' : ''}`}
                          onClick={() => toggleParte(parte)}>{parte.nomeCpf}</button>
                        ))}
                  </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              {processo.partes.map((p, idx) => (
                  <div key={p.parteId} className="row g-2 mb-2 align-items-end">
                    <div className="col-4"><input type="text" className="form-control" value={p.nome} disabled /></div>
                    <div className="col-3">
                      <select className="form-select" value={p.tipoParte}
                        onChange={e => {
                          const novas = [...processo.partes]; novas[idx].tipoParte = e.target.value; setProcesso({...processo, partes: novas});
                        }} required>
                        <option value="">Selecione</option>
                        <option value="AUTOR">Autor</option>
                        <option value="REU">Réu</option>
                        <option value="TERCEIRO">Terceiro</option>
                        <option value="ASSISTENTE">Assistente</option>
                        <option value="INTERESSADO">Interessado</option>
                      </select>
                    </div>
                    <div className="col-1"><button type="button" className="btn btn-danger" onClick={() => toggleParte({id: p.parteId})}><i className="bi bi-trash"></i></button></div>
                  </div>
                ))}
            </div>

            <div className='mb-4'>
              <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>Observações</label>
              <textarea rows="3" className='form-control' onChange={e => setProcesso({...processo, observacoes:e.target.value})}
                placeholder='Adicione aqui, caso houver, observações adicionais sobre o Processo'></textarea>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-5 border-top pt-4">
              <Link to="/processos" className='btn btn-outline-secondary px-4'>Cancelar</Link>
              <button type="submit" className='btn px-4 fw-bold text-white' style={{...actionBtnStyle, backgroundColor: Colors.primaryDeep}} disabled={loading}>
                {loading ? 'Criando...' : 'Próximo >>'}
              </button>
            </div>
          </form>
          )}

          {step === 2 && (
          <form onSubmit={handleStep2Submit}>
            <div className="alert alert-success d-flex align-items-center mb-4">
                <i className="bi bi-check-circle-fill me-2 fs-4"></i>
                <div>Processo <strong>{processo.numero}</strong> criado com sucesso! Agora adicione os itens opcionais.</div>
            </div>

            <h5 className="fw-bold text-secondary mb-3">Prazos e Vencimentos</h5>
            <div className="mb-5 bg-light p-3 rounded">
              {prazos.map((prazo, index) => (
                <div key={index} className="row g-2 mb-3 align-items-end">
                  <div className='col-md-3'>
                    <small className="text-muted">Data Vencimento</small>
                    <input type="date" className="form-control" style={getInputStyle(prazo.dataVencimento)}
                      value={prazo.dataVencimento} onChange={(e) => handlePrazoChange(index, 'dataVencimento', e.target.value)}/>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Descrição do Prazo</small>
                    <input type="text" className="form-control" style={getInputStyle(prazo.descricao)}
                      value={prazo.descricao} onChange={(e) => handlePrazoChange(index, 'descricao', e.target.value)} placeholder="Ex: Audiência"/>
                  </div>
                  <div className="col-md-3 d-flex gap-2">
                    {index === 0 ? (
                      <button type="button" className="btn btn-success w-80" onClick={handleAddPrazo}><i className="bi bi-plus-lg"></i></button>
                    ) : (
                      <button type="button" className="btn btn-danger w-80" onClick={() => handleRemovePrazo(index)}><i className="bi bi-trash"></i></button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <h5 className="fw-bold text-secondary mb-3">Documentos Extras</h5>
            <div className="mb-5 bg-light p-3 rounded">
              {documentosExtras.map((doc, index) => (
                <div key={doc.id} className="row g-2 mb-3 align-items-end">
                  <div className="col-12 col-md-4">
                    <small className="text-muted">Arquivo (PDF)</small>
                    <input type="file" className="form-control" accept=".pdf" onChange={(e) => handleDocumentoFileChange(index, e)}/>
                  </div>
                  <div className="col-8 col-md-5">
                    <small className="text-muted">Descrição do Documento</small>
                    <input type="text" className="form-control" placeholder="Ex: Comprovante" value={doc.descricao}
                      onChange={(e) => handleDocumentoDescChange(index, e.target.value)}/>
                  </div>
                  <div className="col-md-3 d-flex gap-2">
                    {index === 0 ? (
                      <button type="button" className="btn btn-success w-80" onClick={handleAddDocumento}><i className="bi bi-plus-lg"></i></button>
                      ) : (
                      <button type="button" className="btn btn-danger w-80" onClick={() => handleRemoveDocumento(index)}><i className="bi bi-trash"></i></button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between mt-5 border-top pt-4">
              <button type="button" onClick={handleSkipStep2} className='btn btn-link text-secondary text-decoration-none'>
                Pular e Finalizar
              </button>
              <button type="submit" className='btn px-4 fw-bold' style={actionBtnStyle} disabled={loading}>
                {loading ? 'Salvando...' : 'Finalizar Cadastro'}
              </button>
            </div>
          </form>
          )}

        </div>
      </div>
    </div>
    
  )
}

export default Create