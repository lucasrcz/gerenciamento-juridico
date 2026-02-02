import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/API';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';
import { Colors, headerStyle, actionBtnStyle } from '../../constants/Colors';

function Create() {
  const [advogado, setAdvogado] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    role: '',
    numeroOAB: '',
    seccional: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Função auxiliar para estilo de inputs preenchidos
  const getInputStyle = (value) => 
    (value && value.toString().trim() !== '') 
      ? { backgroundColor: '#eef6ff', color: '#000' } 
      : {};

  // Função para formatar CPF
  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // Função para formatar telefone
  const formatTelefone = (value) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 10) {
      // Formato: (11) 1234-5678
      return numbers
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      // Formato: (11) 91234-5678
      return numbers
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplica formatação específica para cada campo
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (advogado.senha !== advogado.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (advogado.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const { confirmarSenha, ...rest } = advogado;

      const dataToSend = {
        ...rest,
        login: rest.cpf.replace(/\D/g, ''),
        cpf: rest.cpf.replace(/\D/g, ''),
        telefone: rest.telefone.replace(/\D/g, '')
      };

      console.log('Dados enviados:', dataToSend);
      
      const res = await api.post('/auth/register', dataToSend);
      alert('Advogado cadastrado com sucesso!');
      navigate('/advogados/read/' + res.data.id);
    } catch (err) {
      console.error('Erro completo:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao registrar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container-fluid bg-light min-vh-100 p-4'>
      <div className='card border-0 shadow-sm rounded-3 bg-white'>
        <div className="card-body p-4">
          
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center border-bottom border-2 pb-3 mb-4">
            <h5 className="fw-bold mb-0" style={headerStyle}>
              <i className="bi bi-person-plus-fill me-2"></i>
              Cadastrar Novo Advogado
            </h5>
            <Link to="/advogados" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-2"></i>
              Voltar
            </Link>
          </div>

          {/* Alerta de Erro */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <div className="flex-grow-1">{error}</div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError('')}
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            {/* Dados Pessoais */}
            <h5 className="fw-bold text-secondary mt-3 mb-3">
              <i className="bi bi-person-circle me-2"></i>
              Dados Pessoais
            </h5>
            <div className="row mb-3">
              <div className="col-12 mb-3">
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  className="form-control"
                  value={advogado.nome}
                  onChange={handleChange}
                  style={getInputStyle(advogado.nome)}
                  placeholder="Digite o nome completo do advogado"
                  minLength="1"
                  maxLength="150"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>
                  CPF *
                </label>
                <input
                  type="text"
                  name="cpf"
                  className="form-control"
                  value={advogado.cpf}
                  onChange={handleChange}
                  style={getInputStyle(advogado.cpf)}
                  placeholder="000.000.000-00"
                  maxLength="14"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>
                  Telefone *
                </label>
                <input
                  type="text"
                  name="telefone"
                  className="form-control"
                  value={advogado.telefone}
                  onChange={handleChange}
                  style={getInputStyle(advogado.telefone)}
                  placeholder="(00) 00000-0000"
                  maxLength="15"
                  required
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>
                  E-mail *
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={advogado.email}
                  onChange={handleChange}
                  style={getInputStyle(advogado.email)}
                  placeholder="advogado@exemplo.com"
                  maxLength="150"
                  required
                />
              </div>
            </div>

            {/* Dados Profissionais */}
            <h5 className="fw-bold text-secondary mt-4 mb-3">
              <i className="bi bi-briefcase-fill me-2"></i>
              Dados Profissionais
            </h5>
            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>
                  Número OAB *
                </label>
                <input
                  type="text"
                  name="numeroOAB"
                  className="form-control"
                  value={advogado.numeroOAB}
                  onChange={handleChange}
                  style={getInputStyle(advogado.numeroOAB)}
                  placeholder="000000"
                  maxLength="6"
                  required
                />
              </div>

              <div className='col-md-6 mb-3'>
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>
                  Seccional (UF) *
                </label>
                <select 
                  name='seccional' 
                  className='form-select' 
                  value={advogado.seccional}
                  onChange={handleChange}
                  style={getInputStyle(advogado.seccional)}
                  required
                >
                  <option value="">Selecione o Estado</option>
                  {EstadosBrasileiros.map((estado) => (
                    <option key={estado.sigla} value={estado.sigla}>
                      {estado.sigla} - {estado.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>
                  Nível de Acesso *
                </label>
                <select 
                  name='role' 
                  className='form-select' 
                  value={advogado.role}
                  onChange={handleChange}
                  style={getInputStyle(advogado.role)}
                  required
                >
                  <option value="">Selecione o nível</option>
                  <option value="USER">👤 Usuário (Acesso Básico)</option>
                  <option value="ADMIN">🔑 Administrador (Acesso Total)</option>
                </select>
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Usuários têm acesso restrito, administradores têm controle total do sistema
                </small>
              </div>
            </div>

            {/* Dados de Acesso */}
            <h5 className="fw-bold text-secondary mt-4 mb-3">
              <i className="bi bi-shield-lock-fill me-2"></i>
              Dados de Acesso
            </h5>
            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>
                  Senha *
                </label>
                <input
                  type="password"
                  name="senha"
                  className="form-control"
                  value={advogado.senha}
                  onChange={handleChange}
                  style={getInputStyle(advogado.senha)}
                  placeholder="Digite a senha"
                  minLength="6"
                  maxLength="30"
                  required
                />
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Mínimo de 6 caracteres
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold" style={{color: Colors.primaryDeep}}>
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  name="confirmarSenha"
                  className="form-control"
                  value={advogado.confirmarSenha}
                  onChange={handleChange}
                  style={getInputStyle(advogado.confirmarSenha)}
                  placeholder="Confirme a senha"
                  minLength="6"
                  maxLength="30"
                  required
                />
              </div>
            </div>

            {/* Informação de Login */}
            <div className="alert alert-info d-flex align-items-start mt-4">
              <i className="bi bi-info-circle-fill me-2 fs-5 mt-1"></i>
              <div>
                <strong>Informação de Login:</strong>
                <p className="mb-0 mt-1">
                  O CPF será utilizado como login do sistema. O advogado deverá acessar com:
                  <br/>
                  <strong>Login:</strong> {advogado.cpf.replace(/\D/g, '') || 'CPF (apenas números)'}
                  <br/>
                  <strong>Senha:</strong> A senha cadastrada neste formulário
                </p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="d-flex justify-content-end gap-3 mt-5 border-top pt-4">
              <Link to="/advogados" className='btn btn-outline-secondary px-4'>
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </Link>
              <button 
                type="submit" 
                className='btn px-4 fw-bold text-white' 
                style={{...actionBtnStyle, backgroundColor: Colors.primaryDeep}} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Cadastrar Advogado
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

export default Create;