import { useEffect, useState } from 'react';
import { Colors } from '../constants/Colors';

function RelatorioProcessosPDF() {
  const [processos, setProcessos] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // ✅ Pequeno delay para garantir que sessionStorage foi escrito
    const timer = setTimeout(() => {
      const relatorioDataString = sessionStorage.getItem('relatorioProcessos') || 
                                   localStorage.getItem('relatorioData');
      
      console.log('📊 Dados do relatório encontrados:', relatorioDataString);
      
      if (!relatorioDataString) {
        console.error('❌ Nenhum dado de relatório encontrado');
        setError(true);
        setLoading(false);
        return;
      }
      
      try {
        const relatorioData = JSON.parse(relatorioDataString);
        console.log('✅ Dados parseados:', relatorioData);
        console.log('✅ Processos:', relatorioData.processos);
        console.log('✅ Filtros:', relatorioData.filters);
        
        setProcessos(relatorioData.processos || []);
        setFilters(relatorioData.filters || {});
        
        // ✅ Limpa AMBOS os storages após carregar
        sessionStorage.removeItem('relatorioProcessos');
        localStorage.removeItem('relatorioData');
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Erro ao carregar dados do relatório:', error);
        setError(true);
        setLoading(false);
      }
    }, 100); // ✅ Delay de 100ms

    return () => clearTimeout(timer);
  }, []);

  const formatProcessoCNJ = (value) => {
    if (!value) return '-';
    const v = value.toString().replace(/\D/g, '');
    if (v.length === 20) {
      return v.replace(/^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})/, "$1-$2.$3.$4.$5.$6");
    }
    return value;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const traduzirStatus = (status) => {
    const map = {
      'EM_ANDAMENTO': 'Em Andamento',
      'ARQUIVADO': 'Arquivado',
      'FINALIZADO': 'Finalizado'
    };
    return map[status] || status;
  };

  const getFiltrosAplicados = () => {
    const filtros = [];
    if (filters.numero) filtros.push(`Nº Processo: ${filters.numero}`);
    if (filters.status) filtros.push(`Status: ${traduzirStatus(filters.status)}`);
    if (filters.estado) filtros.push(`Estado: ${filters.estado}`);
    return filtros;
  };

  const handlePrint = () => {
    window.print();
  };

  // ✅ Tela de Loading
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border" style={{ color: Colors.primaryDark, width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3 text-muted">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  // ✅ Tela de Erro
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '4rem' }}></i>
          <h3 className="mt-3 text-muted">Nenhum dado de relatório encontrado</h3>
          <p className="text-muted">Por favor, retorne à página de processos e tente novamente.</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => window.close()}
          >
            Fechar esta aba
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Botão de Imprimir (visível apenas na tela) */}
      <div className="no-print mb-5 d-flex gap-2 mt-4 justify-content-center">
        <button 
          onClick={handlePrint}
          className="btn btn-lg text-black fw-bold"
          style={{ backgroundColor: '#f1f1f1' }}
        >
          <i className="bi bi-printer me-2"></i>
          Imprimir | Salvar PDF
        </button>
      </div>

      {/* Conteúdo do Relatório (para impressão) */}
      <div className="print-content">
        {/* Cabeçalho */}
        <div className="text-center mb-4 pb-3 border-bottom">
          <h2 className="fw-bold" style={{ color: Colors.primaryDark }}>
            Relatório de Processos
          </h2>
          <p className="text-muted mb-1">
            Data de Emissão: {new Date().toLocaleString('pt-BR')}
          </p>
          <p className="text-muted mb-0">
            Total de Registros: <strong>{processos.length}</strong>
          </p>
        </div>

        {/* Filtros Aplicados */}
        {getFiltrosAplicados().length > 0 && (
          <div className="mb-4 p-3 bg-light border rounded">
            <h6 className="fw-bold mb-2 ms-2" style={{ color: Colors.primaryDark }}>
              Filtros Aplicados:
            </h6>
            <ul className="mb-0 small">
              {getFiltrosAplicados().map((filtro, idx) => (
                <li key={idx}>{filtro}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tabela de Processos */}
        <table className="table table-bordered table-sm">
          <thead>
            <tr >
              <th className="ps-2" style={{ width: '20%' }}>Nº Processo</th>
              <th style={{ width: '12%', textAlign: 'center'}}>Status</th>
              <th style={{ width: '8%', textAlign: 'center' }}>Estado</th>
              <th style={{ width: '25%', textAlign: 'center' }}>Advogado Principal</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Próximo Prazo</th>
            </tr>
          </thead>
          <tbody>
            {processos.length > 0 ? (
              processos.map((processo) => (
                <tr key={processo.id}>
                  <td className="ps-2 fw-semibold small">{formatProcessoCNJ(processo.numero)}</td>
                  <td className="text-center small">{traduzirStatus(processo.status)}</td>
                  <td className="text-center small">{processo.estado || '-'}</td>
                  <td className="text-center small">{processo.advogadoResponsavelId?.nome || '-'}</td>
                  <td className="text-center small">
                    {processo.proximoPrazo 
                      ? formatDate(processo.proximoPrazo.dataVencimento) 
                      : '-'
                    }
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  Nenhum processo encontrado com os filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Rodapé */}
        <div className="mt-4 pt-3 border-top text-center small text-muted">
          <p className="mb-0">
            Sistema de Gerenciamento Jurídico - {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Estilos de Impressão */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          .print-content,
          .print-content * {
            visibility: visible;
          }
          
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          
          .no-print {
            display: none !important;
          }

          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }

          @page {
            size: A4 landscape;
            margin: 1cm;
          }
        }

        @media screen {
          .print-content {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
        }
      `}</style>
    </div>
  );
}

export default RelatorioProcessosPDF;