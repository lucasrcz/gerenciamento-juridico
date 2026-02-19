import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, getLogin } from '../../services/API'
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros'
import { Colors } from '../../constants/Colors'

function Update() {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = getLogin();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [advogado, setAdvogado] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    role: 'USER',
    numeroOAB: '',
    seccional: ''
  });

  useEffect(() => { 
    setLoading(true);
    api.get('/auth/advogados/' + id)
      .then(res => { setAdvogado(res.data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }, [id]);

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatTelefone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return numbers
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'telefone') {
      formattedValue = formatTelefone(value);
    } else if (name === 'numeroOAB') {
      formattedValue = value.replace(/\D/g, '');
    }

    setAdvogado({
      ...advogado,
      [name]: formattedValue
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (isAdmin && novaSenha) {
      if (novaSenha !== confirmarNovaSenha) {
        alert('As senhas não coincidem');
        return;
      }
      if (novaSenha.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres');
        return;
      }
    }

    try {
      setSaving(true);
      const dataToSend = {
        nome: advogado.nome,
        email: advogado.email,
        seccional: advogado.seccional,
        numeroOAB: advogado.numeroOAB,
        role: isAdmin ? advogado.role : undefined,
        senha: (isAdmin && novaSenha) ? novaSenha : undefined,
        login: advogado.cpf.replace(/\D/g, ''),
        cpf: advogado.cpf.replace(/\D/g, ''),
        telefone: advogado.telefone.replace(/\D/g, '')
      };

      await api.put('/auth/' + id, dataToSend);
      alert('Advogado atualizado com sucesso!');
      navigate('/advogados/read/' + id);
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data && err.response.data.errors) {
         console.log("Erros de validação:", err.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Carregando...</div>;

  return (
    <div className='container-fluid vh-100 overflow-hidden bg-light'>
      <div className='row h-100'>
        <div className='col-12 col-lg-8 mx-auto h-100 overflow-auto p-4'>

          {/* Cabeçalho */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: Colors.primaryDeep }}>
                Editar Advogado
              </h2>
              <span className="badge bg-warning text-dark">Modo Edição</span>
            </div>
            <div className="d-flex gap-2">
              <Link to={`/advogados/read/${id}`} className='btn btn-outline-secondary btn-sm'>
                <i className="bi bi-x-circle me-1"></i>Cancelar
              </Link>
            </div>
          </div>

          <form onSubmit={handleUpdate}>
            {/* Dados Pessoais */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold border-bottom pb-2 mb-3 text-secondary">
                  <i className="bi bi-person-fill me-2"></i>Dados Pessoais
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="nome" className="form-label"><strong>Nome Completo</strong></label>
                    <input type="text" id="nome" name="nome" className="form-control" minLength="1" maxLength="150"
                      value={advogado.nome}
                      onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="cpf" className="form-label"><strong>CPF</strong></label>
                    <input type="text" id="cpf" name="cpf" className="form-control" maxLength="14"
                      value={advogado.cpf}
                      onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="telefone" className="form-label"><strong>Telefone</strong></label>
                    <input type="text" id="telefone" name="telefone" className="form-control" maxLength="15"
                      value={advogado.telefone}
                      onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <label htmlFor="email" className="form-label"><strong>E-mail</strong></label>
                    <input type="email" id="email" name="email" className="form-control" maxLength="150"
                      value={advogado.email}
                      onChange={handleChange} required />
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
                    <label htmlFor="numeroOAB" className="form-label"><strong>Número OAB</strong></label>
                    <input type="text" id="numeroOAB" name="numeroOAB" className="form-control" maxLength="6"
                      value={advogado.numeroOAB}
                      onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="seccional" className="form-label"><strong>Seccional</strong></label>
                    <select id="seccional" name="seccional" className="form-select"
                      value={advogado.seccional}
                      onChange={handleChange} required>
                      {EstadosBrasileiros.map((seccional) => (
                        <option key={seccional.sigla} value={seccional.sigla}>
                          {seccional.sigla} - {seccional.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isAdmin && (
                    <div className="col-md-4">
                      <label htmlFor="role" className="form-label"><strong>Permissão</strong></label>
                      <select id="role" name='role' className='form-select'
                        value={advogado.role}
                        onChange={handleChange} required>
                        <option value="USER">Usuário</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alterar Senha (apenas Admin) */}
            {isAdmin && (
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                  <h5 className="card-title fw-bold border-bottom pb-2 mb-3 text-secondary">
                    <i className="bi bi-shield-lock-fill me-2"></i>Alterar Senha
                  </h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label"><strong>Nova Senha</strong></label>
                      <input
                        type="password"
                        className="form-control"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        placeholder="Digite a nova senha"
                        minLength="6"
                        maxLength="30"
                      />
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Deixe em branco para manter a senha atual
                      </small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label"><strong>Confirmar Nova Senha</strong></label>
                      <input
                        type="password"
                        className="form-control"
                        value={confirmarNovaSenha}
                        onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                        placeholder="Confirme a nova senha"
                        minLength="6"
                        maxLength="30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="d-flex justify-content-end gap-2">
              <Link to={`/advogados/read/${id}`} className='btn btn-outline-secondary'>
                <i className="bi bi-x-circle me-2"></i>Cancelar
              </Link>
              <button type="submit" className='btn text-white' style={{ backgroundColor: Colors.success }} disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default Update;