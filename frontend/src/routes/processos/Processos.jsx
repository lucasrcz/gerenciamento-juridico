import { useEffect, useState, useRef } from 'react';
import { api, getLogin } from '../../services/API';
import { Link } from 'react-router-dom';
import Tabela from '../../layouts/Tabela';
import { Colors } from '../../constants/Colors';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';
import '../../constants/Colors.css';

function Processos() {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const currentUser = getLogin();
  const isAdmin = currentUser?.role === 'ADMIN';
  
  // Filtros
  const [filters, setFilters] = useState({
    numero: '',
    status: '',
    estado: '',
    advogadoId: '',
    parteId: ''
  });

  // Estados para Advogado Responsável
  const [advogadoSearch, setAdvogadoSearch] = useState('');
  const [advogadoOptions, setAdvogadoOptions] = useState([]);
  const [showAdvogadoOptions, setShowAdvogadoOptions] = useState(false);
  const advogadoDropdownRef = useRef(null);

  // Estados para Partes (SIMPLIFICADO)
  const [parteSearch, setParteSearch] = useState('');
  const [parteOptions, setParteOptions] = useState([]);
  const [showParteOptions, setShowParteOptions] = useState(false);
  const parteDropdownRef = useRef(null);

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

  // ✅ Detectar cliques fora dos dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (advogadoDropdownRef.current && !advogadoDropdownRef.current.contains(event.target)) {
        setShowAdvogadoOptions(false);
      }
      if (parteDropdownRef.current && !parteDropdownRef.current.contains(event.target)) {
        setShowParteOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // ✅ Formatar Data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // ✅ Formatar Estado (Sigla + Nome Completo)
  const formatEstado = (sigla) => {
    if (!sigla) return '-';
    const estado = EstadosBrasileiros.find(e => e.sigla === sigla);
    return estado ? `${sigla} - ${estado.nome}` : sigla;
  };

  // ✅ Badge de Status do Prazo
  const getStatusBadgePrazo = (diasRestantes) => {
    if (diasRestantes === null || diasRestantes === undefined) return null;
    
    if (diasRestantes < 0) {
      return <span className="badge bg-danger">Vencido</span>;
    } else if (diasRestantes === 0) {
      return <span className="badge bg-warning text-dark">Vence Hoje</span>;
    } else if (diasRestantes <= 3) {
      return <span className="badge bg-warning text-dark">Urgente</span>;
    } else if (diasRestantes <= 7) {
      return <span className="badge bg-info text-dark">Próximo</span>;
    } else {
      return <span className="badge bg-success">No Prazo</span>;
    }
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
        sort: `${sorting.orderBy},${sorting.direction}`
      };

      if (filters.numero && filters.numero.trim() !== '') {
        params.numero = filters.numero.trim();
      }
      if (filters.status && filters.status !== '') {
        params.status = filters.status;
      }
      if (filters.estado && filters.estado !== '') {
        params.estado = filters.estado;
      }
      if (filters.advogadoId && filters.advogadoId !== '') {
        params.advogadoId = String(filters.advogadoId);
      }

      if (filters.parteId && filters.parteId !== '') {
        params.partesIds = [filters.parteId];
      }

      console.log('📡 Parâmetros enviados:', params);

      const res = await api.get('/processos/list', { params });
      
      console.log('✅ Processos recebidos:', res.data);
      
      setProcessos(res.data.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.totalPages || 0,
        totalElements: res.data.totalElements || 0
      }));
    } catch (err) {
      console.error('❌ Erro ao buscar processos:', err);
      alert('Erro ao carregar processos');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Buscar advogados - CORRIGIDO
  const searchAdvogados = async (query) => {
    setAdvogadoSearch(query);
    
    if (query.length === 0) {
      setFilters({ ...filters, advogadoId: '' });
      setAdvogadoOptions([]);
      setShowAdvogadoOptions(false);
      return;
    }
    
    // ✅ Busca a partir de 1 caractere
    if (query.length >= 1) {
      try {
        const encodedQuery = encodeURIComponent(query);
        const res = await api.get(`/auth/advogados/select?q=${encodedQuery}`);
        console.log('✅ Advogados retornados COMPLETO:', res.data);
        
        // ✅ CORREÇÃO: Tratar array corretamente
        let advogados = [];
        if (Array.isArray(res.data)) {
          advogados = res.data;
        } else if (res.data && Array.isArray(res.data.content)) {
          advogados = res.data.content;
        }
        
        console.log('✅ Advogados processados:', advogados);
        setAdvogadoOptions(advogados);
        setShowAdvogadoOptions(advogados.length > 0);
      } catch (error) {
        console.error("Erro ao buscar advogados", error);
        setAdvogadoOptions([]);
        setShowAdvogadoOptions(false);
      }
    }
  };

  const handleSelectAdvogado = (advogado) => {
    const displayText = `${advogado.nome}`;
    setAdvogadoSearch(displayText);
    setFilters({ ...filters, advogadoId: advogado.id });
    setShowAdvogadoOptions(false);
  };

  // ✅ Buscar partes - CORRIGIDO
  const searchPartes = async (query) => {
    setParteSearch(query);
    
    if (query.length === 0) {
      setFilters({ ...filters, parteId: '' });
      setParteOptions([]);
      setShowParteOptions(false);
      return;
    }
    
    // ✅ Busca a partir de 1 caractere
    if (query.length >= 1) {
      try {
        const encodedQuery = encodeURIComponent(query);
        const res = await api.get(`/partes/select?q=${encodedQuery}`);
        console.log('✅ Partes retornadas COMPLETO:', res.data);
        
        // ✅ CORREÇÃO: Tratar array corretamente
        let partes = [];
        if (Array.isArray(res.data)) {
          partes = res.data;
        } else if (res.data && Array.isArray(res.data.content)) {
          partes = res.data.content;
        }
        
        console.log('✅ Partes processadas:', partes);
        setParteOptions(partes);
        setShowParteOptions(partes.length > 0);
      } catch (error) {
        console.error("Erro ao buscar partes", error);
        setParteOptions([]);
        setShowParteOptions(false);
      }
    }
  };

  // ✅ Selecionar parte - SIMPLIFICADO (igual ao advogado)
  const handleSelectParte = (parte) => {
    console.log('✅ Parte selecionada:', parte);
    const displayText = parte.nomeCpf || parte.nome || 'Sem nome';
    setParteSearch(displayText);
    setFilters({ ...filters, parteId: parte.id });
    setShowParteOptions(false);
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
      parteId: ''
    });
    setAdvogadoSearch('');
    setParteSearch('');
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    
    setTimeout(() => {
      const params = {
        page: 0,
        size: pagination.size,
        sort: `${sorting.orderBy},${sorting.direction}`
      };
      
      api.get('/processos/list', { params })
        .then(res => {
          setProcessos(res.data.content || []);
          setPagination(prev => ({
            ...prev,
            currentPage: 0,
            totalPages: res.data.totalPages || 0,
            totalElements: res.data.totalElements || 0
          }));
        })
        .catch(err => console.error('Erro ao limpar filtros:', err));
    }, 0);
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

  // ✅ Nova função para mudar o tamanho da página
  const handleSizeChange = (newSize) => {
    setPagination(prev => ({ ...prev, size: newSize, currentPage: 0 }));
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

  const headers = [
    { key: 'numero', label: 'Nº Processo', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true },
    { key: 'advogadoResponsavel', label: 'Advogado Principal', sortable: true },
    { key: 'proximoPrazo', label: 'Próximo Prazo', sortable: true },
    { key: 'acoes', label: 'Ações', sortable: false }
  ];

  const renderRow = (row) => (
    <tr key={row.id}>
      <td className="fw-semibold" style={{ paddingLeft: '20px' }}>{formatProcessoCNJ(row.numero)}</td>
      
      <td className="text-center">
        <span className={`badge rounded-pill ${
          row.status === 'EM_ANDAMENTO' ? 'bg-primary' : 
          row.status === 'ARQUIVADO' ? 'bg-secondary' : 
          row.status === 'FINALIZADO' ? 'bg-success' : 'bg-info'
        }`}>
          {row.status?.replace(/_/g, ' ')}
        </span>
      </td>
      
      <td className="text-center">
        <span>
          {formatEstado(row.estado)}
        </span>
      </td>
      
      <td className="text-center text-truncate" style={{maxWidth: '200px'}} 
          title={row.advogadoResponsavelId?.nome || 'Não informado'}>
        {row.advogadoResponsavelId?.nome || '-'}
      </td>
      
      <td className="text-center">
        {row.proximoPrazo ? (
          <div className="d-flex flex-column align-items-center">
            <small className="text-muted fw-bold">
              {formatDate(row.proximoPrazo.dataVencimento)}
            </small>
            <div className="mt-1">
              {getStatusBadgePrazo(row.proximoPrazo.diasRestantes)}
            </div>
          </div>
        ) : (
          <span className="text-muted small">Sem prazos</span>
        )}
      </td>
      
      <td className="text-center">
        <Link 
          to={`/processos/read/${row.id}`} 
          className='btn btn-sm border-0 me-1' 
          style={{color: Colors.primaryDeep || '#2C2966'}} 
          title='Visualizar'
        >
          <i className="bi bi-eye-fill fs-6"></i>
        </Link>
        <Link 
          to={`/processos/update/${row.id}`} 
          className='btn btn-sm border-0 me-1' 
          style={{color: Colors.primaryDeep || '#2C2966'}} 
          title='Editar'
        >
          <i className="bi bi-pencil-fill fs-6"></i>
        </Link>
        {isAdmin && (
          <button 
            onClick={() => handleDelete(row.id)} 
            className='btn btn-sm border-0'
            style={{color: Colors.danger || '#c24c58'}}
            title='Deletar'
          >
            <i className="bi bi-trash3-fill fs-6"></i>
          </button>
        )}
      </td>
    </tr>
  );

  const handleGerarRelatorio = () => {
    // ✅ Armazena os dados no sessionStorage (mais confiável para novas abas)
    const relatorioData = {
      processos: processos,
      filters: filters,
      timestamp: new Date().getTime()
    };
    
    // ✅ Usar sessionStorage em vez de localStorage
    sessionStorage.setItem('relatorioProcessos', JSON.stringify(relatorioData));
    
    // Abre nova aba com a rota do relatório
    window.open('/processos/relatorio', '_blank');
  };

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
            <div className="d-flex gap-2">
              {/* Botão Gerar Relatório */}
              <button
                onClick={handleGerarRelatorio}
                className="btn shadow-sm"
                style={{
                  backgroundColor: Colors?.accent || '#FFA051',
                  color: Colors?.primaryDeep || '#1a1761',
                  fontWeight: 'bold'
                }}
                disabled={processos.length === 0}
                title={processos.length === 0 ? 'Nenhum processo para gerar relatório' : ''}
              >
                <i className="bi bi-file-earmark-pdf me-2"></i>
                Gerar Relatório
              </button>

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
                <div className="col-md-6 position-relative" ref={advogadoDropdownRef}>
                  <label className="form-label small fw-semibold">Advogado Responsável</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Busque por nome ou nº OAB"
                    onChange={(e) => searchAdvogados(e.target.value)}
                    onFocus={() => advogadoOptions.length > 0 && setShowAdvogadoOptions(true)}
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
                          className="list-group-item list-group-item-action text-start"
                          onClick={() => handleSelectAdvogado(adv)}
                        >
                          <span className='fw-semibold'>{adv.nome}</span>
                        </button>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Parte */}
                <div className="col-md-6 position-relative" ref={parteDropdownRef}>
                  <label className="form-label small fw-semibold">Parte</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Busque por nome ou CPF/CNPJ"
                    onChange={(e) => searchPartes(e.target.value)}
                    onFocus={() => parteOptions.length > 0 && setShowParteOptions(true)}
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
                          className="list-group-item list-group-item-action text-start"
                          onClick={() => handleSelectParte(parte)}
                        >
                          <span className='fw-semibold'>{parte.nomeCpf || parte.nome || 'Sem nome'}</span>
                        </button>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn-filtrar-limpar">
                  <i className="bi bi-search me-2"></i>
                  Filtrar
                </button>
                <button 
                  type="button" 
                  className="btn-filtrar-limpar"
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
              size: pagination.size,
              onPageChange: handlePageChange,
              onSizeChange: handleSizeChange
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