import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/API';
import { Colors } from '../../constants/Colors';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';

function Read() {
  const { id } = useParams();
  const [parte, setParte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/partes/${id}`)
      .then(res => { setParte(res.data); setLoading(false); })
      .catch(err => { console.error(err); setError('Erro ao carregar os dados da parte.'); setLoading(false); });
  }, [id]);

  const formatTelefone = (tel) => {
    if (!tel) return '-';
    const nums = tel.replace(/\D/g, '');
    if (nums.length === 11) return `(${nums.substring(0, 2)}) ${nums.substring(2, 7)}-${nums.substring(7)}`;
    if (nums.length === 10) return `(${nums.substring(0, 2)}) ${nums.substring(2, 6)}-${nums.substring(6)}`;
    return tel;
  };

  const formatDocumento = (value, tipo) => {
    if (!value) return '-';
    const nums = value.replace(/\D/g, '');
    if (tipo === 'JURIDICA' && nums.length === 14) {
      return `${nums.substring(0,2)}.${nums.substring(2,5)}.${nums.substring(5,8)}/${nums.substring(8,12)}-${nums.substring(12)}`;
    }
    if (nums.length === 11) {
      return `${nums.substring(0,3)}.${nums.substring(3,6)}.${nums.substring(6,9)}-${nums.substring(9)}`;
    }
    return value;
  };

  const formatCEP = (value) => {
    if (!value) return '-';
    const nums = value.replace(/\D/g, '');
    if (nums.length === 8) return `${nums.substring(0,5)}-${nums.substring(5)}`;
    return value;
  };

  const formatEstado = (sigla) => {
    if (!sigla) return '-';
    const estado = EstadosBrasileiros.find(e => e.sigla === sigla);
    return estado ? `${estado.sigla} - ${estado.nome}` : sigla;
  };

  const getTipoPessoaBadge = (tipo) => {
    if (tipo === 'FISICA') return { label: 'Pessoa Física', class: 'bg-primary' };
    if (tipo === 'JURIDICA') return { label: 'Pessoa Jurídica', class: 'bg-info text-dark' };
    return { label: tipo || '-', class: 'bg-secondary' };
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Carregando...</div>;
  if (error || !parte) return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="alert alert-danger">{error || 'Parte não encontrada'}</div>
      <Link to="/partes" className="btn btn-primary mt-2"><i className="bi bi-arrow-left me-1"></i>Voltar</Link>
    </div>
  );

  const tipoBadge = getTipoPessoaBadge(parte.tipoPessoa);

  return (
    <div className='container-fluid vh-100 overflow-hidden bg-light'>
      <div className='row h-100'>
        <div className='col-12 col-lg-8 mx-auto h-100 overflow-auto p-4'>

          {/* Cabeçalho */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: Colors.primaryDeep }}>
                {parte.nome}
              </h2>
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${tipoBadge.class}`}>{tipoBadge.label}</span>
                <span className="badge bg-secondary">
                  {parte.tipoPessoa === 'JURIDICA' ? 'CNPJ' : 'CPF'}: {formatDocumento(parte.documento, parte.tipoPessoa)}
                </span>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Link to="/partes" className='btn btn-outline-secondary btn-sm'>
                <i className="bi bi-arrow-left me-1"></i>Voltar
              </Link>
              <Link to={`/partes/update/${id}`} className='btn btn-sm text-white' style={{ backgroundColor: Colors.success }}>
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
                  <strong className="fs-6">{parte.nome}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Tipo de Pessoa</small>
                  <span className={`badge ${tipoBadge.class}`}>{tipoBadge.label}</span>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">{parte.tipoPessoa === 'JURIDICA' ? 'CNPJ' : 'CPF'}</small>
                  <strong>{formatDocumento(parte.documento, parte.tipoPessoa)}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Telefone</small>
                  <strong>{formatTelefone(parte.telefone)}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">E-mail</small>
                  <strong>{parte.email || '-'}</strong>
                </div>
                {parte.observacoes && (
                  <div className="col-12">
                    <small className="text-muted d-block">Observações</small>
                    <strong>{parte.observacoes}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold border-bottom pb-2 mb-3 text-secondary">
                <i className="bi bi-geo-alt-fill me-2"></i>Endereço
              </h5>
              <div className="row g-3">
                <div className="col-md-3">
                  <small className="text-muted d-block">CEP</small>
                  <strong>{formatCEP(parte.endereco?.cep)}</strong>
                </div>
                <div className="col-md-7">
                  <small className="text-muted d-block">Logradouro</small>
                  <strong>{parte.endereco?.logradouro || '-'}</strong>
                </div>
                <div className="col-md-2">
                  <small className="text-muted d-block">Número</small>
                  <strong>{parte.endereco?.numero || 'S/N'}</strong>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Bairro</small>
                  <strong>{parte.endereco?.bairro || '-'}</strong>
                </div>
                {parte.endereco?.complemento && (
                  <div className="col-md-4">
                    <small className="text-muted d-block">Complemento</small>
                    <strong>{parte.endereco.complemento}</strong>
                  </div>
                )}
                <div className="col-md-4">
                  <small className="text-muted d-block">Cidade</small>
                  <strong>{parte.endereco?.cidade || '-'}</strong>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Estado</small>
                  <strong>{formatEstado(parte.endereco?.estado)}</strong>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Read;