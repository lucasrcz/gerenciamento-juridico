import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/API';

function Login() {
  const [credentials, setCredentials] = useState({ login: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Função para formatar CPF
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
      // Remove formatação do CPF antes de enviar
      const dataToSend = {
        login: credentials.login.replace(/\D/g, ''),
        senha: credentials.senha
      };

      console.log('Tentando login com:', dataToSend);
      
      await login(dataToSend);
      console.log('Login bem-sucedido!');
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
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Login</h3>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor='cpf' className="form-label"><b>CPF</b></label>
                  <input
                    type="text"
                    id="cpf"
                    name="login"
                    className="form-control"
                    value={credentials.login}
                    onChange={handleCPFChange}
                    maxLength="14"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor='senha' className="form-label"><b>Senha</b></label>
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    className="form-control"
                    value={credentials.senha}
                    onChange={(e) => setCredentials({...credentials, senha: e.target.value})}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="mx-auto d-block btn btn-primary w-50"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;