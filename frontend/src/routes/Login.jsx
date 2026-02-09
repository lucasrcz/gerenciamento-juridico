import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/API';
import './Login.css';

function Login() {
  const [credentials, setCredentials] = useState({ login: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCPFChange = (e) => {
    const formattedCPF = formatCPF(e.target.value);
    setCredentials({...credentials, login: formattedCPF});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dataToSend = {
        login: credentials.login.replace(/\D/g, ''),
        senha: credentials.senha
      };
      
      await login(dataToSend);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro completo:', err);
      console.error('Resposta do servidor:', err.response?.data);
      setError(err.response?.data?.message || 'CPF ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo e nome do sistema */}
        <div className="login-brand">
          <img src="/logo.png" alt="Juris Logo" className="login-logo" />
          <h1 className="login-system-name">Juris</h1>
          <p className="login-subtitle">Gerenciamento de Processos Jurídicos</p>
        </div>

        {/* Card de login */}
        <div className="login-card">
          <h3 className="login-title">Entrar</h3>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="cpf" className="form-label login-label">
                <i className="bi bi-person me-1"></i> CPF
              </label>
              <input
                type="text"
                id="cpf"
                name="login"
                className="form-control login-input"
                placeholder="000.000.000-00"
                value={credentials.login}
                onChange={handleCPFChange}
                maxLength="14"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="senha" className="form-label login-label">
                <i className="bi bi-lock me-1"></i> Senha
              </label>
              <input
                type="password"
                id="senha"
                name="senha"
                className="form-control login-input"
                placeholder="Digite sua senha"
                value={credentials.senha}
                onChange={(e) => setCredentials({...credentials, senha: e.target.value})}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn login-btn w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Entrando...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;