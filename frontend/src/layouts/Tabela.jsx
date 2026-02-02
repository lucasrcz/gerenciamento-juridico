import React from 'react';
import { Colors } from '../constants/Colors'; // Importe suas cores se necessário

function Tabela({ 
  headers,       
  data,          
  renderRow,     
  pagination,    
  sorting,       
  loading        
}) {

  // Estilos visuais exatos do seu pedido
  const styles = {
    headerRow: { 
      backgroundColor: '#2C2966', // Primary Deep
      color: '#fff', 
    },
    headerCell: {
      backgroundColor: 'inherit', 
      color: 'inherit',
      cursor: 'pointer', 
      userSelect: 'none',
      border: 'none',
      padding: '12px 16px',
      verticalAlign: 'middle'
    },
    // Botão de paginação inativo (outline)
    pageBtn: { 
      color: '#2C2966', 
      borderColor: '#2C2966',
      backgroundColor: '#fff',
      fontWeight: 'bold',
      minWidth: '35px'
    },
    // Botão de paginação ativo (sólido, igual ao "Cadastrar Processo")
    activePageBtn: { 
      backgroundColor: '#2C2966', 
      borderColor: '#2C2966', 
      color: '#fff',
      fontWeight: 'bold',
      minWidth: '35px'
    }
  };

  const getSortIcon = (columnKey) => {
    if (sorting.orderBy !== columnKey) return <i className="bi bi-arrow-down-up ms-2 opacity-50" style={{fontSize: '0.7rem'}}></i>;
    if (sorting.direction === 'asc') return <i className="bi bi-sort-alpha-down ms-2 text-warning"></i>;
    return <i className="bi bi-sort-alpha-down-alt ms-2 text-warning"></i>;
  };

  if (loading) {
    return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
  }

  if (!data || data.length === 0) {
    return <div className="alert alert-light text-center p-4 border text-muted">Nenhum registro encontrado.</div>;
  }

  return (
    <div className="d-flex flex-column h-100">
      <div className="table-responsive shadow-sm rounded border-0">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr style={styles.headerRow}>
              {headers.map((col, index) => (
                <th 
                  key={index} 
                  className="fw-normal text-uppercase small"
                  style={styles.headerCell}
                  onClick={() => col.sortable && sorting.onSort(col.key)}
                >
                  <div className="d-flex align-items-center justify-content-between">
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

      {/* PAGINAÇÃO ESTILO "CADASTRO" */}
      {pagination && pagination.totalPages > 0 && (
        <div className="d-flex justify-content-end align-items-center mt-3 gap-2">
          <small className="text-muted me-3">
            Total: <strong>{pagination.totalElements}</strong>
          </small>
          
          <nav>
            <ul className="pagination mb-0 gap-1">
              <li className={`page-item ${pagination.currentPage === 0 ? 'disabled' : ''}`}>
                <button 
                  className="page-link rounded"
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  style={styles.pageBtn}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>

              {[...Array(pagination.totalPages)].map((_, i) => {
                 // Lógica para esconder páginas intermediárias se houver muitas
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

              <li className={`page-item ${pagination.currentPage >= pagination.totalPages - 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link rounded"
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  style={styles.pageBtn}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

export default Tabela;