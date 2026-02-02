import { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/API';
import { Link, useParams } from 'react-router-dom';
import { Colors } from '../../constants/Colors';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';

function Read() {
  const { id } = useParams();
  
  // --- ESTADOS ---
  const [processo, setProcesso] = useState(null);
  const [prazosList, setPrazosList] = useState([]);
  const [documentosList, setDocumentosList] = useState([]);
  
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // --- BUSCA DE DADOS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);

        // 1. Carrega o Processo (DTO atualizado com Papel e Tipo de Pessoa)
        const resProcesso = await api.get(`/processos/${id}`);
        console.log('=== RESPOSTA COMPLETA DA API ===');
        console.log(JSON.stringify(resProcesso.data, null, 2));
        console.log('=== PARTES IDS ===');
        console.log(resProcesso.data.partesIds);
        setProcesso(resProcesso.data);

        // 2. Carrega Prazos
        try {
            const resPrazos = await api.get(`/processos/${id}/prazos`);
            setPrazosList(resPrazos.data || []);
        } catch (e) { console.warn("Erro ao carregar prazos", e); }

        // 3. Carrega Documentos
        try {
            const resDocs = await api.get(`/documentos/list/${id}`); 
            const docsData = Array.isArray(resDocs.data) ? resDocs.data : (resDocs.data.content || []);
            setDocumentosList(docsData);
        } catch (e) { console.warn("Erro ao carregar documentos", e); }

      } catch (err) {
        console.error("Erro crítico:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // --- DOWNLOAD DO CONTRATO ---
  useEffect(() => {
    const fetchContractBlob = async () => {
        if (!processo || !processo.contrato) return;
        const contratoId = processo.contrato.id;
        
        try {
            const response = await api.get(`/contratos/${contratoId}`, { responseType: 'blob' });
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setPdfUrl(fileURL);
        } catch (error) {
            console.error("Erro ao baixar PDF do contrato:", error);
            setPdfUrl(null);
        }
    };
    fetchContractBlob();
  }, [processo]);

  // --- HELPERS ---
  const formatDate = (dateString) => {
    try { return new Date(dateString).toLocaleDateString('pt-BR'); } 
    catch { return dateString || '-'; }
  };

  // Máscara para Número de Processo (0000000-00.0000.0.00.0000)
  const formatNumeroProcesso = (numero) => {
    if (!numero) return '-';
    const nums = numero.replace(/\D/g, '');
    if (nums.length !== 20) return numero;
    
    return `${nums.substring(0, 7)}-${nums.substring(7, 9)}.${nums.substring(9, 13)}.${nums.substring(13, 14)}.${nums.substring(14, 16)}.${nums.substring(16, 20)}`;
  };

  // Formata OAB no padrão 000000/UF
  const formatOAB = (numeroOAB, seccional) => {
    if (!numeroOAB) return '-';
    const oabNum = numeroOAB.replace(/\D/g, '');
    return seccional ? `${oabNum}/${seccional}` : oabNum;
  };

  // Formata Estado no padrão UF - Nome Completo
  const formatEstado = (sigla) => {
    if (!sigla) return '-';
    const estado = EstadosBrasileiros.find(e => e.sigla === sigla);
    return estado ? `${estado.sigla} - ${estado.nome}` : sigla;
  };

  // Lógica para Label do Documento (CPF vs CNPJ)
  const getDocLabel = (tipoPessoa) => {
      if (!tipoPessoa) return "Doc";
      
      // Se for string, converte para minúsculo
      const tipo = typeof tipoPessoa === 'string' 
        ? tipoPessoa.toLowerCase() 
        : String(tipoPessoa).toLowerCase();
      
      console.log('=== DEBUG getDocLabel ===');
      console.log('tipoPessoa recebido:', tipoPessoa);
      console.log('tipo após conversão:', tipo);
      
      if (tipo.includes("física") || tipo.includes("fisica")) return "CPF";
      if (tipo.includes("jurídica") || tipo.includes("juridica")) return "CNPJ";
      return "Doc";
  };

  // Formata CPF: 000.000.000-00
  const formatCPF = (cpf) => {
    if (!cpf) return '-';
    const nums = cpf.replace(/\D/g, '');
    if (nums.length !== 11) return cpf;
    return `${nums.substring(0, 3)}.${nums.substring(3, 6)}.${nums.substring(6, 9)}-${nums.substring(9, 11)}`;
  };

  // Formata CNPJ: 00.000.000/0000-00
  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '-';
    const nums = cnpj.replace(/\D/g, '');
    if (nums.length !== 14) return cnpj;
    return `${nums.substring(0, 2)}.${nums.substring(2, 5)}.${nums.substring(5, 8)}/${nums.substring(8, 12)}-${nums.substring(12, 14)}`;
  };

  // Formata documento baseado no tipo de pessoa
  const formatDocumento = (documento, tipoPessoa) => {
    if (!documento || !tipoPessoa) return documento || '-';
    
    const tipo = typeof tipoPessoa === 'string' 
      ? tipoPessoa.toLowerCase() 
      : String(tipoPessoa).toLowerCase();
    
    if (tipo.includes("física") || tipo.includes("fisica")) {
      return formatCPF(documento);
    } else if (tipo.includes("jurídica") || tipo.includes("juridica")) {
      return formatCNPJ(documento);
    }
    return documento;
  };

  // Traduz o tipo de parte (ENUM do backend)
  const traduzirTipoParte = (tipoParte) => {
    const tipos = {
      'AUTOR': 'Autor',
      'REU': 'Réu',
      'TERCEIRO': 'Terceiro',
      'ASSISTENTE': 'Assistente',
      'INTERESSADO': 'Interessado',
      'PARTE': 'Parte'
    };
    return tipos[tipoParte] || 'Parte';
  };

  // Retorna cor do badge baseado no tipo de parte
  const getCorBadgeParte = (tipoParte) => {
    const cores = {
      'AUTOR': 'bg-success',
      'REU': 'bg-danger',
      'TERCEIRO': 'bg-warning',
      'ASSISTENTE': 'bg-info',
      'INTERESSADO': 'bg-secondary'
    };
    return cores[tipoParte] || 'bg-secondary';
  };

  // --- TIMELINE ---
  const timelineEvents = useMemo(() => {
    const eventsPrazos = prazosList.map(p => ({
      type: 'PRAZO',
      date: p.dataVencimento,
      title: 'Vencimento de Prazo',
      description: p.descricao,
      id: `prazo-${p.id}`,
      diasRestantes: p.diasFimPrazo
    }));

    const eventsDocs = documentosList.map(d => ({
      type: 'DOC',
      date: d.dataCriacao,
      title: 'Documento Anexado',
      description: d.descricao || d.nome,
      id: `doc-${d.id}`,
      originalId: d.id
    }));

    return [...eventsPrazos, ...eventsDocs].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [prazosList, documentosList]);

  const handleDownloadDoc = async (docId, nomeArquivo) => {
    try {
        const res = await api.get(`/documentos/${docId}/arquivo`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', nomeArquivo || 'documento.pdf');
        document.body.appendChild(link);
        link.click();
    } catch (e) { alert("Erro ao baixar documento."); }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Carregando...</div>;
  if (error || !processo) return <div className="p-5 text-center text-danger">Processo não encontrado</div>;

  const resp = processo.advogadoResponsavelId || {}; 
  const advogadosAssociados = processo.advogadosIds || [];
  const partes = processo.partesIds || [];

  return (
    <div className='container-fluid vh-100 overflow-hidden bg-light'>
      <div className='row h-100'>
        
        {/* === ESQUERDA === */}
        <div className='col-12 col-lg-7 h-100 overflow-auto p-4 custom-scrollbar'>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-0" style={{ color: Colors?.primaryDeep || '#0d6efd' }}>Processo <br/> {formatNumeroProcesso(processo.numero)}<br/></h2>
              <span className="badge bg-primary mt-2">{processo.status?.replace('_', ' ')}</span>
            </div>
            <div className="d-flex gap-2">
              <Link to="/processos" className='btn btn-outline-secondary btn-sm'>Voltar</Link>
              <Link to={`/processos/update/${id}`} className='btn btn-success btn-sm'>Editar</Link>
            </div>
          </div>

          {/* Dados Gerais */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold border-bottom pb-2 mb-3 text-secondary">Dados Gerais</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <small className="text-muted d-block">Advogado Responsável</small>
                  <strong className=" fs-5 d-block">{resp.nome || "Não informado"}</strong>
                  {resp.numeroOAB && <small className="text-secondary">OAB: {formatOAB(resp.numeroOAB, resp.estado)}</small>}
                </div>
                
                <div className="col-md-6">
                  <small className="text-muted d-block">Estado</small>
                  <strong>{formatEstado(processo.estado)}</strong>
                </div>
                
                {/* Observações - Só aparece se houver conteúdo */}
                {processo.observacoes && processo.observacoes.trim() !== '' && (
                  <div className="col-12 mt-2">
                     <small className="text-muted"><br/>Observações</small>
                     <div className="bg-light p-2 rounded small">{processo.observacoes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row mb-4">
            {/* Advogados Associados */}
            <div className="col-md-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2">Advogados Associados</h6>
                  {advogadosAssociados.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {advogadosAssociados.map((adv, idx) => (
                        <li key={idx} className="list-group-item px-0 py-2">
                          <div className="fw-bold">{adv.nome}</div>
                          <small className="text-muted">OAB: {formatOAB(adv.numeroOAB, adv.estado)}</small>
                        </li>
                      ))}
                    </ul>
                  ) : <span className="text-muted small">Nenhum associado.</span>}
                </div>
              </div>
            </div>

            {/* Partes Envolvidas */}
            <div className="col-md-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2">Partes Envolvidas</h6>
                  {partes.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {partes.map((p, idx) => {
                        // DEBUG: Verificar dados
                        console.log('=== PARTE DEBUG ===', idx);
                        console.log('Parte completa:', p);
                        console.log('tipoPessoa:', p.tipoPessoa, 'tipo:', typeof p.tipoPessoa);
                        console.log('tipoParte:', p.tipoParte);
                        
                        return (
                          <li key={idx} className="list-group-item px-0 d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold text-dark">{p.nome}</span>
                                <span className={`badge ${getCorBadgeParte(p.tipoParte)}`}>
                                  {traduzirTipoParte(p.tipoParte)}
                                </span>
                            </div>
                            <div className="d-flex justify-content-between mt-1">
                                <small className="text-muted">
                                    {getDocLabel(p.tipoPessoa)}: {formatDocumento(p.documento, p.tipoPessoa)}
                                </small>
                                <small className="text-muted fst-italic">{p.tipoPessoa}</small>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : <span className="text-muted small">Nenhuma parte vinculada.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-4">
            <h5 className="fw-bold mb-4 ps-2 border-start border-4 border-primary">Histórico</h5>
            <hr/><br/>
            {timelineEvents.length > 0 ? (
              <div className="position-relative ps-4 pb-5">
                <div className="position-absolute h-100 border-start border-2 bg-secondary opacity-25" style={{left: '1.4rem', top: 0}}></div>
                {timelineEvents.map((event) => (
                    <div key={event.id} className="card border-0 shadow-sm mb-3 position-relative">
                      <div className={`position-absolute top-0 start-0 translate-middle rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm ${event.type === 'PRAZO' ? 'bg-danger' : 'bg-primary'}`} 
                           style={{width: '40px', height: '40px', left: '-22px', zIndex: 1}}>
                        <i className={`bi ${event.type === 'PRAZO' ? 'bi-calendar-event' : 'bi-paperclip'}`}></i>
                      </div>
                      <div className="card-body ms-2 py-2">
                        <div className="d-flex justify-content-between">
                          <h6 className={`fw-bold mb-0 ${event.type === 'PRAZO' ? 'text-danger' : 'text-primary'}`}>{event.title}</h6>
                          <span className="badge bg-light text-secondary border">{formatDate(event.date)}</span>
                        </div>
                        <p className="card-text mb-1 small">{event.description}</p>
                        {event.type === 'DOC' && (
                          <button onClick={() => handleDownloadDoc(event.originalId, event.description)} className="btn btn-sm btn-link px-0 text-decoration-none">
                             <i className="bi bi-download me-1"></i> Baixar
                          </button>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-5 bg-light rounded">
                <i className="bi bi-calendar-x display-4 text-muted mb-3"></i>
                <p className="text-muted">Nenhum Prazo ou Documento adicionado.</p>
              </div>
            )}
          </div>
        </div>

        {/* === DIREITA: CONTRATO === */}
        <div className='col-12 col-lg-5 h-100 p-0 border-start shadow bg-secondary d-flex flex-column'>
          {processo.contrato ? (
            <>
              <div className="bg-dark text-white px-3 py-2 d-flex justify-content-between align-items-center shadow-sm">
                 <span className="fw-bold"><i className="bi bi-file-earmark-pdf-fill me-2"></i>Contrato Principal</span>
                 {pdfUrl && <a href={pdfUrl} download={`Contrato_${processo.numero}.pdf`} className="btn btn-sm btn-outline-light"><i className="bi bi-download"></i></a>}
              </div>
              <div className="flex-grow-1 bg-white position-relative d-flex flex-column justify-content-center align-items-center">
                {pdfUrl ? (
                    <iframe src={pdfUrl} className="w-100 h-100 border-0" title="Contrato"></iframe>
                ) : (
                    <div className="text-center p-4">
                        <i className="bi bi-exclamation-triangle display-4 text-warning mb-3"></i>
                        <h5>Visualização indisponível</h5>
                        <p className="text-muted">Não foi possível carregar a pré-visualização.</p>
                        <a href={`${api.defaults.baseURL}/contratos/${processo.contrato.id}`} target="_blank" rel="noreferrer" className="btn btn-primary mt-3">
                            <i className="bi bi-download me-2"></i> Baixar Arquivo Diretamente
                        </a>
                    </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-100 d-flex flex-column justify-content-center align-items-center bg-light text-muted p-5 text-center">
              <i className="bi bi-file-earmark-x display-4 mb-3 opacity-50"></i>
              <h5 className="fw-bold">Nenhum contrato carregado</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Read;