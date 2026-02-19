import { useEffect, useState } from 'react';
import { api, getLogin } from '../../services/API';
import { Link } from 'react-router-dom';
import Tabela from '../../layouts/Tabela';
import { Colors } from '../../constants/Colors';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';
import '../../constants/Colors.css';

function Partes() {
  const [partes, setPartes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const currentUser = getLogin();
  const isAdmin = currentUser?.role === 'ADMIN';
  
  // Filtros
  const [filters, setFilters] = useState({
    nome: '',
    email: '',
    estado: '',
    tipoPessoa: '',
    documento: ''
  });

  // Paginação
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10
  });

  // Ordenação
  const [sorting, setSorting] = useState({
    orderBy: 'nome',
    direction: 'asc'
  });

  // Formatar Estado (Sigla + Nome Completo)
  const formatEstado = (sigla) => {
    if (!sigla) return '-';
    const estado = EstadosBrasileiros.find(e => e.sigla === sigla);
    return estado ? `${sigla} - ${estado.nome}` : sigla;
  };

  // Formatar CPF/CNPJ
  const formatDocument = (doc) => {
    if (!doc) return '-';
    const cleaned = doc.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
  };

  // Busca partes
  useEffect(() => {
    fetchPartes();
  }, [pagination.currentPage, pagination.size, sorting.orderBy, sorting.direction]);

  const fetchPartes = async () => {
    try {
      setLoading(true);
      
      // ✅ Construir params para o endpoint /partes/filtro
      const params = {
        page: pagination.currentPage,
        size: pagination.size,
        sort: `${sorting.orderBy},${sorting.direction}`
      };

      // Adicionar apenas filtros preenchidos
      if (filters.nome) params.nome = filters.nome;
      if (filters.email) params.email = filters.email;
      if (filters.estado) params.estado = filters.estado;
      if (filters.tipoPessoa) params.tipoPessoa = filters.tipoPessoa;
      if (filters.documento) params.documento = filters.documento;

      // ✅ Endpoint correto: /partes/filtro
      const res = await api.get('/partes/filtro', { params });
      
      setPartes(res.data.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.totalPages || 0,
        totalElements: res.data.totalElements || 0
      }));
    } catch (err) {
      console.error('Erro ao buscar partes:', err);
      alert('Erro ao carregar partes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchPartes();
  };

  const handleClearFilters = () => {
    setFilters({
      nome: '',
      email: '',
      estado: '',
      tipoPessoa: '',
      documento: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    
    setTimeout(() => {
      fetchPartes();
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

  const handleSizeChange = (newSize) => {
    setPagination(prev => ({ ...prev, size: newSize, currentPage: 0 }));
  };

  const handleDelete = async (id, tipoPessoa) => {
    const confirmMsg = tipoPessoa === "FISICA" 
      ? "Tem certeza que deseja desativar a pessoa física?" 
      : "Tem certeza que deseja desativar a pessoa jurídica?";
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/partes/${id}`);
      alert('Parte desativada com sucesso!');
      fetchPartes();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      alert('Erro ao desativar parte');
    }
  };

  // Definição das colunas da tabela
  const headers = [
    { key: 'nome', label: 'Nome', sortable: true },
    { key: 'email', label: 'E-mail', sortable: true },
    { key: 'documento', label: 'CPF/CNPJ', sortable: false },
    { key: 'tipoPessoa', label: 'Tipo', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true },
    { key: 'acoes', label: 'Ações', sortable: false }
  ];

  // Renderização de cada linha
  const renderRow = (parte) => (
    <tr key={parte.id}>
      <td className="fw-semibold" style={{ paddingLeft: '20px' }}>{parte.nome}</td>
      <td className="text-center text-muted">{parte.email || '-'}</td>
      <td className="text-center text-muted">{formatDocument(parte.documento)}</td>
      <td className="text-center">
        <span className="badge rounded-pill text-white" style={{ backgroundColor: parte.tipoPessoa === 'FISICA' ? '#1a4d80' : 'darkred' }}>
          {parte.tipoPessoa === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'}
        </span>
      </td>
      <td className="text-center">
        <span>
          {parte.endereco?.estado ? formatEstado(parte.endereco.estado) : '-'}
        </span>
      </td>
      <td className="text-center">
        <Link 
          to={`/partes/read/${parte.id}`} 
          className='btn btn-sm border-0 me-1' 
          style={{color: Colors.primaryDeep || '#2C2966'}} 
          title='Visualizar'
        >
          <i className="bi bi-eye-fill fs-6"></i>
        </Link>
        <Link 
          to={`/partes/update/${parte.id}`} 
          className='btn btn-sm border-0 me-1' 
          style={{color: Colors.primaryDeep || '#2C2966'}} 
          title='Editar'
        >
          <i className="bi bi-pencil-fill fs-6"></i>
        </Link>
        {isAdmin && (
          <button 
            onClick={() => handleDelete(parte.id, parte.tipoPessoa)} 
            className='btn btn-sm border-0'
            style={{color: Colors.danger || '#c24c58' }}
            title='Desativar'
          >
            <i className="bi bi-trash3-fill fs-6"></i>
          </button>
        )}
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
                Partes
              </h2>
              <p className="text-muted mb-0">
                Cadastre, edite e gerencie as partes do sistema.
              </p>
            </div>
            <Link 
              to="/partes/create" 
              className="btn shadow-sm"
              style={{
                backgroundColor: Colors?.primaryDeep || '#2C2966',
                color: '#fff',
                fontWeight: 'bold'
              }}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Cadastrar Parte
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
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Nome</label>
                  <input 
                    type="text"
                    className="form-control"
                    name="nome"
                    value={filters.nome}
                    onChange={handleFilterChange}
                    placeholder="Digite o nome..."
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">E-mail</label>
                  <input 
                    type="text"
                    className="form-control"
                    name="email"
                    value={filters.email}
                    onChange={handleFilterChange}
                    placeholder="Digite o e-mail..."
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">CPF/CNPJ</label>
                  <input 
                    type="text"
                    className="form-control"
                    name="documento"
                    value={filters.documento}
                    onChange={handleFilterChange}
                    placeholder="Digite o CPF ou CNPJ..."
                  />
                </div>

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

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Tipo de Pessoa</label>
                  <select 
                    className="form-select"
                    name="tipoPessoa"
                    value={filters.tipoPessoa}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="FISICA">Pessoa Física</option>
                    <option value="JURIDICA">Pessoa Jurídica</option>
                  </select>
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
            data={partes}
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

export default Partes;