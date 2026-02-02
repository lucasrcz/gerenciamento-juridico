import { useEffect, useState } from 'react';
import { api } from '../../services/API';
import { Link } from 'react-router-dom';
import Tabela from '../../layouts/Tabela';
import { Colors } from '../../constants/Colors';

function Advogados() {
  const [advogados, setAdvogados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
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
      'ADMIN': <span className="badge bg-danger">ADMIN</span>,
      'USER': <span className="badge bg-primary">USER</span>
    };
    return badges[role] || <span className="badge bg-secondary">{role}</span>;
  };

  // Definição das colunas da tabela
  const headers = [
    { key: 'nome', label: 'Nome', sortable: true },
    { key: 'email', label: 'E-mail', sortable: true },
    { key: 'numeroOAB', label: 'Número OAB', sortable: false },
    { key: 'role', label: 'Tipo', sortable: true },
    { key: 'acoes', label: 'Ações', sortable: false }
  ];

  // Renderização de cada linha
  const renderRow = (advogado) => (
    <tr key={advogado.id}>
      <td className="fw-semibold">{advogado.nome}</td>
      <td className="text-muted">{advogado.email}</td>
      <td>
        <span className="badge bg-light text-dark border">
          {formatOAB(advogado.numeroOAB, advogado.seccional)}
        </span>
      </td>
      <td>{getRoleBadge(advogado.role)}</td>
      <td>
        <div className="btn-group btn-group-sm">
          <Link 
            to={`/advogados/read/${advogado.id}`} 
            className="btn btn-outline-primary"
            title="Visualizar"
          >
            <i className="bi bi-eye-fill"></i>
          </Link>
          <Link 
            to={`/advogados/update/${advogado.id}`} 
            className="btn btn-outline-success"
            title="Editar"
          >
            <i className="bi bi-pencil-fill"></i>
          </Link>
          <button 
            onClick={() => handleDelete(advogado.id)} 
            className="btn btn-outline-danger"
            title="Desativar"
          >
            <i className="bi bi-trash3-fill"></i>
          </button>
        </div>
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
                Cadastre, edite e gerencie os advogados do sistema
              </p>
            </div>
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
                  <input 
                    type="text"
                    className="form-control"
                    name="seccional"
                    value={filters.seccional}
                    onChange={handleFilterChange}
                    placeholder="Ex: SP, RJ..."
                    maxLength={2}
                  />
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
            data={advogados}
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

export default Advogados;
