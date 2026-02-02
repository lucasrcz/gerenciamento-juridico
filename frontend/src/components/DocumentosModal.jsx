import { useState, useEffect } from 'react';
import { api } from '../services/API';

function DocumentosModal({ isOpen, onClose, processoId, onUpdate }) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ arquivos: [], descricoes: [] });
  const [selectedFiles, setSelectedFiles] = useState([]);

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
    setFormData({ 
      arquivos: files,
      descricoes: files.map(() => '')
    });
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
    formData.descricoes.forEach((desc) => {
      data.append('descricoes', desc || 'Sem descrição');
    });

    try {
      setLoading(true);
      await api.post(`/documentos/${processoId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("Documentos cadastrados com sucesso!");
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

  const handleDelete = async (ids) => {
    if (!window.confirm("Deseja realmente excluir este(s) documento(s)?")) return;
    
    try {
      setLoading(true);
      await api.delete('/documentos', { data: Array.isArray(ids) ? ids : [ids] });
      alert("Documento(s) excluído(s) com sucesso!");
      fetchDocumentos();
      onUpdate?.();
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir documento(s)");
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
          <div className="modal-header bg-primary text-white">
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
                className="btn btn-success mb-3 w-100"
                onClick={() => setShowForm(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Adicionar Documento
              </button>
            )}

            {/* Formulário de Cadastro */}
            {showForm && (
              <form onSubmit={handleSubmit} className="border rounded p-3 mb-3 bg-light">
                <h6 className="fw-bold mb-3">Novo Documento</h6>
                
                <div className="mb-3">
                  <label className="form-label">Selecione o arquivo (PDF)</label>
                  <input 
                    type="file" 
                    className="form-control"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Descrição do Arquivo</label>
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="mb-2">
                        <small className="text-muted d-block">{file.name}</small>
                        <input 
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.descricoes[idx] || ''}
                          onChange={(e) => handleDescricaoChange(idx, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
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
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : documentos.length > 0 ? (
              <div className="list-group">
                {documentos.map((doc) => (
                  <div key={doc.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-bold">{doc.nome}</h6>
                        <p className="mb-1 text-muted small">{doc.descricao || 'Sem descrição'}</p>
                        <small className="text-muted">
                          <i className="bi bi-calendar-event me-1"></i>
                          {formatDate(doc.dataCriacao)}
                        </small>
                      </div>
                      
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => handleDownload(doc.id, doc.nome)}
                          title="Baixar"
                        >
                          <i className="bi bi-download"></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(doc.id)}
                          title="Excluir"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentosModal;