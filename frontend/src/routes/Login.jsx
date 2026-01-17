import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/API';

function Login() {
  const [credentials, setCredentials] = useState({ login: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      navigate('/processos');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
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
                  <label className="form-label">CPF</label>
                  <input
                    type="text"
                    className="form-control"
                    value={credentials.login}
                    onChange={(e) => setCredentials({...credentials, login: e.target.value})}
                    placeholder="00000000000"
                    maxLength="11"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Senha</label>
                  <input
                    type="password"
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