import { useState, useEffect } from 'react';
import { api } from '../services/API';

function PrazosModal({ isOpen, onClose, processoId, onUpdate }) {
  const [prazos, setPrazos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    descricao: '',
    dataVencimento: '',
    idProcesso: parseInt(processoId)
  });

  useEffect(() => {
    if (isOpen) fetchPrazos();
  }, [isOpen]);

  const fetchPrazos = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/processos/${processoId}/prazos`);
      console.log('Prazos carregados:', res.data); // DEBUG
      setPrazos(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar prazos:", err);
      alert("Erro ao carregar prazos");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      descricao: '',
      dataVencimento: '',
      idProcesso: parseInt(processoId)
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (prazo) => {
    console.log('Editando prazo:', prazo); // DEBUG
    
    if (!prazo.id) {
      alert("Erro: ID do prazo não encontrado");
      return;
    }

    setEditingId(prazo.id);
    setFormData({
      descricao: prazo.descricao,
      dataVencimento: prazo.dataVencimento,
      idProcesso: prazo.idProcesso || parseInt(processoId)
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.dataVencimento) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        descricao: String(formData.descricao).trim(),
        dataVencimento: formData.dataVencimento,
        idProcesso: parseInt(processoId)
      };

      console.log('=== SALVANDO PRAZO ===');
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('URL:', editingId ? `/prazos/${editingId}` : '/prazos');
      
      if (editingId) {
        await api.put(`/prazos/${editingId}`, payload);
        alert("Prazo atualizado com sucesso!");
      } else {
        await api.post('/prazos', payload);
        alert("Prazo cadastrado com sucesso!");
      }
      
      resetForm();
      fetchPrazos();
      onUpdate?.();
    } catch (err) {
      console.error("Erro ao salvar prazo:", err);
      console.error("Response:", err.response?.data);
      
      const errorMsg = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Erro desconhecido';
      
      alert(`Erro ao salvar prazo: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (prazoId) => {
    console.log('Tentando excluir prazo ID:', prazoId); // DEBUG

    if (!prazoId) {
      alert("Erro: ID do prazo não encontrado");
      return;
    }

    if (!window.confirm("Deseja realmente excluir este prazo?")) return;
    
    try {
      setLoading(true);
      console.log('DELETE URL:', `/prazos/${prazoId}`); // DEBUG
      await api.delete(`/prazos/${prazoId}`);
      alert("Prazo excluído com sucesso!");
      fetchPrazos();
      onUpdate?.();
    } catch (err) {
      console.error("Erro ao excluir:", err);
      console.error("Response:", err.response?.data);
      alert(`Erro ao excluir prazo: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try { return new Date(dateString).toLocaleDateString('pt-BR'); }
    catch { return dateString || '-'; }
  };

  const getStatusBadge = (diasRestantes) => {
    if (diasRestantes == null) return null;
    if (diasRestantes < 0) return <span className="badge bg-secondary">Vencido</span>;
    if (diasRestantes <= 3) return <span className="badge bg-danger">Urgente</span>;
    if (diasRestantes <= 7) return <span className="badge bg-warning text-dark">Atenção</span>;
    return <span className="badge bg-success">No Prazo</span>;
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          
          {/* Header */}
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">
              <i className="bi bi-calendar-event me-2"></i>
              Prazos do Processo
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            
            {/* Botão Novo Prazo */}
            {!showForm && (
              <button 
                className="btn btn-danger mb-3 w-100"
                onClick={() => setShowForm(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Adicionar Prazo
              </button>
            )}

            {/* Formulário */}
            {showForm && (
              <form onSubmit={handleSubmit} className="border rounded p-3 mb-3 bg-light">
                <h6 className="fw-bold mb-3">
                  {editingId ? 'Editar Prazo' : 'Novo Prazo'}
                </h6>
                
                <div className="mb-3">
                  <label className="form-label">Descrição *</label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    required
                    maxLength={500}
                    placeholder="Digite a descrição do prazo..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Data de Vencimento *</label>
                  <input 
                    type="date"
                    className="form-control"
                    value={formData.dataVencimento}
                    onChange={(e) => setFormData({...formData, dataVencimento: e.target.value})}
                    required
                  />
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={resetForm}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Lista de Prazos */}
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : prazos.length > 0 ? (
              <div className="list-group">
                {prazos.map((prazo, index) => (
                  <div key={prazo.id || `prazo-${index}`} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <h6 className="mb-0 fw-bold">
                            {formatDate(prazo.dataVencimento)}
                          </h6>
                          {getStatusBadge(prazo.diasFimPrazo)}
                        </div>
                        <p className="mb-1 text-muted">{prazo.descricao}</p>
                        {prazo.diasFimPrazo != null && (
                          <small className="text-muted">
                            {prazo.diasFimPrazo >= 0 
                              ? `${prazo.diasFimPrazo} dia(s) restante(s)` 
                              : `Vencido há ${Math.abs(prazo.diasFimPrazo)} dia(s)`
                            }
                          </small>
                        )}
                      </div>
                      
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(prazo)}
                          title="Editar"
                          disabled={!prazo.id}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(prazo.id)}
                          title="Excluir"
                          disabled={!prazo.id}
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
                <i className="bi bi-calendar-x display-4 mb-3"></i>
                <p>Nenhum prazo cadastrado</p>
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

export default PrazosModal;