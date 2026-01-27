import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/API';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';

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
  const navigate = useNavigate();

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

    if (advogado.senha !== advogado.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (advogado.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
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
    }
  };

  return (
    <div className='d-flex w-100 vh-100 justify-content-center align-items-center bg-light'>
      <div className='w-50 border bg-white shadow px-5 pt-3 pb-5 rounded'>
        <center><h2>Novo Advogado</h2><br /></center>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label htmlFor="nome"><b>Nome Completo</b></label>
            <input
              type="text"
              name="nome"
              className="form-control"
              value={advogado.nome}
              onChange={handleChange}
              minLength="1"
              maxLength="150"
              required
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-2">
              <label htmlFor="cpf"><b>CPF</b></label>
              <input
                type="text"
                name="cpf"
                className="form-control"
                value={advogado.cpf}
                onChange={handleChange}
                placeholder="000-000-000.00"
                maxLength="14"
                required
              />
            </div>

            <div className="col-md-6 mb-2">
              <label htmlFor="telefone"><b>Telefone</b></label>
              <input
                type="text"
                name="telefone"
                className="form-control"
                value={advogado.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                maxLength="15"
                required
              />
            </div>
          </div>

          <div className="mb-2">
            <label htmlFor="email"><b>E-mail</b></label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={advogado.email}
              onChange={handleChange}
              maxLength="150"
              required
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-2">
              <label htmlFor="senha"><b>Senha</b></label>
              <input
                type="password"
                name="senha"
                className="form-control"
                value={advogado.senha}
                onChange={handleChange}
                minLength="6"
                maxLength="30"
                required
              />
              <small className="text-muted">Mínimo de 6 caracteres</small>
            </div>

            <div className="col-md-6 mb-2">
              <label htmlFor="confirmarSenha"><b>Confirmar Senha</b></label>
              <input
                type="password"
                name="confirmarSenha"
                className="form-control"
                value={advogado.confirmarSenha}
                onChange={handleChange}
                minLength="6"
                maxLength="30"
                required
              />
            </div>
          </div>

          <div className="row">
            <div className='col-md-6 mb-2'>
                <label htmlFor="seccional"><b>Seccional</b></label>
                <select name='seccional' className='form-select' value={advogado.seccional}
                onChange={e => setAdvogado({...advogado, seccional: e.target.value})} required>
                  <option value="">Selecionar</option>
                  {EstadosBrasileiros.map((seccional) => (
                    <option key={seccional.sigla} value={seccional.sigla}>
                      {seccional.sigla} - {seccional.nome}
                    </option>
                  ))}
                </select>
              </div>
            
            <div className="col-md-3 mb-3">
              <label htmlFor="role"><b>Role</b></label>
              <select name='role' className='form-select' value={advogado.role}
                onChange={e => setAdvogado({...advogado, role: e.target.value})} required>
                  <option value="">Selecionar</option>
                  <option value="USER">Usuário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
            </div>

            <div className="col-md-3 mb-3">
              <label htmlFor="numeroOAB"><b>Número OAB</b></label>
              <input
                type="text"
                name="numeroOAB"
                className="form-control"
                value={advogado.numeroOAB}
                onChange={handleChange}
                maxLength="6"
                required
              />
            </div>

            
          </div>

          <center><br />
            <button className='btn btn-success'>Cadastrar</button>
            <Link to="/advogados" className='btn btn-primary ms-3'>Voltar</Link>
          </center>
        </form>
      </div>
    </div>
  );
}

export default Create;