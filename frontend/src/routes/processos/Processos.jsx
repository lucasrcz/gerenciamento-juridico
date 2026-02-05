import { useEffect, useState } from 'react';
import { api } from '../../services/API';
import { Link } from 'react-router-dom';
import Tabela from '../../layouts/Tabela';
import { Colors } from '../../constants/Colors';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';

function Processos() {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true); // ✅ Sempre aberto inicialmente
  
  // Filtros
  const [filters, setFilters] = useState({
    numero: '',
    status: '',
    estado: '',
    advogadoId: '',
    partesIds: []
  });

  // Estados para Advogado Responsável
  const [advogadoSearch, setAdvogadoSearch] = useState('');
  const [advogadoOptions, setAdvogadoOptions] = useState([]);
  const [showAdvogadoOptions, setShowAdvogadoOptions] = useState(false);

  // Estados para Partes
  const [parteSearch, setParteSearch] = useState('');
  const [parteOptions, setParteOptions] = useState([]);
  const [showParteOptions, setShowParteOptions] = useState(false);
  const [selectedPartes, setSelectedPartes] = useState([]);

  // Paginação
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10
  });

  // Ordenação
  const [sorting, setSorting] = useState({
    orderBy: 'id',
    direction: 'desc'
  });

  // --- MÁSCARA CNJ ---
  const formatProcessoCNJ = (value) => {
    if (!value) return '-';
    const v = value.toString().replace(/\D/g, '');
    if (v.length === 20) {
      return v.replace(/^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})/, "$1-$2.$3.$4.$5.$6");
    }
    return value;
  };

  // Formatar CPF/CNPJ
  const formatDocument = (doc) => {
    if (!doc) return '';
    const cleaned = doc.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
  };

  // Busca processos
  useEffect(() => {
    fetchProcessos();
  }, [pagination.currentPage, pagination.size, sorting.orderBy, sorting.direction]);

  const fetchProcessos = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        size: pagination.size,
        sort: `${sorting.orderBy},${sorting.direction}`,
        numero: filters.numero || null,
        status: filters.status || null,
        estado: filters.estado || null,
        advogadoId: filters.advogadoId ? String(filters.advogadoId) : null,
        partesIds: filters.partesIds && filters.partesIds.length > 0 ? filters.partesIds : null
      };

      const res = await api.get('/processos/list', { params });
      
      setProcessos(res.data.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.totalPages || 0,
        totalElements: res.data.totalElements || 0
      }));
    } catch (err) {
      console.error('Erro ao buscar processos:', err);
      alert('Erro ao carregar processos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar advogados
  const searchAdvogados = async (query) => {
    setAdvogadoSearch(query);
    
    if (query.length === 0) {
      setFilters({ ...filters, advogadoId: '' });
      setAdvogadoOptions([]);
      setShowAdvogadoOptions(false);
      return;
    }
    
    if (query.length > 2) {
      try {
        const res = await api.get(`/auth/advogados/select?q=${query}`);
        setAdvogadoOptions(res.data);
        setShowAdvogadoOptions(true);
      } catch (error) {
        console.error("Erro ao buscar advogados", error);
      }
    }
  };

  // Selecionar advogado
  const handleSelectAdvogado = (advogado) => {
    setAdvogadoSearch(`${advogado.nome} - OAB: ${advogado.numeroOAB || 'N/A'}`);
    setFilters({ ...filters, advogadoId: advogado.id });
    setShowAdvogadoOptions(false);
  };

  // Buscar partes
  const searchPartes = async (query) => {
    setParteSearch(query);
    
    if (query.length === 0) {
      setParteOptions([]);
      setShowParteOptions(false);
      return;
    }
    
    if (query.length > 2) {
      try {
        const res = await api.get(`/partes/search?q=${query}`);
        setParteOptions(res.data);
        setShowParteOptions(true);
      } catch (error) {
        console.error("Erro ao buscar partes", error);
      }
    }
  };

  // Adicionar parte selecionada
  const handleSelectParte = (parte) => {
    if (!selectedPartes.find(p => p.id === parte.id)) {
      const newSelectedPartes = [...selectedPartes, parte];
      setSelectedPartes(newSelectedPartes);
      setFilters({ 
        ...filters, 
        partesIds: newSelectedPartes.map(p => p.id) 
      });
    }
    setParteSearch('');
    setShowParteOptions(false);
  };

  // Remover parte selecionada
  const handleRemoveParte = (parteId) => {
    const newSelectedPartes = selectedPartes.filter(p => p.id !== parteId);
    setSelectedPartes(newSelectedPartes);
    setFilters({ 
      ...filters, 
      partesIds: newSelectedPartes.map(p => p.id) 
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchProcessos();
  };

  const handleClearFilters = () => {
    setFilters({
      numero: '',
      status: '',
      estado: '',
      advogadoId: '',
      partesIds: []
    });
    setAdvogadoSearch('');
    setParteSearch('');
    setSelectedPartes([]);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    // ✅ Reseta a tabela para estado inicial
    fetchProcessos();
  };

  const handleSort = (columnKey) => {
    setSorting(prev => ({
      orderBy: columnKey,
      direction: prev.orderBy === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Deseja deletar este processo?")) return;

    const processoParaDeletar = processos.find(p => p.id === id);
    const numeroProcesso = processoParaDeletar ? formatProcessoCNJ(processoParaDeletar.numero) : id;
    
    api.delete('/processos/' + id)
      .then(() => {
        alert(`Processo Nº ${numeroProcesso} deletado com sucesso!`);
        fetchProcessos();
      })
      .catch((err) => {
        console.error('Erro ao deletar:', err);
        alert('Erro ao deletar processo.');
      });
  };

  // COLUNAS
  const headers = [
    { key: 'numero', label: 'Nº Processo', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true },
    { key: 'advogadoResponsavelId', label: 'Advogado Principal', sortable: false },
    { key: 'acoes', label: 'Ações', sortable: false }
  ];

  // ✅ Renderizador de linhas - Botões no formato antigo
  const renderRow = (row) => (
    <tr key={row.id}>
      <td className="fw-semibold">{formatProcessoCNJ(row.numero)}</td>
      
      <td>
        <span className={`badge rounded-pill ${
          row.status === 'EM_ANDAMENTO' ? 'bg-primary' : 
          row.status === 'ARQUIVADO' ? 'bg-secondary' : 
          row.status === 'FINALIZADO' ? 'bg-success' : 'bg-info'
        }`}>
          {row.status?.replace(/_/g, ' ')}
        </span>
      </td>
      
      <td>
        <span className="badge bg-light text-dark border">{row.estado}</span>
      </td>
      
      <td className="text-truncate" style={{maxWidth: '200px'}} 
          title={row.advogadoResponsavelId?.nome || 'Não informado'}>
        <i className="bi bi-person-badge me-2 text-primary"></i>
        {row.advogadoResponsavelId?.nome || '-'}
      </td>
      
      <td>
        <Link 
          to={`/processos/read/${row.id}`} 
          className='btn btn-sm border-0 me-1' 
          style={{color: Colors.primaryDeep || '#2C2966'}} 
          title='Visualizar'
        >
          <i className="bi bi-eye-fill fs-5"></i>
        </Link>
        <Link 
          to={`/processos/update/${row.id}`} 
          className='btn btn-sm border-0 me-1' 
          style={{color: Colors.primaryDeep || '#2C2966'}} 
          title='Editar'
        >
          <i className="bi bi-pencil-fill fs-5"></i>
        </Link>
        <button 
          onClick={() => handleDelete(row.id)} 
          className='btn btn-sm text-danger border-0' 
          title='Deletar'
        >
          <i className="bi bi-trash3-fill fs-5"></i>
        </button>
      </td>
    </tr>
  );

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: Colors?.primaryDeep || '#2C2966' }}>
                Processos
              </h2>
              <p className="text-muted mb-0">
                Cadastre, edite e gerencie os processos do sistema.
              </p>
            </div>
            <Link 
              to="/processos/create" 
              className="btn shadow-sm"
              style={{
                backgroundColor: Colors?.primaryDeep || '#2C2966',
                color: '#fff',
                fontWeight: 'bold'
              }}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Cadastrar Processo
            </Link>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card shadow-sm border-0 mb-4">
        <div 
          className="card-header d-flex justify-content-between align-items-center" 
          style={{ 
            backgroundColor: Colors?.primaryDeep || '#2C2966',
            color: '#fff',
            cursor: 'pointer'
          }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <h6 className="mb-0 fw-bold">
            <i className="bi bi-funnel me-2"></i>
            Filtros de Busca
          </h6>
          <i className={`bi bi-chevron-${showFilters ? 'up' : 'down'}`}></i>
        </div>
        
        {showFilters && (
          <div className="card-body bg-light">
            <form onSubmit={handleFilterSubmit}>
              <div className="row g-3">
                {/* Nº Processo */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Nº Processo</label>
                  <input 
                    type="text"
                    className="form-control"
                    name="numero"
                    value={filters.numero}
                    onChange={handleFilterChange}
                    placeholder="Ex: 0000000-00.0000.0.00.0000"
                  />
                </div>

                {/* Status */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Status</label>
                  <select 
                    className="form-select"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="ARQUIVADO">Arquivado</option>
                    <option value="FINALIZADO">Finalizado</option>
                  </select>
                </div>

                {/* Estado */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Estado</label>
                  <select 
                    className="form-select"
                    name="estado"
                    value={filters.estado}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    {EstadosBrasileiros.map((estado) => (
                      <option key={estado.sigla} value={estado.sigla}>
                        {estado.sigla} - {estado.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Advogado Responsável */}
                <div className="col-md-6 position-relative">
                  <label className="form-label small fw-semibold">Advogado Responsável</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Busque por nome ou nº OAB"
                    onChange={(e) => searchAdvogados(e.target.value)}
                    value={advogadoSearch}
                    autoComplete="off"
                  />

                  {showAdvogadoOptions && advogadoOptions.length > 0 && (
                    <ul className="list-group position-absolute w-100 shadow-lg mt-1" 
                        style={{ zIndex: 1000, maxHeight: '250px', overflowY: 'auto' }}>
                      {advogadoOptions.map((adv) => (
                        <button 
                          key={adv.id} 
                          type="button"
                          className="list-group-item list-group-item-action text-start d-flex justify-content-between align-items-center"
                          onClick={() => handleSelectAdvogado(adv)}
                        >
                          <div>
                            <strong>{adv.nome}</strong>
                            <br />
                            <small className="text-muted">
                              OAB: {adv.numeroOAB || 'N/A'} | {adv.role}
                            </small>
                          </div>
                          <i className="bi bi-arrow-right-circle text-primary"></i>
                        </button>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Partes */}
                <div className="col-md-6 position-relative">
                  <label className="form-label small fw-semibold">Partes</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Busque por nome ou CPF/CNPJ"
                    onChange={(e) => searchPartes(e.target.value)}
                    value={parteSearch}
                    autoComplete="off"
                  />

                  {showParteOptions && parteOptions.length > 0 && (
                    <ul className="list-group position-absolute w-100 shadow-lg mt-1" 
                        style={{ zIndex: 1000, maxHeight: '250px', overflowY: 'auto' }}>
                      {parteOptions.map((parte) => (
                        <button 
                          key={parte.id} 
                          type="button"
                          className="list-group-item list-group-item-action text-start d-flex justify-content-between align-items-center"
                          onClick={() => handleSelectParte(parte)}
                        >
                          <div>
                            <strong>{parte.nome}</strong>
                            <br />
                            <small className="text-muted">
                              {formatDocument(parte.cpfCnpj)} | {parte.tipo}
                            </small>
                          </div>
                          <i className="bi bi-plus-circle text-success"></i>
                        </button>
                      ))}
                    </ul>
                  )}

                  {/* Partes Selecionadas */}
                  {selectedPartes.length > 0 && (
                    <div className="mt-2 d-flex flex-wrap gap-2">
                      {selectedPartes.map((parte) => (
                        <span key={parte.id} className="badge bg-primary d-flex align-items-center gap-2 py-2 px-3">
                          <span>{parte.nome}</span>
                          <button 
                            type="button"
                            className="btn-close btn-close-white"
                            style={{ fontSize: '0.6rem' }}
                            onClick={() => handleRemoveParte(parte.id)}
                            aria-label="Remover"
                          ></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-search me-2"></i>
                  Buscar
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={handleClearFilters}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Limpar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <Tabela 
            headers={headers}
            data={processos}
            renderRow={renderRow}
            loading={loading}
            pagination={{
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
              totalElements: pagination.totalElements,
              onPageChange: handlePageChange
            }}
            sorting={{
              orderBy: sorting.orderBy,
              direction: sorting.direction,
              onSort: handleSort
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Processos;