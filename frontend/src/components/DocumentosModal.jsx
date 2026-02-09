import { useState, useEffect } from 'react';
import { api } from '../services/API';
import { Colors } from '../constants/Colors';

function DocumentosModal({ isOpen, onClose, processoId, onUpdate }) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ arquivos: [], descricoes: [] });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editData, setEditData] = useState({ descricao: '' });

  useEffect(() => {
    if (isOpen) fetchDocumentos();
  }, [isOpen]);

  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/documentos/list/${processoId}`);
      const docs = Array.isArray(res.data) ? res.data : (res.data.content || []);
      setDocumentos(docs);
    } catch (err) {
      console.error("Erro ao carregar documentos:", err);
      alert("Erro ao carregar documentos");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setFormData(prev => ({ 
      ...prev,
      arquivos: files
    }));
  };

  const handleDescricaoChange = (index, value) => {
    const newDescricoes = [...formData.descricoes];
    newDescricoes[index] = value;
    setFormData({ ...formData, descricoes: newDescricoes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      alert("Selecione pelo menos um arquivo");
      return;
    }

    const data = new FormData();
    selectedFiles.forEach((file) => {
      data.append('arquivos', file);
    });
    
    // ✅ Usa a descrição do formData ou 'Sem descrição' como fallback
    const descricao = formData.descricoes[0] || 'Sem descrição';
    data.append('descricoes', descricao);

    try {
      setLoading(true);
      await api.post(`/documentos/${processoId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("Documento cadastrado com sucesso!");
      setShowForm(false);
      setSelectedFiles([]);
      setFormData({ arquivos: [], descricoes: [] });
      fetchDocumentos();
      onUpdate?.();
    } catch (err) {
      console.error("Erro ao cadastrar documentos:", err);
      alert("Erro ao cadastrar documentos");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doc) => {
    setEditingId(doc.id);
    setEditData({ descricao: doc.descricao || '' });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const formData = new FormData();
      
      const params = new URLSearchParams();
      params.append('ids', editingId);
      params.append('descricoes', editData.descricao);
      
      await api.put(`/documentos?${params.toString()}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert("Documento atualizado com sucesso!");
      setEditingId(null);
      setEditData({ descricao: '' });
      fetchDocumentos();
      onUpdate?.();
    } catch (err) {
      console.error("Erro ao atualizar documento:", err);
      alert("Erro ao atualizar documento: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ids) => {
    if (!window.confirm("Deseja realmente excluir este documento?")) return;
    
    try {
      setLoading(true);
      await api.delete('/documentos', { data: Array.isArray(ids) ? ids : [ids] });
      alert("Documento excluído com sucesso!");
      fetchDocumentos();
      onUpdate?.();
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir documento");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId, nome) => {
    try {
      const res = await api.get(`/documentos/${docId}/arquivo`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nome || 'documento.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Erro ao baixar documento");
    }
  };

  const formatDate = (dateString) => {
    try { return new Date(dateString).toLocaleString('pt-BR'); }
    catch { return dateString || '-'; }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          
          {/* Header */}
          <div className="modal-header text-white" style={{ backgroundColor: Colors.primaryDark }}>
            <h5 className="modal-title">
              <i className="bi bi-file-earmark-text me-2"></i>
              Documentos do Processo
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            
            {/* Botão Novo Documento */}
            {!showForm && (
              <button 
                className="btn mb-3 w-100 text-white fw-bold"
                style={{ backgroundColor: Colors.success }}
                onClick={() => setShowForm(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Adicionar Documento
              </button>
            )}

            {/* Formulário de Cadastro */}
            {showForm && (
              <form onSubmit={handleSubmit} className="border rounded p-3 mb-3 bg-light">
                <h6 className="fw-bold mb-3" style={{ color: Colors.primaryDark }}>Novo Documento</h6>
                
                <div className="mb-3">
                  <label className="form-label">Descrição<span className="text-danger fw-bold"> *</span></label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.descricoes[0] || ''}
                    onChange={(e) => handleDescricaoChange(0, e.target.value)}
                    placeholder="Digite a descrição do documento..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Selecione o arquivo (PDF)<span className="text-danger fw-bold"> *</span></label>
                  <input 
                    type="file" 
                    className="form-control"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn text-white" 
                    style={{ backgroundColor: Colors.primaryDark }}
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedFiles([]);
                      setFormData({ arquivos: [], descricoes: [] });
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Lista de Documentos */}
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border" style={{ color: Colors.primaryDark }} role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : documentos.length > 0 ? (
              <div className="list-group">
                {documentos.map((doc) => (
                  <div key={doc.id} className="list-group-item">
                    {editingId === doc.id ? (
                      // Formulário de Edição
                      <form onSubmit={handleUpdateSubmit}>
                        <div className="mb-2">
                          <label className="form-label fw-bold" style={{ color: Colors.primaryDark }}>
                            Editar Descrição
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={editData.descricao}
                            onChange={(e) => setEditData({ descricao: e.target.value })}
                            required
                          />
                        </div>
                        <div className="d-flex gap-2">
                          <button 
                            type="submit" 
                            className="btn btn-sm text-white" 
                            style={{ backgroundColor: Colors.success }}
                            disabled={loading}
                          >
                            {loading ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => {
                              setEditingId(null);
                              setEditData({ descricao: '' });
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      // Visualização Normal
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold" style={{ color: Colors.primaryDark }}>
                            {doc.descricao || 'Sem descrição'}
                          </h6>
                          <p className="mb-1 text-muted small">{doc.nome}</p>
                          <small className="text-muted">
                            <i className="bi bi-calendar-event me-1"></i>
                            {formatDate(doc.dataCriacao)}
                          </small>
                        </div>
                        
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-sm border-0 me-1"
                            style={{ borderColor: Colors.primaryDark, color: Colors.primaryDark }}
                            onClick={() => handleDownload(doc.id, doc.nome)}
                            title="Baixar">
                            <i className="bi bi-download fs-6"></i>
                          </button>

                          <button
                          className='btn btn-sm border-0 me-1' 
                          style={{color: Colors.primaryDeep || '#2C2966'}}
                          onClick={() => handleEdit(doc)}
                          title="Editar">
                          <i className="bi bi-pencil fs-6"></i>
                          </button>

                          <button 
                            className='btn btn-sm border-0'
                            style={{color: Colors.danger || '#c24c58'}}
                            onClick={() => handleDelete(doc.id)}
                            title="Excluir">
                            <i className="bi bi-trash fs-6"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted p-4">
                <i className="bi bi-inbox display-4 mb-3"></i>
                <p>Nenhum documento cadastrado</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentosModal;