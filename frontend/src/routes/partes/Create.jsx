import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/API';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';
import { Colors, headerStyle, actionBtnStyle } from '../../constants/Colors';
import { validarCPF, validarCNPJ } from '../../utils/Validations';

function Create() {
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getInputStyle = (value) =>
    (value && value.toString().trim() !== '')
      ? { backgroundColor: '#eef6ff', color: '#000' }
      : {};

  const formatTelefone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return numbers.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleBlurDocumento = () => {
    if (parte.documento.length === 0) return;
    if (parte.tipoPessoa === 'FISICA') {
      if (!validarCPF(parte.documento)) { setDocumentoError('CPF inválido.'); return; }
    } else if (parte.tipoPessoa === 'JURIDICA') {
      if (!validarCNPJ(parte.documento)) { setDocumentoError('CNPJ inválido.'); return; }
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
            endereco: { ...prev.endereco, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf }
          }));
          setCepError('');
        } else { setCepError('CEP não encontrado.'); }
      } catch (error) { setCepError('Erro ao buscar CEP.'); }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'telefone') {
      formattedValue = formatTelefone(value);
    } else if (name === 'documento') {
      formattedValue = parte.tipoPessoa === 'JURIDICA' ? formatCNPJ(value) : formatCPF(value);
      if (documentoError) setDocumentoError('');
    }
    setParte({ ...parte, [name]: formattedValue });
  };

  const handleTypeChange = (e) => {
    setParte({ ...parte, tipoPessoa: e.target.value, documento: '' });
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
        return { ...prev, endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' } };
      }
      return { ...prev, endereco: { ...prev.endereco, [name]: finalValue } };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (parte.tipoPessoa === 'FISICA' && !validarCPF(parte.documento)) { setDocumentoError('Corrija o CPF antes de continuar.'); return; }
    if (parte.tipoPessoa === 'JURIDICA' && !validarCNPJ(parte.documento)) { setDocumentoError('Corrija o CNPJ antes de continuar.'); return; }
    if (!parte.endereco) { setError('Erro interno: Endereço não inicializado.'); return; }

    try {
      setLoading(true);
      const dataToSend = {
        ...parte,
        telefone: parte.telefone.replace(/\D/g, ''),
        documento: parte.documento.replace(/\D/g, ''),
        endereco: { ...parte.endereco, cep: parte.endereco.cep.replace(/\D/g, '') }
      };
      const res = await api.post('/partes', dataToSend);
      alert('Parte cadastrada com sucesso!');
      navigate('/partes/read/' + res.data.id);
    } catch (err) {
      console.error('Erro completo:', err);
      setError(err.response?.data?.message || 'Erro ao cadastrar parte.');
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
            <h4 className="fw-bold mb-0" style={headerStyle}>
              Nova Parte
            </h4>
            <Link to="/partes" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-2"></i>Voltar
            </Link>
          </div>

          {/* Alerta de Erro */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <div className="flex-grow-1">{error}</div>
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Dados Pessoais */}
            <h5 className="fw-bold text-secondary mt-3 mb-3 bg-light p-2">
              <i className="bi bi-person-circle me-2"></i>Dados Pessoais
            </h5>
            <div className="row mb-3">
              <div className="col-12 mb-3">
                <label className="form-label fw-bold" style={{ color: Colors.primaryDeep }}>
                  Nome Completo<span className='fw-bold text-danger'> *</span>
                </label>
                <input type="text" name="nome" className="form-control"
                  value={parte.nome} onChange={handleChange} style={getInputStyle(parte.nome)}
                  placeholder="Digite o nome completo" minLength="1" maxLength="150" required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold" style={{ color: Colors.primaryDeep }}>
                  E-mail<span className='fw-bold text-danger'> *</span>
                </label>
                <input type="email" name="email" className="form-control"
                  value={parte.email} onChange={handleChange} style={getInputStyle(parte.email)}
                  placeholder="parte@exemplo.com" maxLength="150" required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold" style={{ color: Colors.primaryDeep }}>
                  Telefone<span className='fw-bold text-danger'> *</span>
                </label>
                <input type="text" name="telefone" className="form-control"
                  value={parte.telefone} onChange={handleChange} style={getInputStyle(parte.telefone)}
                  placeholder="(00) 00000-0000" maxLength="15" required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold" style={{ color: Colors.primaryDeep }}>
                  Tipo de Pessoa<span className='fw-bold text-danger'> *</span>
                </label>
                <select name="tipoPessoa" className="form-select"
                  value={parte.tipoPessoa} onChange={handleTypeChange} style={getInputStyle(parte.tipoPessoa)} required>
                  <option value="">Selecionar</option>
                  <option value="FISICA">Física</option>
                  <option value="JURIDICA">Jurídica</option>
                </select>
              </div>
              <div className="col-md-8 mb-3">
                <label className="form-label fw-bold" style={{ color: Colors.primaryDeep }}>
                  {parte.tipoPessoa === 'JURIDICA' ? 'CNPJ' : parte.tipoPessoa === 'FISICA' ? 'CPF' : 'Documento'}
                  <span className='fw-bold text-danger'> *</span>
                </label>
                <input type="text" name="documento"
                  className={`form-control ${documentoError ? 'is-invalid' : ''}`}
                  value={parte.documento} onChange={handleChange} onBlur={handleBlurDocumento}
                  style={getInputStyle(parte.documento)}
                  placeholder={parte.tipoPessoa === 'JURIDICA' ? '00.000.000/0000-00' : parte.tipoPessoa === 'FISICA' ? '000.000.000-00' : 'Selecione o Tipo de Pessoa'}
                  maxLength={parte.tipoPessoa === 'JURIDICA' ? 18 : 14}
                  disabled={!parte.tipoPessoa} required />
                {documentoError && <small className="text-danger">{documentoError}</small>}
              </div>
              <div className="col-12 mb-3">
                <label className="form-label fw-bold" style={{ color: Colors.primaryDeep }}>
                  Observações
                </label>
                <textarea name="observacoes" className="form-control" rows="2"
                  value={parte.observacoes} onChange={handleChange} style={getInputStyle(parte.observacoes)}
                  placeholder="Informações adicionais sobre a parte" maxLength="255" />
              </div>
            </div>

            {/* Endereço */}
            <h5 className="fw-bold text-secondary mt-4 mb-3 bg-light p-2">
              <i className="bi bi-geo-alt-fill me-2"></i>Endereço
            </h5>
            <div className="row mb-3">
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold" style={{ color: Colors.primaryDeep }}>CEP</label>
                <input type="text" name="cep"
                  className={`form-control ${cepError ? 'is-invalid' : ''}`}
                  value={parte.endereco.cep} onChange={handleAddressChange}
                  onBlur={() => buscaCEP(parte.endereco.cep)}
                  style={getInputStyle(parte.endereco.cep)}
                  placeholder="00000-000" maxLength="9" />
                {cepError && <small className="text-danger">{cepError}</small>}
              </div>
              <div className="col-md-7 mb-3">
                <label className="form-label fw-bold" style={{ color: Colors.primaryDeep }}>
                  Logradouro<span className='fw-bold text-danger'> *</span>
                </label>
                <input type="text" name="logradouro" className="form-control"
                  value={parte.endereco.logradouro} onChange={handleAddressChange}
                  style={getInputStyle(parte.endereco.logradouro)}
                  placeholder="Rua, Avenida, etc." required />
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label fw-bold" style={{ color: Colors.primaryDeep }}>
                  Número<span className='fw-bold text-danger'> *</span>
                </label>
                <input type="text" name="numero" className="form-control"
                  value={parte.endereco.numero} onChange={handleAddressChange}
                  style={getInputStyle(parte.endereco.numero)} required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold" style={{ color: Colors.primaryDeep }}>
                  Bairro<span className='fw-bold text-danger'> *</span>
                </label>
                <input type="text" name="bairro" className="form-control"
                  value={parte.endereco.bairro} onChange={handleAddressChange}
                  style={getInputStyle(parte.endereco.bairro)} required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold" style={{ color: Colors.primaryDeep }}>Complemento</label>
                <input type="text" name="complemento" className="form-control"
                  value={parte.endereco.complemento} onChange={handleAddressChange}
                  style={getInputStyle(parte.endereco.complemento)} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold" style={{ color: Colors.primaryDeep }}>
                  Cidade<span className='fw-bold text-danger'> *</span>
                </label>
                <input type="text" name="cidade" className="form-control"
                  value={parte.endereco.cidade} onChange={handleAddressChange}
                  style={getInputStyle(parte.endereco.cidade)} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold" style={{ color: Colors.primaryDeep }}>
                  UF<span className='fw-bold text-danger'> *</span>
                </label>
                <select name="estado" className="form-select"
                  value={parte.endereco.estado} onChange={handleAddressChange}
                  style={getInputStyle(parte.endereco.estado)} required>
                  <option value="">Selecione o Estado</option>
                  {EstadosBrasileiros.map((estado) => (
                    <option key={estado.sigla} value={estado.sigla}>
                      {estado.sigla} - {estado.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="d-flex justify-content-end gap-3 mt-5 border-top pt-4">
              <Link to="/partes" className='btn btn-outline-secondary px-4'>
                <i className="bi bi-x-circle me-2"></i>Cancelar
              </Link>
              <button type="submit" className='btn px-4 fw-bold text-white'
                style={{ ...actionBtnStyle, backgroundColor: Colors.primaryDeep }} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>Cadastrar Parte
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