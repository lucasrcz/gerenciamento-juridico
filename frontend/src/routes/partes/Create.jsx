import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/API';

function Create() {
  const [parte, setParte] = useState({
    nome: '',
    tipoPessoa: '',
    email: '',
    telefone: '',
    documento: '',
    observacoes: '',
    enderecos: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

    setParte({
      ...parte,
      [name]: formattedValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const dataToSend = {
        telefone: partes.telefone.replace(/\D/g, '')
      };

      console.log('Dados enviados:', dataToSend);
      
      await api.post('/partes', dataToSend);
      alert('Parte cadastrada com sucesso!');
      navigate('/partes/read/' + res.data.id);
    } catch (err) {
      console.error('Erro completo:', err.response?.data);
    }
  };

  return (
    <div className='d-flex w-100 vh-100 justify-content-center align-items-center bg-light'>
      <div className='w-50 border bg-white shadow px-5 pt-3 pb-5 rounded'>
        <center><h2>Nova Parte</h2><br /></center>
        
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
              value={parte.nome}
              onChange={handleChange}
              minLength="1"
              maxLength="150"
              required
            />
        </div>

        <div className="row">
          <div className="col-md-6 mb-2">
            <label htmlFor="email"><b>E-mail</b></label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={parte.email}
              onChange={handleChange}
              maxLength="150"
              required
            />
          </div>

            <div className="col-md-6 mb-2">
              <label htmlFor="telefone"><b>Telefone</b></label>
              <input
                type="text"
                name="telefone"
                className="form-control"
                value={parte.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                maxLength="15"
                required
              />
            </div>

        </div>

        <div className='row'>
          <div className="col-md-3 mb-3">
              <label htmlFor="tipoPessoa"><b>Tipo de Pessoa</b></label>
              <select name='tipoPessoa' className='form-select' value={parte.tipoPessoa}
                onChange={e => setParte({...parte, tipoPessoa: e.target.value})} required>
                  <option value="">Selecionar</option>
                  <option value="FISICA">Física</option>
                  <option value="JURIDICA">Jurídica</option>
                </select>
            </div>

            <div className="col-md-6 mb-2">
              <label htmlFor="documento"><b>Documento</b></label>
              <input
                type="text"
                name="documento"
                className="form-control"
                value={parte.documento}
                onChange={handleChange}
                minLength="6"
                maxLength="30"
                required
              />
            </div>
        </div>

            <div className="col-md-6 mb-2">
              <label htmlFor="observacoes"><b>Observações</b></label>
              <input
                type="text"
                name="observacoes"
                className="form-control"
                value={parte.observacoes}
                onChange={handleChange}
                minLength="6"
                maxLength="30"
                required
              />
            </div>

          <center><br />
            <button className='btn btn-success'>Cadastrar</button>
            <Link to="/partes" className='btn btn-primary ms-3'>Voltar</Link>
          </center>
        </form>
    </div>
  </div>
  );
}

export default Create;