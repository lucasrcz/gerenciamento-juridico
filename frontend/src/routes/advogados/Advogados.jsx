import { useEffect, useState } from 'react';
import { api, getLogin } from '../../services/API';
import { Link } from 'react-router-dom';
import Tabela from '../../layouts/Tabela';
import { Colors } from '../../constants/Colors';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';
import '../../constants/Colors.css';

function Advogados() {
  const [advogados, setAdvogados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const currentUser = getLogin();
  const isAdmin = currentUser?.role === 'ADMIN';
  
  // Filtros
  const [filters, setFilters] = useState({
    nome: '',
    email: '',
    numeroOAB: '',
    seccional: '',
    role: '',
    ativo: true
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

  // Busca os dados de Advogados da API
  useEffect(() => {
    fetchAdvogados();
  }, [pagination.currentPage, pagination.size, sorting.orderBy, sorting.direction]);

  const fetchAdvogados = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        size: pagination.size,
        sort: `${sorting.orderBy},${sorting.direction}`,
        nome: filters.nome || null,
        email: filters.email || null,
        numeroOAB: filters.numeroOAB || null,
        seccional: filters.seccional || null,
        role: filters.role || null,
        ativo: filters.ativo
      };

      const res = await api.get('/auth/advogados', { params });
      
      setAdvogados(res.data.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.totalPages || 0,
        totalElements: res.data.totalElements || 0
      }));
    } catch (err) {
      console.error('Erro ao buscar advogados:', err);
      alert('Erro ao carregar advogados');
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
    fetchAdvogados();
  };

  const handleClearFilters = () => {
    setFilters({
      nome: '',
      email: '',
      numeroOAB: '',
      seccional: '',
      role: '',
      ativo: true
    });
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    
    setTimeout(() => {
      const params = {
        page: 0,
        size: pagination.size,
        sort: `${sorting.orderBy},${sorting.direction}`,
        ativo: true
      };
      
      api.get('/auth/advogados', { params })
        .then(res => {
          setAdvogados(res.data.content || []);
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

  const handleSizeChange = (newSize) => {
    setPagination(prev => ({ ...prev, size: newSize, currentPage: 0 }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja desativar este advogado?')) return;
    
    try {
      await api.delete(`/auth/advogados/${id}`);
      alert('Advogado desativado com sucesso!');
      fetchAdvogados();
    } catch (err) {
      console.error('Erro ao desativar:', err);
      alert('Erro ao desativar advogado');
    }
  };

  const formatOAB = (numeroOAB, seccional) => {
    if (!numeroOAB) return '-';
    return seccional ? `${numeroOAB}/${seccional}` : numeroOAB;
  };

  const getRoleBadge = (role) => {
    const badges = {
      'ADMIN': <span className="badge rounded-pill bg-danger">ADMIN</span>,
      'USER': <span className="badge rounded-pill bg-primary">USER</span>
    };
    return badges[role] || <span className="badge rounded-pill bg-secondary">{role}</span>;
  };

  const getStatusBadge = (ativo) => {
    return ativo 
      ? <span className="badge rounded-pill bg-success">Ativo</span>
      : <span className="badge rounded-pill bg-secondary">Inativo</span>;
  };

  // Definição das colunas da tabela
  const headers = [
    { key: 'nome', label: 'Nome', sortable: true },
    { key: 'email', label: 'E-mail', sortable: true },
    { key: 'numeroOAB', label: 'OAB', sortable: false },
    { key: 'role', label: 'Tipo', sortable: true },
    ...(isAdmin ? [{ key: 'ativo', label: 'Status', sortable: true }] : []),
    { key: 'acoes', label: 'Ações', sortable: false }
  ];

  const renderRow = (advogado) => (
    <tr key={advogado.id}>
      <td className="fw-semibold" style={{ paddingLeft: '20px' }}>{advogado.nome}</td>
      <td className="text-center text-muted">{advogado.email}</td>
      <td className="text-center">
        <span className="badge bg-light text-dark border">
          {formatOAB(advogado.numeroOAB, advogado.seccional)}
        </span>
      </td>
      <td className="text-center">{getRoleBadge(advogado.role)}</td>
      {isAdmin && <td className="text-center">{getStatusBadge(advogado.ativo)}</td>}
      <td className="text-center">
        <Link 
          to={`/advogados/read/${advogado.id}`} 
          className='btn btn-sm border-0 me-1' 
          style={{color: Colors.primaryDeep || '#2C2966'}} 
          title='Visualizar'
        >
          <i className="bi bi-eye-fill fs-6"></i>
        </Link>
        <Link 
          to={`/advogados/update/${advogado.id}`} 
          className='btn btn-sm border-0 me-1' 
          style={{color: Colors.primaryDeep || '#2C2966'}} 
          title='Editar'
        >
          <i className="bi bi-pencil-fill fs-6"></i>
        </Link>
        {isAdmin && (
          <button 
            onClick={() => handleDelete(advogado.id)} 
            className='btn btn-sm border-0'
            style={{color: Colors.danger || '#c24c58'}}
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
                Advogados
              </h2>
              <p className="text-muted mb-0">
                Cadastre, edite e gerencie os advogados do sistema.
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link 
                to="/advogados/create" 
                className="btn shadow-sm"
                style={{
                  backgroundColor: Colors?.primaryDeep || '#2C2966',
                  color: '#fff',
                  fontWeight: 'bold'
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Cadastrar Advogado
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
                  <label className="form-label small fw-semibold">Número OAB</label>
                  <input 
                    type="text"
                    className="form-control"
                    name="numeroOAB"
                    value={filters.numeroOAB}
                    onChange={handleFilterChange}
                    placeholder="Digite o número OAB..."
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Seccional (UF)</label>
                  <select 
                    className="form-select"
                    name="seccional"
                    value={filters.seccional}
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
                  <label className="form-label small fw-semibold">Tipo</label>
                  <select 
                    className="form-select"
                    name="role"
                    value={filters.role}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                  </select>
                </div>

                {isAdmin && (
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Status</label>
                    <select 
                      className="form-select"
                      name="ativo"
                      value={filters.ativo}
                      onChange={handleFilterChange}
                    >
                      <option value={true}>Ativo</option>
                      <option value={false}>Inativo</option>
                    </select>
                  </div>
                )}
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
            data={advogados}
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

export default Advogados;