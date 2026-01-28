import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/API';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';
import { validarCPF, validarCNPJ } from '../../utils/Validations';

function Update() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parte, setParte] = useState({
    nome: '',
    tipoPessoa: '',
    email: '',
    telefone: '',
    documento: '',
    observacoes: '',
    endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      }
  });

  const [cepError, setCepError] = useState('');
  const [documentoError, setDocumentoError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const formatTelefone = (value) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return numbers.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const formatCPF = (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatCNPJ = (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatCEP = (value) => {
    if (!value) return '';
    return value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2');
  };

  // Carregar dados da API
  useEffect(() => {
    const fetchParte = async () => {
        try {
            const res = await api.get(`/partes/${id}`);
            const data = res.data;

            setParte({
                ...data,
                telefone: formatTelefone(data.telefone),
                documento: data.tipoPessoa === 'JURIDICA'
                ? formatCNPJ(data.documento)
                : formatCPF(data.documento),
                endereco: {
                    ...data.endereco,
                    cep: formatCEP(data.endereco.cep)
                }
            });
            setLoading(false);
        } catch (err) {
            console.error("Erro ao buscar parte:", err);
            setError("Erro ao carregar os dados para edição.");
            setLoading(false);
        }
    };
    fetchParte();
  }, [id]);

  const handleBlurDocumento = () => {
    if (parte.documento.length === 0) return;

    let isValid = true;
    const docLimpo = parte.documento.replace(/\D/g, '');

    if (parte.tipoPessoa === 'FISICA') {
      isValid = validarCPF(docLimpo);
      if (!isValid) {
        setDocumentoError('CPF inválido.');
        return;
      }
    } 
    else if (parte.tipoPessoa === 'JURIDICA') {
      isValid = validarCNPJ(docLimpo);
      if (!isValid) {
        setDocumentoError('CNPJ inválido.');
        return;
      }
    }
    setDocumentoError('');
  };

  const buscaCEP = async (cepValue) => {
    const cepLimpo = cepValue.replace(/\D/g, '');

    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setParte(prev => ({
            ...prev,
            endereco: {
              ...prev.endereco,
              logradouro: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf
            }
          }));
          setCepError('');
        } else {
          setCepError('CEP não encontrado.');
        }
      } catch (error) {
        setCepError('Erro ao buscar CEP.');
      }
    }
  };

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

  const handleTypeChange = (e) => { 
    setParte({
      ...parte,
      tipoPessoa: e.target.value,
      documento: ''
    });
    setDocumentoError('');
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'cep') {
        finalValue = value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2');
      if (cepError) setCepError('');
    }
        
    setParte(prev => {
        if (name === 'cep' && finalValue === '') {
          return {
              ...prev,
              endereco: {
                  ...prev.endereco,
                  logradouro: '',
                  numero: '',
                  complemento: '',
                  bairro: '',
                  cidade: '',
                  estado: '',
                  cep: ''
              }
          };
        }
        return {
          ...prev,
          endereco: {
              ...prev.endereco,
              [name]: finalValue
          }
        };
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    const docLimpo = parte.documento.replace(/\D/g, '');

    if (parte.tipoPessoa === 'FISICA' && !validarCPF(docLimpo)) {
        setDocumentoError('Corrija o CPF antes de continuar.');
        return;
    }

    if (parte.tipoPessoa === 'JURIDICA' && !validarCNPJ(docLimpo)) {
        setDocumentoError('Corrija o CNPJ antes de continuar.');
        return;
    }

    if (!parte.endereco) {
        setError('Erro interno: Endereço não inicializado.');
        return;
    }

    try {
      const dataToSend = {
        ...parte, 
        telefone: parte.telefone.replace(/\D/g, ''),
        documento: docLimpo,
        endereco: {
            ...parte.endereco,
            cep: parte.endereco.cep.replace(/\D/g, '')
        }
      };

      console.log('Dados atualizados enviados:', dataToSend);
      
      const res = await api.put(`/partes/${id}`, dataToSend);
      alert('Parte atualizada com sucesso!');
      navigate('/partes/read/' + res.data.id); 
    } catch (err) {
      console.error('Erro completo:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar parte.');
    }
  };

  if (loading) {
    return (
        <div className='d-flex w-100 min-vh-100 justify-content-center align-items-center'>
            <h3>Carregando dados...</h3>
        </div>
    );
  }

  return (
    <div className='d-flex w-100 min-vh-100 justify-content-center align-items-center bg-light py-5'>
      <div className='w-50 border bg-white shadow px-5 pt-3 pb-5 rounded'>
        <center><h2>Editar Parte</h2><br /></center>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate}>
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

        <div>
          <div className="row">
            <div className="col-md-3 mb-2">
              <label><b>CEP</b></label>
              <input
                type="text"
                name="cep"
                className={`form-control ${cepError ? 'is-invalid' : ''}`}
                value={parte.endereco.cep}
                onChange={handleAddressChange}
                onBlur={() => buscaCEP(parte.endereco.cep)}
                placeholder="00000-000"
                maxLength="9"
              />
              {cepError && <small className="text-danger">{cepError}</small>}
            </div>

            <div className="col-md-7 mb-2">
              <label><b>Logradouro</b></label>
              <input
                type="text"
                name="logradouro"
                className="form-control"
                value={parte.endereco.logradouro}
                onChange={handleAddressChange}
                required
              />
            </div>

            <div className="col-md-2 mb-2">
              <label><b>Número</b></label>
              <input
                type="text"
                name="numero"
                className="form-control"
                value={parte.endereco.numero}
                onChange={handleAddressChange}
                required
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
                value={parte.endereco.bairro}
                onChange={handleAddressChange}
                required
              />
            </div>

            <div className="col-md-4 mb-2">
              <label><b>Complemento</b></label>
              <input
                type="text"
                name="complemento"
                className="form-control"
                value={parte.endereco.complemento}
                onChange={handleAddressChange}
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
                value={parte.endereco.cidade}
                onChange={handleAddressChange}
                required
              />
            </div>

            <div className="col-md-6 mb-2">
              <label><b>UF</b></label>
              <select name='estado' className='form-select' value={parte.endereco.estado}
                onChange={handleAddressChange} required>
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

        <center><br />
          <button className='btn btn-success'>Atualizar</button>
          <Link to={`/partes/read/${id}`} className='btn btn-primary ms-3'>Cancelar</Link>
        </center>
      </form>
    </div>
  </div>
  );
}

export default Update;