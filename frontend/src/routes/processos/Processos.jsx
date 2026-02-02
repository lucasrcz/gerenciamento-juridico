import { useEffect, useState } from 'react';
import { api } from '../../services/API';
import { Link } from 'react-router-dom';
import Search from './Search';
import Tabela from '../../layouts/Tabela';
import { Colors } from '../../constants/Colors';

function Processos() {
  const [processos, setProcessos] = useState([]);
  const [advogadosMap, setAdvogadosMap] = useState({});
  const [partesMap, setPartesMap] = useState({});
  
  const [loading, setLoading] = useState(true);
  
  const [query, setQuery] = useState({});
  const [pendingQuery, setPendingQuery] = useState({});
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [orderBy, setOrderBy] = useState('id');      
  const [direction, setDirection] = useState('desc'); 

  // --- MÁSCARA CNJ (Ex: 0000000-00.0000.0.00.0000) ---
  const formatProcessoCNJ = (value) => {
    if (!value) return '-';
    const v = value.toString().replace(/\D/g, '');
    if (v.length === 20) {
      return v.replace(/^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})/, "$1-$2.$3.$4.$5.$6");
    }
    return value;
  };

  // Carrega auxiliares
  useEffect(() => {
    const fetchProcessos = async () => {
      setLoading(true);
      try {
        
        // PREPARAÇÃO DOS DADOS (Adaptação para o Backend que espera String)
        const paramsBackend = {
          page: page,
          size: 10,
          sort: `${orderBy},${direction}`,
          
          // Filtros Simples
          numero: query.numero || null,
          status: query.status || null,
          estado: query.estado || null,
          
          // --- CORREÇÃO DE NOMES E TIPOS ---
          
          // 1. Backend espera "advogadoId" (String), não "advogadoPrincipalId"
          advogadoId: query.advogadoPrincipalId ? String(query.advogadoPrincipalId) : null,
          
          // 2. Backend espera Lista de Strings, convertemos o array de números
          advogadosIds: query.advogadosIds && query.advogadosIds.length > 0 
            ? query.advogadosIds.map(id => String(id)) 
            : null,
            
          // 3. Backend espera Lista de Longs (aqui mantemos números, pois o Java aceita Long)
          partesIds: query.partesIds && query.partesIds.length > 0
            ? query.partesIds
            : null
        };

        const res = await api.get('/processos/list', { params: paramsBackend });

        const data = res.data;
        setProcessos(data.content || data || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);

      } catch (err) {
        console.error('Erro ao buscar processos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProcessos();
  }, [query, page, orderBy, direction]);

  // Handlers
  const handleSort = (key) => {
    if (orderBy === key) setDirection(direction === 'asc' ? 'desc' : 'asc');
    else { setOrderBy(key); setDirection('asc'); }
    setPage(0);
  };
  const handlePageChange = (newPage) => setPage(newPage);
  const handleSearch = () => { setPage(0); setQuery(pendingQuery); };
  const handleClear = () => { setPendingQuery({}); setQuery({}); setPage(0); };
  const handleChange = (e) => { setPendingQuery({ ...pendingQuery, [e.target.name]: e.target.value }); };
  
  const handleDelete = (id) => {
    if(window.confirm("Deseja deletar este processo?")) {
      api.delete('/processos/' + id)
        .then(() => {
          setProcessos(processos.filter(p => p.id !== id));
          alert('Deletado com sucesso!');
        })
        .catch(() => alert('Erro ao deletar.'));
    }
  };

  const headers = [
    { label: "Nº Processo", key: "numero", sortable: true },
    { label: "Status", key: "status", sortable: true },
    { label: "Estado", key: "estado", sortable: true },
    { label: "Advogado Resp.", key: "advogadoPrincipalId", sortable: true }, 
    { label: "Próximo Prazo", key: "id", sortable: false }, 
    { label: "Partes", key: "id", sortable: false },
    { label: "Ações", key: "actions", sortable: false }
  ];

  // Renderizadores
  const getAdvogadoNome = (id) => advogadosMap[Number(id)]?.nome || '-';

  const renderRow = (row, index) => {
    // CHAVE ÚNICA DE SEGURANÇA: Combina ID + Índice para evitar erro de key duplicada
    const uniqueKey = row.id ? `${row.id}_${index}` : `temp_${index}`;

    return (
      <tr key={uniqueKey}>
        {/* Número do Processo: Preto e Formatado */}
        <td className="fw-bold" style={{color: '#000000'}}>
          {formatProcessoCNJ(row.numero)}
        </td>
        
        <td>
          <span className={`badge rounded-pill ${
            row.status === 'EM_ANDAMENTO' ? 'bg-primary' : 
            row.status === 'ARQUIVADO' ? 'bg-secondary' : 'bg-success'
          }`}>
            {row.status?.replace('_', ' ')}
          </span>
        </td>
        
        <td>{row.estado}</td>
        
        <td className="text-truncate" style={{maxWidth: '150px'}} title={getAdvogadoNome(row.advogadoPrincipalId)}>
          {getAdvogadoNome(row.advogadoPrincipalId)}
        </td>
        
        <td>
           {row.prazos && row.prazos.length > 0 ? (
              <span className="text-danger small fw-bold">
                 {new Date(row.prazos[0].dataVencimento).toLocaleDateString('pt-BR')}
              </span>
           ) : <span className="text-muted">-</span>}
        </td>
        
        <td style={{ minWidth: '200px' }}>
            {row.partesIds && row.partesIds.length > 0 ? (
              row.partesIds.map((id, idx) => (
                  <div key={`${uniqueKey}_p_${idx}`} className="mb-1 small d-flex align-items-center">
                      <i className="bi bi-person text-secondary me-1"></i>
                      <span className="text-truncate" style={{maxWidth:'130px'}}>
                          {partesMap[id]?.nomeCpf || 'Carregando...'}
                      </span>
                  </div>
              ))
            ) : <span className="text-muted">-</span>}
        </td>
        
        <td className="text-end">
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
  };

  return (
    <div className='d-flex flex-column bg-light min-vh-100 p-4'>
      
      {/* <Search
        handleChange={handleChange}
        handleSearch={handleSearch}
        handleClear={handleClear}
        values={pendingQuery}
      /> */}

      {/* CABEÇALHO DA TABELA E BOTÃO NOVO PROCESSO */}
      <div className="d-flex justify-content-between align-items-end mb-3 mt-5">
        
        {/* Título Estilo Limpo (Primary Deep) */}
        <h3 className="fw-bold mb-0" style={{ color: Colors.primaryDeep || '#2C2966' }}>
          Lista de Processos
        </h3>

        {/* Botão Novo Processo Sólido (Estilo Cadastro) */}
        <Link to="/processos/create" className='btn px-4 py-2 fw-bold shadow-sm' 
              style={{
                backgroundColor: Colors.primaryDeep || '#2C2966', 
                color: '#fff',
                borderRadius: '6px'
              }}>
          <i className="bi bi-plus-lg me-2"></i>Novo Processo
        </Link>
      </div>

      <div className='bg-white rounded shadow-sm p-0 overflow-hidden'>
        <Tabela 
          headers={headers}
          data={processos}
          renderRow={renderRow}
          loading={loading}
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalElements: totalElements,
            onPageChange: handlePageChange
          }}
          sorting={{
            orderBy: orderBy,
            direction: direction,
            onSort: handleSort
          }}
        />
      </div>
    </div>
  )
}

export default Processos;