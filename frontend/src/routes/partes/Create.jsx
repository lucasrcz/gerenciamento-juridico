import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/API';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';
import { validarCPF, validarCNPJ } from '../../utils/Validations';

function Create() {
  const [parte, setParte] = useState({
    nome: '',
    tipoPessoa: '',
    email: '',
    telefone: '',
    documento: '',
    observacoes: '',
    enderecos: [
      {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      }
    ]
  });

  const [cepErrors, setCepErrors] = useState({});
  const [documentoError, setDocumentoError] = useState('');
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

  // Função para formatar CPF
  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // Função para formatar CNPJ
  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // Mensagem de validação CPF/CNPJ
  const handleBlurDocumento = () => {
    if (parte.documento.length === 0) return;

    let isValid = true;

    if (parte.tipoPessoa === 'FISICA') {
      isValid = validarCPF(parte.documento);
      if (!isValid) {
        setDocumentoError('CPF inválido.');
        return;
      }
    } 
    else if (parte.tipoPessoa === 'JURIDICA') {
      isValid = validarCNPJ(parte.documento);
      if (!isValid) {
        setDocumentoError('CNPJ inválido.');
        return;
      }
    }
    setDocumentoError('');
  };

  // Integração ViaCEP (preencher campos a partir do CEP)
  const buscaCEP = async (index, cepValue) => {
    const cepLimpo = cepValue.replace(/\D/g, '');

    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (!data.erro) {
          const newEnderecos = [...parte.enderecos];
          
          // Atualiza os campos com o retorno da API
          newEnderecos[index] = {
            ...newEnderecos[index],
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          };

          setParte({
            ...parte,
            enderecos: newEnderecos
          });

          setCepErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });

        } else {
          setCepErrors(prev => ({ ...prev, [index]: 'CEP não encontrado.' }));
        }
      } catch (error) {
        setCepErrors(prev => ({ ...prev, [index]: 'Erro ao buscar CEP.' }));
      }
    }
  };

  // Aplica formatação específica para cada campo
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'telefone') {
      formattedValue = formatTelefone(value);
    } else if (name === 'documento') {
      formattedValue = parte.tipoPessoa === 'JURIDICA'
      ? formatCNPJ(value)
      : formatCPF(value);
      if (documentoError) setDocumentoError('');
    }

    setParte({
      ...parte,
      [name]: formattedValue
    });
  };

  // Mudança do documento conforme Tipo de Pessoa
  const handleTypeChange = (e) => { 
    setParte({
      ...parte,
      tipoPessoa: e.target.value,
      documento: ''
    });
    setDocumentoError('');
  };

  // Endereço
  const handleAddressChange = (e, index) => {
    const { name, value } = e.target;
    const newEnderecos = [...parte.enderecos];

    let finalValue = value;
    if (name === 'cep') {
        finalValue = value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2');
    if (cepErrors[index]) {
            setCepErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[index];
                return newErrors;
            });
        }
    if (finalValue === '') {
            newEnderecos[index] = {
                ...newEnderecos[index],
                logradouro: '',
                numero: '',
                complemento: '',
                bairro: '',
                cidade: '',
                estado: ''
            };
        }
    }

    newEnderecos[index] = {
      ...newEnderecos[index],
      [name]: finalValue
    };

    setParte({
      ...parte,
      enderecos: newEnderecos
    });
  };

  // Enviando os dados do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parte.tipoPessoa === 'FISICA' && !validarCPF(parte.documento)) {
        setDocumentoError('Corrija o CPF antes de continuar.');
        return;
    }

    if (parte.tipoPessoa === 'JURIDICA' && !validarCNPJ(parte.documento)) {
        setDocumentoError('Corrija o CNPJ antes de continuar.');
        return;
    }

    try {
      const dataToSend = {
        ...parte,
        telefone: parte.telefone.replace(/\D/g, ''),
        documento: parte.documento.replace(/\D/g, ''),
        enderecos: parte.enderecos.map(end => ({
            ...end,
            cep: end.cep.replace(/\D/g, '')
        }))
      };

      console.log('Dados enviados:', dataToSend);
      
      const res = await api.post('/partes', dataToSend);
      alert('Parte cadastrada com sucesso!');
      navigate('/partes/read/' + res.data.id);
    } catch (err) {
      console.error('Erro completo:', err);
      setError(err.response?.data?.message || 'Erro ao cadastrar parte.');
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
          <h5 className="text-secondary mb-3 border-bottom pb-2">Dados Pessoais</h5>
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
          <div className="col-md-4 mb-3">
            <label htmlFor="tipoPessoa"><b>Tipo de Pessoa</b></label>
            <select name='tipoPessoa' className='form-select' value={parte.tipoPessoa}
              onChange={handleTypeChange} required>
                <option value="">Selecionar</option>
                <option value="FISICA">Física</option>
                <option value="JURIDICA">Jurídica</option>
              </select>
          </div>

          <div className="col-md-8 mb-2">
            <label htmlFor="documento"><b>
                  {parte.tipoPessoa === 'JURIDICA' ? 'CNPJ' : 
                   parte.tipoPessoa === 'FISICA' ? 'CPF' : 'Documento'}
                </b>
            </label>

            <input
              type="text"
              name="documento"
              className={`form-control ${documentoError ? 'is-invalid' : ''}`}
              value={parte.documento}
              onChange={handleChange}
              onBlur={handleBlurDocumento}
              placeholder={
                parte.tipoPessoa === 'JURIDICA'
                ? '00.000.000/0000-00'
                : parte.tipoPessoa === 'FISICA'
                  ? '000.000.000-00'
                  : 'Selecione o Tipo de Pessoa'}
              maxLength={parte.tipoPessoa === 'JURIDICA' ? 18 : 14}
              disabled={!parte.tipoPessoa}
              required
            />
            {documentoError && <small className="text-danger">{documentoError}</small>}
          </div>

          <div className="col-md-6 mb-2">
            <label htmlFor="observacoes"><b>Observações</b></label>
            <textarea
              type="text"
              name="observacoes"
              className="form-control"
              value={parte.observacoes}
              onChange={handleChange}
              minLength="6"
              maxLength="30"
            />
          </div>
        </div>

        <h5 className="text-secondary mt-4 mb-3 border-bottom pb-2">Endereço</h5>

        {parte.enderecos.map((endereco, index) => (
            <div key={index}>
              <div className="row">
                <div className="col-md-3 mb-2">
                  <label><b>CEP</b></label>
                  <input
                    type="text"
                    name="cep"
                    className="form-control"
                    value={endereco.cep}
                    onChange={(e) => handleAddressChange(e, index)}
                    onBlur={() => buscaCEP(index, endereco.cep)}
                    placeholder="00000-000"
                    maxLength="9"
                  />
                  {cepErrors[index] && (
                    <small className="text-danger">
                      {cepErrors[index]}
                    </small>
                  )}
                </div>
                <div className="col-md-7 mb-2">
                  <label><b>Logradouro</b></label>
                  <input
                    type="text"
                    name="logradouro"
                    className="form-control"
                    value={endereco.logradouro}
                    onChange={(e) => handleAddressChange(e, index)}
                    required
                  />
                </div>
                <div className="col-md-2 mb-2">
                  <label><b>Número</b></label>
                  <input
                    type="text"
                    name="numero"
                    className="form-control"
                    value={endereco.numero}
                    onChange={(e) => handleAddressChange(e, index)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-2">
                  <label><b>Bairro</b></label>
                  <input
                    type="text"
                    name="bairro"
                    className="form-control"
                    value={endereco.bairro}
                    onChange={(e) => handleAddressChange(e, index)}
                  />
                </div>
                <div className="col-md-4 mb-2">
                  <label><b>Complemento</b></label>
                  <input
                    type="text"
                    name="complemento"
                    className="form-control"
                    value={endereco.complemento}
                    onChange={(e) => handleAddressChange(e, index)}
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-3 mb-2">
                  <label><b>Cidade</b></label>
                  <input
                    type="text"
                    name="cidade"
                    className="form-control"
                    value={endereco.cidade}
                    onChange={(e) => handleAddressChange(e, index)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <label><b>UF</b></label>
                  <select name='estado' className='form-select' value={endereco.estado}
                    onChange={(e) => handleAddressChange(e, index)} required>
                    <option value="">Selecionar</option>
                    {EstadosBrasileiros.map((estado) => (
                      <option key={estado.sigla} value={estado.sigla}>
                        {estado.sigla} - {estado.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

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