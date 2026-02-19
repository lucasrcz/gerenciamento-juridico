import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/API';
import './Dashboard.css';

const getStorageKey = () => {
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const parsed = JSON.parse(userData);
      const userId = parsed.login || parsed.cpf || parsed.id || '';
      if (userId) return `juris_todo_tasks_${userId}`;
    }
  } catch { /* ignore */ }
  return 'juris_todo_tasks';
};

const loadTasks = () => {
  try {
    const stored = localStorage.getItem(getStorageKey());
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTasks = (tasks) => {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(tasks));
  } catch { /* ignore quota errors */ }
};

const TodoList = () => {
  const [inputValue, setInputValue] = useState('');
  const MAX_CHARS = 100;
  const MAX_TASKS = 10;

  const [tasks, setTasks] = useState(loadTasks);

  // Persiste no localStorage sempre que as tarefas mudarem
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value.slice(0, MAX_CHARS));
  };

  const handleAddTask = useCallback(() => {
    if (inputValue.trim() === '') return;
    if (tasks.length >= MAX_TASKS) return;

    const newTask = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
    };

    setTasks((prev) => [...prev, newTask]);
    setInputValue('');
  }, [inputValue, tasks.length]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const navigate = useNavigate();

  // --- Gráfico de Pizza: Status dos Processos ---
  const [statusData, setStatusData] = useState({ EM_ANDAMENTO: 0, ARQUIVADO: 0, FINALIZADO: 0 });
  const [loadingChart, setLoadingChart] = useState(true);

  // --- Contadores ---
  const [totalAdvogados, setTotalAdvogados] = useState(0);
  const [partesCount, setPartesCount] = useState({ fisica: 0, juridica: 0, total: 0 });

  // --- Prazos ---
  const [prazos, setPrazos] = useState([]);
  const [loadingPrazos, setLoadingPrazos] = useState(true);
  const [modalStatus, setModalStatus] = useState(null); // status selecionado para o modal
  const [filtroVencimentos, setFiltroVencimentos] = useState('todos'); // 'todos' | '30' | '15'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingChart(true);
        setLoadingPrazos(true);
        const [resProcessos, resPrazos, resAdvogados, resPartesFisica, resPartesJuridica] = await Promise.all([
          api.get('/processos/list', { params: { size: 9999 } }),
          api.get('/prazos/list'),
          api.get('/auth/advogados', { params: { size: 1 } }),
          api.get('/partes/filtro', { params: { tipoPessoa: 'FISICA', size: 1 } }),
          api.get('/partes/filtro', { params: { tipoPessoa: 'JURIDICA', size: 1 } }),
        ]);

        // Status dos processos
        const processos = resProcessos.data.content || [];
        const counts = { EM_ANDAMENTO: 0, ARQUIVADO: 0, FINALIZADO: 0 };
        processos.forEach((p) => {
          if (counts.hasOwnProperty(p.status)) {
            counts[p.status]++;
          }
        });
        setStatusData(counts);

        // Advogados
        const totalAdv = resAdvogados.data?.totalElements || 0;
        setTotalAdvogados(totalAdv);

        // Partes
        const pf = resPartesFisica.data?.totalElements || 0;
        const pj = resPartesJuridica.data?.totalElements || 0;
        setPartesCount({ fisica: pf, juridica: pj, total: pf + pj });

        // Prazos
        setPrazos(resPrazos.data || []);
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
      } finally {
        setLoadingChart(false);
        setLoadingPrazos(false);
      }
    };
    fetchData();
  }, []);

  // Classificação dos prazos
  const getStatusPrazo = (diasFimPrazo) => {
    if (diasFimPrazo == null) return 'VENCIDO';
    if (diasFimPrazo < 0) return 'VENCIDO';
    if (diasFimPrazo <= 3) return 'URGENTE';
    if (diasFimPrazo <= 7) return 'ATENCAO';
    return 'NO_PRAZO';
  };

  const statusConfig = {
    URGENTE:  { label: 'Urgente',  icon: 'bi-exclamation-triangle-fill', color: '#c24c58', bgLight: '#fdf0f1' },
    ATENCAO:  { label: 'Atenção',  icon: 'bi-exclamation-circle-fill',  color: '#FFA051', bgLight: '#fff7f0' },
    NO_PRAZO: { label: 'No Prazo', icon: 'bi-check-circle-fill',     color: '#42976f',  bgLight: '#f0faf5' },
  };

  // Agrupamento por status
  const prazosByStatus = useMemo(() => {
    const groups = { URGENTE: [], ATENCAO: [], NO_PRAZO: [] };
    prazos.forEach((p) => {
      const st = getStatusPrazo(p.diasFimPrazo);
      if (groups[st]) {
        groups[st].push(p);
      }
    });
    // Ordena cada grupo por data de vencimento (mais próximo primeiro)
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento));
    });
    return groups;
  }, [prazos]);

  // Prazos do modal
  const modalPrazos = modalStatus ? prazosByStatus[modalStatus] || [] : [];

  // Formatação
  const formatNumeroProcesso = (numero) => {
    if (!numero) return '-';
    const nums = numero.replace(/\D/g, '');
    if (nums.length !== 20) return numero;
    return `${nums.substring(0, 7)}-${nums.substring(7, 9)}.${nums.substring(9, 13)}.${nums.substring(13, 14)}.${nums.substring(14, 16)}.${nums.substring(16, 20)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
  };

  const formatDiasRestantes = (dias) => {
    if (dias == null) return '';
    if (dias < 0) return `Vencido há ${Math.abs(dias)} dia(s)`;
    if (dias === 0) return 'Vence hoje';
    return `${dias} dia(s) restante(s)`;
  };

  // Gráfico de pizza
  const total = statusData.EM_ANDAMENTO + statusData.ARQUIVADO + statusData.FINALIZADO;

  const pieSlices = [
    { label: 'Em Andamento', value: statusData.EM_ANDAMENTO, color: '#FFA051' },
    { label: 'Arquivado',    value: statusData.ARQUIVADO,     color: '#6C6C94' },
    { label: 'Finalizado',   value: statusData.FINALIZADO,    color: '#42976f' },
  ];

  const buildPieArcs = (slices, total) => {
    if (total === 0) return [];
    const arcs = [];
    let cumulative = 0;
    slices.forEach((slice) => {
      const fraction = slice.value / total;
      const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      cumulative += fraction;
      const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      const largeArc = fraction > 0.5 ? 1 : 0;
      const x1 = Math.cos(startAngle);
      const y1 = Math.sin(startAngle);
      const x2 = Math.cos(endAngle);
      const y2 = Math.sin(endAngle);
      if (fraction >= 1) {
        arcs.push({ ...slice, d: `M 0 -1 A 1 1 0 1 1 0 1 A 1 1 0 1 1 0 -1 Z`, fraction });
      } else if (fraction > 0) {
        arcs.push({ ...slice, d: `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`, fraction });
      }
    });
    return arcs;
  };

  const arcs = buildPieArcs(pieSlices, total);

  return (
    <>
      {/* Layout principal: 3 colunas */}
      <div className="dashboard-grid">
        {/* Coluna Esquerda - Lista de Tarefas */}
        <div className="todo-container">
          <div className="todo-header">
            <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <path d="M9 14h6"></path>
              <path d="M9 10h6"></path>
              <path d="M9 18h6"></path>
            </svg>
            <h2>Lista de Tarefas</h2>
            <span className="todo-counter">{tasks.length}/{MAX_TASKS}</span>
          </div>

          <div className="input-wrapper">
            <div className="input-group">
              <input
                type="text"
                className="todo-input"
                placeholder="Adicionar nova tarefa..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <button className="add-btn" onClick={handleAddTask} disabled={tasks.length >= MAX_TASKS}>
                ADICIONAR
              </button>
            </div>
          </div>

          <ul className="todo-list">
            {tasks.length === 0 && (
              <li className="todo-empty">Nenhuma tarefa adicionada.</li>
            )}
            {tasks.map((task) => (
              <li key={task.id} className={`todo-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-content" onClick={() => toggleTask(task.id)}>
                  <div className={`checkbox ${task.completed ? 'checked' : ''}`}>
                    {task.completed && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <span className="task-text">{task.text}</span>
                </div>
                <button className="delete-btn" title="Excluir" onClick={() => deleteTask(task.id)} aria-label="Deletar tarefa">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna Central - Painel de Prazos (principal) */}
        <div className="prazos-panel">
          <div className="prazos-panel-header">
            <i className="bi bi-calendar-event-fill prazos-header-icon"></i>
            <h2>Prazos Processuais</h2>
          </div>

          {loadingPrazos ? (
            <div className="chart-loading">
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Carregando prazos...
            </div>
          ) : prazos.length === 0 ? (
            <div className="chart-empty">Nenhum prazo cadastrado.</div>
          ) : (
            <div className="prazos-status-grid">
              {Object.entries(statusConfig).map(([key, config]) => {
                const count = prazosByStatus[key].length;
                return (
                  <div
                    key={key}
                    className="prazo-status-card"
                    style={{ '--hover-bg': config.bgLight }}
                    onClick={() => count > 0 && setModalStatus(key)}
                    role={count > 0 ? 'button' : undefined}
                    tabIndex={count > 0 ? 0 : undefined}
                  >
                    <div className="prazo-status-card-top">
                      <i className={`bi ${config.icon}`} style={{ color: config.color, fontSize: '1.5rem' }}></i>
                      <span className="prazo-status-count" style={{ color: config.color }}>{count}</span>
                    </div>
                    <span className="prazo-status-label">{config.label}</span>
                    {count > 0 && <span className="prazo-status-hint">Clique para ver</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Resumo dos próximos prazos */}
          {!loadingPrazos && prazos.length > 0 && (
            <div className="prazos-proximos">
              <div className="prazos-proximos-header">
                <h3 className="prazos-proximos-title">Próximos Vencimentos</h3>
                <div className="prazos-filtro">
                  <button
                    className={`prazos-filtro-btn ${filtroVencimentos === '15' ? 'active' : ''}`}
                    onClick={() => setFiltroVencimentos('15')}
                  >15 dias</button>
                  <button
                    className={`prazos-filtro-btn ${filtroVencimentos === '30' ? 'active' : ''}`}
                    onClick={() => setFiltroVencimentos('30')}
                  >30 dias</button>
                  <button
                    className={`prazos-filtro-btn ${filtroVencimentos === 'todos' ? 'active' : ''}`}
                    onClick={() => setFiltroVencimentos('todos')}
                  >Todos</button>
                </div>
              </div>
              <div className="prazos-proximos-list">
                {prazos
                  .filter((p) => {
                    if (p.diasFimPrazo == null || p.diasFimPrazo < 0) return false;
                    if (filtroVencimentos === '15') return p.diasFimPrazo <= 15;
                    if (filtroVencimentos === '30') return p.diasFimPrazo <= 30;
                    return true;
                  })
                  .sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento))
                  .map((p) => {
                    const st = getStatusPrazo(p.diasFimPrazo);
                    const cfg = statusConfig[st];
                    return (
                      <div key={p.id} className="prazo-proximo-item" onClick={() => navigate(`/processos/read/${p.idProcesso}`)}>
                        <div className="prazo-proximo-indicator" style={{ backgroundColor: cfg.color }}></div>
                        <div className="prazo-proximo-info">
                          <span className="prazo-proximo-numero">{formatNumeroProcesso(p.numeroProcesso)}</span>
                          <span className="prazo-proximo-desc">{p.descricao}</span>
                        </div>
                        <div className="prazo-proximo-date">
                          <span className="prazo-proximo-venc">{formatDate(p.dataVencimento)}</span>
                          <span className="prazo-proximo-dias" style={{ color: cfg.color }}>{formatDiasRestantes(p.diasFimPrazo)}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita */}
        <div className="right-column">
          {/* Gráfico de Pizza */}
          <div className="chart-container">
            <div className="chart-header">
              <i className="bi bi-pie-chart-fill chart-header-icon"></i>
              <h2>Status dos Processos</h2>
            </div>
            {loadingChart ? (
              <div className="chart-loading">
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Carregando...
              </div>
            ) : total === 0 ? (
              <div className="chart-empty">Nenhum processo cadastrado.</div>
            ) : (
              <div className="chart-content">
                <svg className="pie-svg" viewBox="-1.1 -1.1 2.2 2.2">
                  {arcs.map((arc, i) => (
                    <path key={i} d={arc.d} fill={arc.color} stroke="#fff" strokeWidth="0.02" />
                  ))}
                </svg>
                <div className="chart-legend">
                  {pieSlices.map((s, i) => (
                    <div key={i} className="legend-item">
                      <span className="legend-dot" style={{ backgroundColor: s.color }}></span>
                      <span className="legend-label">{s.label}</span>
                      <span className="legend-value">{s.value} <span className="legend-pct">({total > 0 ? Math.round((s.value / total) * 100) : 0}%)</span></span>
                    </div>
                  ))}
                  <div className="legend-total">Total: {total}</div>
                </div>
              </div>
            )}
            <button className="quick-action-btn chart-new-processo-btn " onClick={() => navigate('/processos/create')}>
              <i className="bi bi-folder-plus"></i>
              Novo Processo
            </button>
          </div>

          {/* Card Advogados */}
          <div className="info-card">
            <div className="info-card-header">
              <i className="bi bi-person-badge info-card-icon"></i>
              <h3>Advogados</h3>
            </div>
            <div className="info-card-body">
              <div className="info-card-stat">
                <span className="info-card-stat-value">{totalAdvogados}</span>
                <span className="info-card-stat-label">Total cadastrado(s)</span>
              </div>
            </div>
            <button className="quick-action-btn info-card-btn" onClick={() => navigate('/advogados/create')}>
              <i className="bi bi-person-badge"></i>
              Novo Advogado
            </button>
          </div>

          {/* Card Partes */}
          <div className="info-card">
            <div className="info-card-header">
              <i className="bi bi-people info-card-icon"></i>
              <h3>Partes</h3>
            </div>
            <div className="info-card-body">
              <div className="info-card-stats-row">
                <div className="info-card-stat">
                  <span className="info-card-stat-value">{partesCount.fisica}</span>
                  <span className="info-card-stat-label">Pessoa Física</span>
                </div>
                <div className="info-card-stat">
                  <span className="info-card-stat-value">{partesCount.juridica}</span>
                  <span className="info-card-stat-label">Pessoa Jurídica</span>
                </div>
                <div className="info-card-stat info-card-stat-total">
                  <span className="info-card-stat-value">{partesCount.total}</span>
                  <span className="info-card-stat-label">Total</span>
                </div>
              </div>
            </div>
            <button className="quick-action-btn info-card-btn" onClick={() => navigate('/partes/create')}>
              <i className="bi bi-people"></i>
              Nova Parte
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Prazos por Status */}
      {modalStatus && (
        <div className="prazos-modal-overlay" onClick={() => setModalStatus(null)}>
          <div className="prazos-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prazos-modal-header" style={{ borderBottomColor: statusConfig[modalStatus].color }}>
              <div className="prazos-modal-title">
                <i className={`bi ${statusConfig[modalStatus].icon}`} style={{ color: statusConfig[modalStatus].color, fontSize: '1.4rem' }}></i>
                <h3>Prazos — {statusConfig[modalStatus].label}</h3>
                <span className="prazos-modal-badge" style={{ backgroundColor: statusConfig[modalStatus].color }}>
                  {modalPrazos.length}
                </span>
              </div>
              <button className="prazos-modal-close" onClick={() => setModalStatus(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="prazos-modal-body">
              {modalPrazos.length === 0 ? (
                <div className="chart-empty">Nenhum prazo nesta categoria.</div>
              ) : (
                <ul className="prazos-modal-list">
                  {modalPrazos.map((p) => (
                    <li key={p.id} className="prazos-modal-item">
                      <div className="prazos-modal-item-indicator" style={{ backgroundColor: statusConfig[modalStatus].color }}></div>
                      <div className="prazos-modal-item-content">
                        <span className="prazos-modal-item-numero">{formatNumeroProcesso(p.numeroProcesso)}</span>
                        <span className="prazos-modal-item-desc">{p.descricao}</span>
                        <div className="prazos-modal-item-meta">
                          <span className="prazos-modal-item-date">
                            <i className="bi bi-calendar3"></i> {formatDate(p.dataVencimento)}
                          </span>
                          <span className="prazos-modal-item-dias" style={{ color: statusConfig[modalStatus].color }}>
                            {formatDiasRestantes(p.diasFimPrazo)}
                          </span>
                        </div>
                      </div>
                      <button
                        className="prazos-modal-item-btn"
                        onClick={() => navigate(`/processos/read/${p.idProcesso}`)}
                        title="Ver processo detalhado"
                      >
                        <i className="bi bi-eye-fill"></i>
                        Ver Processo
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TodoList;