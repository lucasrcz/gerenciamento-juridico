import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/API'
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros'
import { Colors } from '../../constants/Colors'

function Update() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
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
  const [contratoAtual, setContratoAtual] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Listas para seleção
  const [advogados, setAdvogados] = useState([]);
  const [todasPartes, setTodasPartes] = useState([]);
  
  // Advogado Principal
  const [advPrincipalTerm, setAdvPrincipalTerm] = useState('');
  const [filteredAdvPrincipal, setFilteredAdvPrincipal] = useState([]);
  const [showAdvPrincipalDropdown, setShowAdvPrincipalDropdown] = useState(false);
  const advPrincipalDropdownRef = useRef(null);

  // Advogados Associados
  const [advTerm, setAdvTerm] = useState('');
  const [filteredAdvogados, setFilteredAdvogados] = useState([]);
  const [showAdvDropdown, setShowAdvDropdown] = useState(false);
  const advDropdownRef = useRef(null);
  
  // Partes
  const [partesTerm, setPartesTerm] = useState('');
  const [filteredPartes, setFilteredPartes] = useState([]);
  const [showPartesDropdown, setShowPartesDropdown] = useState(false);
  const partesDropdownRef = useRef(null);

  // Carregamento de dados do processo
  useEffect(() => { 
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const res = await api.get('/processos/' + id);
        const processoData = res.data;
        
        console.log('=== DEBUG PROCESSO COMPLETO ===');
        console.log(JSON.stringify(processoData, null, 2));
        
        const advIds = processoData.advogadosIds?.map(adv => adv.id) || [];
        
        const partesData = processoData.partesIds?.map(p => ({
          parteId: p.id,
          tipoParte: p.tipoParte || '',
          nome: p.nome
        })) || [];

        setProcesso({
          numero: processoData.numero || '',
          status: processoData.status || '',
          estado: processoData.estado || '',
          observacoes: processoData.observacoes || '',
          advogadoPrincipalId: processoData.advogadoResponsavelId?.id || '',
          advogadosIds: advIds,
          partes: partesData
        });

        if (processoData.advogadoResponsavelId) {
          setAdvPrincipalTerm(processoData.advogadoResponsavelId.nome);
        }

        if (processoData.contrato) {
          console.log('=== DEBUG CONTRATO ===');
          console.log('Contrato recebido:', processoData.contrato);
          console.log('ID:', processoData.contrato.id);
          console.log('Nome:', processoData.contrato.name);
          
          // ✅ CORREÇÃO: Salvar o nome correto do contrato
          setContratoAtual({
            id: processoData.contrato.id,
            nome: processoData.contrato.name || 'Contrato.pdf'
          });
          
          try {
            const response = await api.get(`/contratos/${processoData.contrato.id}`, { responseType: 'blob' });
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setPdfUrl(fileURL);
          } catch (error) {
            console.error("Erro ao baixar PDF do contrato:", error);
          }
        }

        const [resAdv, resPartes] = await Promise.all([
          api.get('/auth/advogados/select', { params: {q: ''} }),
          api.get('/partes/select', { params: {q: ''} })
        ]);

        const advData = resAdv.data.content || resAdv.data;
        setAdvogados(Array.isArray(advData) ? advData : []);
        setFilteredAdvogados(Array.isArray(advData) ? advData : []);
        
        const partesDataList = resPartes.data.content || resPartes.data;
        setTodasPartes(Array.isArray(partesDataList) ? partesDataList : []);
        setFilteredPartes(Array.isArray(partesDataList) ? partesDataList : []);

      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Filtros
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

  const formatNumeroProcesso = (numero) => {
    if (!numero) return '-';
    const nums = numero.replace(/\D/g, '');
    if (nums.length !== 20) return numero;
    return `${nums.substring(0, 7)}-${nums.substring(7, 9)}.${nums.substring(9, 13)}.${nums.substring(13, 14)}.${nums.substring(14, 16)}.${nums.substring(16, 20)}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setContrato(file);
      const fileURL = URL.createObjectURL(file);
      setPdfUrl(fileURL);
    } else {
      alert('Por favor, selecione um arquivo PDF');
      e.target.value = '';
    }
  };

  const handleRemoveFile = () => {
    setContrato(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Restaurar PDF do contrato atual (se existir)
    if (contratoAtual) {
      api.get(`/contratos/${contratoAtual.id}`, { responseType: 'blob' })
        .then(response => {
          const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
          setPdfUrl(fileURL);
        })
        .catch(error => console.error("Erro ao restaurar PDF:", error));
    } else {
      setPdfUrl(null);
    }
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
      else return { ...prev, partes: [...prev.partes, { parteId: parte.id, tipoParte: '', nome: parte.nomeCpf, key: `parte-${parte.id}-${Date.now()}` }] };
    });
    setPartesTerm('');
    setShowPartesDropdown(false);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!processo.advogadoPrincipalId) {
      alert('Por favor, selecione o Advogado Responsável');
      return;
    }

    const partesInvalidas = processo.partes.filter(p => !p.tipoParte || p.tipoParte === '');
    if (partesInvalidas.length > 0) {
      alert('Por favor, defina o tipo (Autor/Réu/etc) para todas as partes!');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      const numeroLimpo = processo.numero.replace(/\D/g, '');
      
      formData.append('numero', numeroLimpo);
      formData.append('status', processo.status);
      formData.append('estado', processo.estado);
      formData.append('observacoes', processo.observacoes || '');
      formData.append('advogadoPrincipalId', processo.advogadoPrincipalId);
      
      processo.advogadosIds.forEach(advId => {
        const adv = advogados.find(a => a.id === advId);
        if (adv && adv.cpf) {
          formData.append('advogadosIds', adv.cpf);
        }
      });
      
      processo.partes.forEach((p, index) => {
        formData.append(`partes[${index}].parteId`, p.parteId);
        formData.append(`partes[${index}].tipoParte`, p.tipoParte);
      });
      
      if (contrato) {
        formData.append('contrato', contrato);
      }

      console.log('=== DADOS SENDO ENVIADOS ===');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      await api.put('/processos/' + id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Processo atualizado com sucesso!');
      navigate('/processos/read/' + id);

    } catch (err) {
      console.error('Erro completo:', err);
      console.error('Resposta do servidor:', err.response?.data);
      
      const errorMsg = err.response?.data?.message || err.message || 'Erro desconhecido';
      alert(`Erro ao atualizar processo: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Carregando...</div>;
  if (error || !processo) return <div className="p-5 text-center text-danger">Processo não encontrado</div>;

  return (
    <div className='container-fluid vh-100 overflow-hidden bg-light'>
      <div className='row h-100'>
        
        {/* === ESQUERDA: FORMULÁRIO === */}
        <div className='col-12 col-lg-7 h-100 overflow-auto p-4 custom-scrollbar'>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-0" style={{ color: Colors?.primaryDeep || '#0d6efd' }}>
                Editar Processo <br/> {formatNumeroProcesso(processo.numero)}
              </h2>
              <span className="badge bg-warning text-dark mt-2">Modo Edição</span>
            </div>
            <div className="d-flex gap-2">
              <Link to={`/processos/read/${id}`} className='btn btn-outline-secondary btn-sm'>Cancelar</Link>
            </div>
          </div>

          <form onSubmit={handleUpdate}>
            {/* Dados Gerais */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold border-bottom pb-2 mb-3 text-secondary">Dados Gerais</h5>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="numero" className="form-label"><strong>Nº Processo *</strong></label>
                    <input 
                      type="text" 
                      id="numero"
                      name='numero' 
                      className='form-control'
                      placeholder="0000000-00.0000.0.00.0000"
                      maxLength="25"
                      value={processo.numero}
                      onChange={handleProcessoMask}
                      required
                    />
                    <small className="text-muted">20 dígitos numéricos</small>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="status" className="form-label"><strong>Status *</strong></label>
                    <select 
                      id="status"
                      name='status' 
                      className='form-control'
                      value={processo.status}
                      onChange={e => setProcesso({...processo, status: e.target.value})} 
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="EM_ANDAMENTO">Em Andamento</option>
                      <option value="ARQUIVADO">Arquivado</option>
                      <option value="FINALIZADO">Finalizado</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="estado" className="form-label"><strong>Estado *</strong></label>
                    <select 
                      id="estado"
                      name='estado' 
                      className='form-control'
                      value={processo.estado}
                      onChange={e => setProcesso({...processo, estado: e.target.value})}
                      required
                    >
                      <option value="">Selecione...</option>
                      {EstadosBrasileiros.map(estado => (
                        <option key={estado.sigla} value={estado.sigla}>
                          {estado.sigla} - {estado.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label htmlFor="observacoes" className="form-label"><strong>Observações</strong></label>
                    <textarea 
                      id="observacoes"
                      name='observacoes' 
                      className='form-control'
                      rows="4"
                      placeholder="Adicione observações sobre o processo..."
                      value={processo.observacoes || ''}
                      onChange={e => setProcesso({...processo, observacoes: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Advogados */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold border-bottom pb-2 mb-3 text-secondary">Advogados</h5>
                
                <div className="mb-3" ref={advPrincipalDropdownRef}>
                  <label className="form-label"><strong>Advogado Responsável *</strong></label>
                  <div className="position-relative">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Buscar por nome..."
                      value={advPrincipalTerm}
                      onChange={e => {
                        setAdvPrincipalTerm(e.target.value);
                        if(e.target.value === '') setProcesso({...processo, advogadoPrincipalId: ''});
                      }}
                      onFocus={() => setShowAdvPrincipalDropdown(true)}
                      required={!processo.advogadoPrincipalId}
                    />
                    {showAdvPrincipalDropdown && (
                      <div className="list-group position-absolute w-100 shadow" style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1060}}>
                        {filteredAdvPrincipal.map(adv => (
                          <button 
                            key={adv.id} 
                            type="button" 
                            className={`list-group-item list-group-item-action ${processo.advogadoPrincipalId === adv.id ? 'active' : ''}`}
                            onClick={() => selectAdvogadoPrincipal(adv)}
                          >
                            {adv.nome} ({adv.cpf})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3" ref={advDropdownRef}>
                  <label className="form-label"><strong>Advogados Associados</strong></label>
                  <div className="position-relative">
                    <input 
                      type="text" 
                      className='form-control' 
                      placeholder='Buscar por nome...'
                      value={advTerm} 
                      onChange={e => setAdvTerm(e.target.value)} 
                      onFocus={() => setShowAdvDropdown(true)}
                    />
                    {showAdvDropdown && (
                      <div className="list-group position-absolute w-100 shadow" style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1050}}>
                        {filteredAdvogados.map(adv => (
                          <button 
                            key={adv.id} 
                            type="button" 
                            className={`list-group-item list-group-item-action ${processo.advogadosIds.includes(adv.id) ? 'active' : ''}`}
                            onClick={() => toggleAdvogado(adv.id)}
                          >
                            {adv.nome} ({adv.cpf})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  {processo.advogadosIds.map((id) => (
                    <span key={id} className="badge bg-light text-dark border me-2 mb-2 p-2">
                      {getAdvogadoNome(id)} 
                      <i className="bi bi-x ms-2 cursor-pointer text-danger" style={{cursor: 'pointer'}} onClick={() => toggleAdvogado(id)}></i>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Partes Envolvidas */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold border-bottom pb-2 mb-3 text-secondary">Partes Envolvidas</h5>
                
                <div className="mb-3" ref={partesDropdownRef}>
                  <label className="form-label"><strong>Adicionar Parte</strong></label>
                  <div className="position-relative">
                    <input 
                      type="text" 
                      className='form-control' 
                      placeholder='Buscar por nome...'
                      value={partesTerm} 
                      onChange={e => setPartesTerm(e.target.value)} 
                      onFocus={() => setShowPartesDropdown(true)}
                    />
                    {showPartesDropdown && (
                      <div className="list-group position-absolute w-100 shadow" style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1050}}>
                        {filteredPartes.map(parte => (
                          <button 
                            key={parte.id} 
                            type="button" 
                            className={`list-group-item list-group-item-action ${processo.partes.some(p => p.parteId === parte.id) ? 'active' : ''}`}
                            onClick={() => toggleParte(parte)}
                          >
                            {parte.nomeCpf}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  {processo.partes.map((p, idx) => (
                    <div key={`${p.parteId}-${idx}`} className="row g-2 mb-2 align-items-end">
                      <div className="col-5">
                        <input type="text" className="form-control" value={p.nome} disabled />
                      </div>
                      <div className="col-5">
                        <select 
                          className="form-select" 
                          value={p.tipoParte}
                          onChange={e => {
                            const novas = [...processo.partes]; 
                            novas[idx].tipoParte = e.target.value; 
                            setProcesso({...processo, partes: novas});
                          }} 
                          required
                        >
                          <option value="">Selecione o Tipo *</option>
                          <option value="AUTOR">Autor</option>
                          <option value="REU">Réu</option>
                          <option value="TERCEIRO">Terceiro</option>
                          <option value="ASSISTENTE">Assistente</option>
                          <option value="INTERESSADO">Interessado</option>
                        </select>
                      </div>
                      <div className="col-2">
                        <button 
                          type="button" 
                          className="btn btn-danger w-100" 
                          onClick={() => toggleParte({id: p.parteId})}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload de Contrato - CORRIGIDO */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3 text-dark">Contrato (PDF)</h5>
                
                <div className="d-flex align-items-center gap-3 p-3 bg-light border rounded">
                  <label htmlFor="contrato" className="btn btn-outline-primary mb-0" style={{cursor: 'pointer'}}>
                    Escolher arquivo
                  </label>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    id="contrato"
                    name='contrato' 
                    className='d-none' 
                    accept='.pdf'
                    onChange={handleFileChange}
                  />
                  <span className="flex-grow-1">
                    {contrato ? (
                      <span className="text-success fw-bold">
                        <i className="bi bi-file-earmark-check me-2"></i>
                        {contrato.name}
                      </span>
                    ) : contratoAtual ? (
                      <span className="text-dark">
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        {contratoAtual.nome}
                      </span>
                    ) : (
                      <span className="text-muted">Nenhum arquivo escolhido</span>
                    )}
                  </span>
                  {/* ✅ BOTÃO X APENAS PARA NOVO ARQUIVO */}
                  {contrato && (
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleRemoveFile}
                      title="Remover novo arquivo"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="d-flex justify-content-end gap-2">
              <Link to={`/processos/read/${id}`} className='btn btn-outline-secondary'>
                <i className="bi bi-x-circle me-2"></i>Cancelar
              </Link>
              <button type="submit" className='btn btn-success' disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* === DIREITA: PREVIEW DO CONTRATO === */}
        <div className='col-12 col-lg-5 h-100 p-0 border-start shadow bg-secondary d-flex flex-column'>
          {pdfUrl ? (
            <>
              <div className="bg-dark text-white px-3 py-2 d-flex justify-content-between align-items-center shadow-sm">
                <span className="fw-bold">
                  <i className="bi bi-file-earmark-pdf-fill me-2"></i>
                  Contrato
                </span>
              </div>
              <div className="flex-grow-1 bg-white position-relative">
                <iframe 
                  src={pdfUrl} 
                  className="w-100 h-100 border-0" 
                  title="Preview Contrato"
                ></iframe>
              </div>
            </>
          ) : (
            <div className="h-100 d-flex flex-column justify-content-center align-items-center bg-light text-muted p-5 text-center">
              <i className="bi bi-file-earmark-plus display-4 mb-3 opacity-50"></i>
              <h5 className="fw-bold">Nenhum contrato carregado</h5>
              <p className="small">Faça upload de um arquivo PDF para visualizar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Update
