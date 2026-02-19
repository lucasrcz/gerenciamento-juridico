import { useEffect, useState } from 'react'
import { api, getLogin } from '../../services/API';
import { Link, useParams } from 'react-router-dom';
import { Colors } from '../../constants/Colors';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';

function Read() {
  const [advogado, setAdvogado] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const currentUser = getLogin();
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    setLoading(true);
    api.get('/auth/advogados/' + id)
      .then(res => { setAdvogado(res.data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }, [id]);

  const formatCPF = (cpf) => {
    if (!cpf) return '-';
    const nums = cpf.replace(/\D/g, '');
    if (nums.length !== 11) return cpf;
    return `${nums.substring(0, 3)}.${nums.substring(3, 6)}.${nums.substring(6, 9)}-${nums.substring(9, 11)}`;
  };

  const formatTelefone = (tel) => {
    if (!tel) return '-';
    const nums = tel.replace(/\D/g, '');
    if (nums.length === 11) return `(${nums.substring(0, 2)}) ${nums.substring(2, 7)}-${nums.substring(7)}`;
    if (nums.length === 10) return `(${nums.substring(0, 2)}) ${nums.substring(2, 6)}-${nums.substring(6)}`;
    return tel;
  };

  const formatOAB = (numero, seccional) => {
    if (!numero) return '-';
    return seccional ? `${numero}/${seccional}` : numero;
  };

  const formatSeccional = (sigla) => {
    if (!sigla) return '-';
    const estado = EstadosBrasileiros.find(e => e.sigla === sigla);
    return estado ? `${estado.sigla} - ${estado.nome}` : sigla;
  };

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') return { label: 'Administrador', class: 'bg-danger' };
    return { label: 'Usuário', class: 'bg-primary' };
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Carregando...</div>;
  if (!advogado) return <div className="p-5 text-center text-danger">Advogado não encontrado</div>;

  const roleBadge = getRoleBadge(advogado.role);

  return (
    <div className='container-fluid vh-100 overflow-hidden bg-light'>
      <div className='row h-100'>
        <div className='col-12 col-lg-8 mx-auto h-100 overflow-auto p-4'>

          {/* Cabeçalho */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: Colors.primaryDeep }}>
                {advogado.nome}
              </h2>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary">OAB {formatOAB(advogado.numeroOAB, advogado.seccional)}</span>
                {isAdmin && <span className={`badge ${roleBadge.class}`}>{roleBadge.label}</span>}
                {advogado.ativo === false && <span className="badge bg-secondary">Inativo</span>}
              </div>
            </div>
            <div className="d-flex gap-2">
              <Link to="/advogados" className='btn btn-outline-secondary btn-sm'>
                <i className="bi bi-arrow-left me-1"></i>Voltar
              </Link>
              <Link to={`/advogados/update/${id}`} className='btn btn-sm text-white' style={{ backgroundColor: Colors.success }}>
                <i className="bi bi-pencil-square me-1"></i>Editar
              </Link>
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold border-bottom pb-2 mb-3 text-secondary">
                <i className="bi bi-person-fill me-2"></i>Dados Pessoais
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <small className="text-muted d-block">Nome Completo</small>
                  <strong className="fs-6">{advogado.nome}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">CPF</small>
                  <strong>{formatCPF(advogado.cpf)}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Telefone</small>
                  <strong>{formatTelefone(advogado.telefone)}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">E-mail</small>
                  <strong>{advogado.email || '-'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Dados Profissionais */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold border-bottom pb-2 mb-3 text-secondary">
                <i className="bi bi-briefcase-fill me-2"></i>Dados Profissionais
              </h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <small className="text-muted d-block">Número OAB</small>
                  <strong className="fs-5">{advogado.numeroOAB || '-'}</strong>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Seccional</small>
                  <strong>{formatSeccional(advogado.seccional)}</strong>
                </div>
                {isAdmin && (
                  <div className="col-md-4">
                    <small className="text-muted d-block">Permissão</small>
                    <span className={`badge ${roleBadge.class}`}>{roleBadge.label}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Read