import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/API'
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros'

function Update() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [advogado, setAdvogado] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    role: 'USER',
    numeroOAB: '',
    seccional: ''
  });

  useEffect(()=> { 
      api.get('/auth/advogados/' + id)
        .then(res => setAdvogado(res.data))
        .catch(err => console.log(err));
    }, [id])


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

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const dataToSend = {
        nome: advogado.nome,
        email: advogado.email,
        seccional: advogado.seccional,
        numeroOAB: advogado.numeroOAB,
        role: advogado.role,
        senha: advogado.senha,
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
    }
  };

  return (
    <div className='d-flex w-100 vh-100 justify-content-center align-items-center bg-light'>
      <div className='w-50 border bg-white shadow px-5 pt-3 pb-5 rounded'>
        <center><h2>Editar Advogado</h2><br /></center>
        
        <form onSubmit={handleUpdate}>
          <div className="mb-2">
            <label htmlFor="nome"><b>Nome Completo</b></label>
            <input type="text" name="nome" className="form-control" minLength="1" maxLength="150"
            value={advogado.nome}
            onChange={handleChange} required/>
          </div>

          <div className="row">
            <div className="col-md-6 mb-2">
              <label htmlFor="cpf"><b>CPF</b></label>
              <input type="text" name="cpf" className="form-control" maxLength="14"
              value={advogado.cpf}
              onChange={handleChange} required/>
            </div>

            <div className="col-md-6 mb-2">
              <label htmlFor="telefone"><b>Telefone</b></label>
              <input type="text" name="telefone" className="form-control" maxLength="15"
              value={advogado.telefone}
              onChange={handleChange} required/>
            </div>
          </div>

          <div className="mb-2">
            <label htmlFor="email"><b>E-mail</b></label>
            <input type="email" name="email" className="form-control" maxLength="150"
            value={advogado.email}
            onChange={handleChange} required/>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="numeroOAB"><b>Número OAB</b></label>
              <input type="text" name="numeroOAB" className="form-control" maxLength="6"
              value={advogado.numeroOAB}
              onChange={handleChange} required/>
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="seccional"><b>Seccional</b></label>
              <select type="text" name="seccional" className="form-select"
              value={advogado.seccional}
              onChange={handleChange} required>
              {EstadosBrasileiros.map((seccional) => (
                    <option key={seccional.sigla} value={seccional.sigla}>
                      {seccional.sigla} - {seccional.nome}
                    </option>
                  ))}
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="role"><b>Role</b></label>
              <select name='role' className='form-select'
              value={advogado.role}
              onChange={handleChange} required>
                <option value="USER">Usuário</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          <center><br/>
            <button className='btn btn-success'>Atualizar</button>
            <Link to="/advogados" className='btn btn-primary ms-3'>Voltar</Link>
          </center>
        </form>
      </div>
    </div>
  );
}

export default Update;