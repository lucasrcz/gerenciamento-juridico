import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/API';

function Create() {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    role: 'USER',
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

    setFormData({
      ...formData,
      [name]: formattedValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      const { confirmarSenha, ...rest } = formData;

      const dataToSend = {
        ...rest,
        login: rest.cpf.replace(/\D/g, ''),
        cpf: rest.cpf.replace(/\D/g, ''),
        telefone: rest.telefone.replace(/\D/g, '')
      };

      console.log('Dados enviados:', dataToSend);
      
      await api.post('/auth/register', dataToSend);
      alert('Advogado cadastrado com sucesso!');
      navigate('/advogados/read/' + dataToSend.cpf);
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
              value={formData.nome}
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
                value={formData.cpf}
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
                value={formData.telefone}
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
              value={formData.email}
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
                value={formData.senha}
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
                value={formData.confirmarSenha}
                onChange={handleChange}
                minLength="6"
                maxLength="30"
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="numeroOAB"><b>Número OAB</b></label>
              <input
                type="text"
                name="numeroOAB"
                className="form-control"
                value={formData.numeroOAB}
                onChange={handleChange}
                maxLength="6"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="seccional"><b>Seccional</b></label>
              <input
                type="text"
                name="seccional"
                className="form-control"
                value={formData.seccional}
                onChange={handleChange}
                maxLength="2"
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