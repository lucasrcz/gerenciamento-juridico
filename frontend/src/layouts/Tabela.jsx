import React from 'react';
import { Colors } from '../constants/Colors';

function Tabela({ 
  headers,       
  data,          
  renderRow,     
  pagination,    
  sorting,       
  loading        
}) {

  const styles = {
    headerRow: { 
      backgroundColor: '#2C2966',
      color: '#fff'
    },
    headerCell: {
      backgroundColor: 'inherit', 
      color: 'inherit',
      cursor: 'pointer', 
      userSelect: 'none',
      border: 'none',
      padding: '12px 16px',
      verticalAlign: 'middle',
    },
    pageBtn: { 
      color: '#2C2966', 
      borderColor: '#cbcbd3',
      backgroundColor: '#fff',
      fontWeight: 'bold',
      fontSize: '12px',
      minWidth: '35px'
    },
    activePageBtn: { 
      backgroundColor: '#2C2966', 
      borderColor: '#2C2966', 
      color: '#fff',
      fontWeight: 'bold',
      fontSize: '12px',
      minWidth: '35px'
    }
  };

  const getSortIcon = (columnKey) => {
    if (sorting.orderBy !== columnKey) return <i className="bi bi-arrow-down-up ms-2 opacity-50"></i>;
    if (sorting.direction === 'asc') return <i className="bi bi-sort-alpha-down ms-2 text-warning"></i>;
    return <i className="bi bi-sort-alpha-down-alt ms-2 text-warning"></i>;
  };

  // ✅ Calcular registros exibidos
  const getShowingInfo = () => {
    if (!pagination || pagination.totalElements === 0) return null;
    
    const start = (pagination.currentPage * pagination.size) + 1;
    const end = Math.min((pagination.currentPage + 1) * pagination.size, pagination.totalElements);
    
    return { start, end, total: pagination.totalElements };
  };

  if (loading) {
    return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
  }

  if (!data || data.length === 0) {
    return <div className="alert alert-light text-center p-4 border text-muted">Nenhum registro encontrado.</div>;
  }

  const showingInfo = getShowingInfo();

  return (
    <div className="d-flex flex-column h-100">
      {/* ✅ Controle de resultados por página */}
      <div className="d-flex justify-content-end align-items-center px-3 py-2 bg-light border-bottom">
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">Exibir</small>
          <select 
            className="form-select form-select-sm" 
            style={{ width: '70px' }}
            value={pagination?.size || 10}
            onChange={(e) => pagination?.onSizeChange && pagination.onSizeChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <small className="text-muted">resultados por página</small>
        </div>
      </div>

      <div className="table-responsive shadow-sm rounded border-0">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr style={styles.headerRow}>
              {headers.map((col, index) => (
                <th 
                  key={index} 
                  className="fw-bold small"
                  style={{
                    ...styles.headerCell,
                    textAlign: index === 0 ? 'left' : 'center',
                    paddingLeft: index === 0 ? '20px' : '16px'
                  }}
                  onClick={() => col.sortable && sorting.onSort(col.key)}
                >
                  <div className="d-flex align-items-center" style={{ 
                    justifyContent: index === 0 ? 'flex-start' : 'center' 
                  }}>
                    <span>{col.label}</span>
                    {col.sortable && getSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
      </div>

      {/* ✅ Rodapé: Mostrando registros + Paginação */}
      {pagination && pagination.totalPages > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3 px-3 pb-2">
          {/* Lado esquerdo: Mostrando X até Y de Z registros */}
          <div>
            {showingInfo && (
              <small className="text-muted">
                Mostrando de <strong>{showingInfo.start}</strong> até <strong>{showingInfo.end}</strong> de <strong>{showingInfo.total}</strong> registros
              </small>
            )}
          </div>

          {/* Lado direito: Paginação */}
          <div className="d-flex align-items-center gap-2">
            <nav>
              <ul className="pagination mb-0 gap-1">
                {/* Primeiro */}
                <li className={`page-item ${pagination.currentPage === 0 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link rounded small"
                    onClick={() => pagination.onPageChange(0)}
                    style={styles.pageBtn}
                    title="Primeiro"
                  >
                    Primeiro
                  </button>
                </li>

                {/* Anterior */}
                <li className={`page-item ${pagination.currentPage === 0 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link rounded"
                    onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                    style={styles.pageBtn}
                    title="Anterior"
                  >
                    Anterior
                  </button>
                </li>

                {/* Páginas numéricas */}
                {[...Array(pagination.totalPages)].map((_, i) => {
                  if (
                    i === 0 || 
                    i === pagination.totalPages - 1 || 
                    (i >= pagination.currentPage - 1 && i <= pagination.currentPage + 1)
                  ) {
                    return (
                      <li key={i} className="page-item">
                        <button 
                          className="page-link rounded shadow-sm"
                          onClick={() => pagination.onPageChange(i)}
                          style={pagination.currentPage === i ? styles.activePageBtn : styles.pageBtn}
                        >
                          {i + 1}
                        </button>
                      </li>
                    );
                  }
                  if (i === 1 || i === pagination.totalPages - 2) {
                    return <li key={i} className="page-item disabled"><span className="page-link border-0 bg-transparent">...</span></li>;
                  }
                  return null;
                })}

                {/* Próximo */}
                <li className={`page-item ${pagination.currentPage >= pagination.totalPages - 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link rounded"
                    onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                    style={styles.pageBtn}
                    title="Próximo"
                  >
                    Próximo
                  </button>
                </li>

                {/* Último */}
                <li className={`page-item ${pagination.currentPage >= pagination.totalPages - 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link rounded"
                    onClick={() => pagination.onPageChange(pagination.totalPages - 1)}
                    style={styles.pageBtn}
                    title="Último"
                  >
                    Último
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tabela;