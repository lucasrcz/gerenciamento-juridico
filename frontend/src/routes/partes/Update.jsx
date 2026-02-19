import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/API';
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros';
import { Colors } from '../../constants/Colors';
import { validarCPF, validarCNPJ } from '../../utils/Validations';

function Update() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

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
      if (!isValid) { setDocumentoError('CPF inválido.'); return; }
    } else if (parte.tipoPessoa === 'JURIDICA') {
      isValid = validarCNPJ(docLimpo);
      if (!isValid) { setDocumentoError('CNPJ inválido.'); return; }
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    const docLimpo = parte.documento.replace(/\D/g, '');
    if (parte.tipoPessoa === 'FISICA' && !validarCPF(docLimpo)) { setDocumentoError('Corrija o CPF antes de continuar.'); return; }
    if (parte.tipoPessoa === 'JURIDICA' && !validarCNPJ(docLimpo)) { setDocumentoError('Corrija o CNPJ antes de continuar.'); return; }
    if (!parte.endereco) { setError('Erro interno: Endereço não inicializado.'); return; }

    try {
      setSaving(true);
      const dataToSend = {
        ...parte,
        telefone: parte.telefone.replace(/\D/g, ''),
        documento: docLimpo,
        endereco: { ...parte.endereco, cep: parte.endereco.cep.replace(/\D/g, '') }
      };
      const res = await api.put(`/partes/${id}`, dataToSend);
      alert('Parte atualizada com sucesso!');
      navigate('/partes/read/' + res.data.id);
    } catch (err) {
      console.error('Erro completo:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar parte.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Carregando...</div>;

  return (
    <div className='container-fluid vh-100 overflow-hidden bg-light'>
      <div className='row h-100'>
        <div className='col-12 col-lg-8 mx-auto h-100 overflow-auto p-4'>

          {/* Cabeçalho */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: Colors.primaryDeep }}>
                Editar Parte
              </h2>
              <span className="badge bg-warning text-dark">Modo Edição</span>
            </div>
            <div className="d-flex gap-2">
              <Link to={`/partes/read/${id}`} className='btn btn-outline-secondary btn-sm'>
                <i className="bi bi-x-circle me-1"></i>Cancelar
              </Link>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          <form onSubmit={handleUpdate}>
            {/* Dados Pessoais */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold border-bottom pb-2 mb-3 text-secondary">
                  <i className="bi bi-person-fill me-2"></i>Dados Pessoais
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="nome" className="form-label"><strong>Nome Completo</strong></label>
                    <input type="text" id="nome" name="nome" className="form-control" minLength="1" maxLength="150"
                      value={parte.nome} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label"><strong>E-mail</strong></label>
                    <input type="email" id="email" name="email" className="form-control" maxLength="150"
                      value={parte.email} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="telefone" className="form-label"><strong>Telefone</strong></label>
                    <input type="text" id="telefone" name="telefone" className="form-control" maxLength="15"
                      placeholder="(00) 00000-0000" value={parte.telefone} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="tipoPessoa" className="form-label"><strong>Tipo de Pessoa</strong></label>
                    <select id="tipoPessoa" name="tipoPessoa" className="form-select"
                      value={parte.tipoPessoa} onChange={handleTypeChange} required>
                      <option value="">Selecionar</option>
                      <option value="FISICA">Física</option>
                      <option value="JURIDICA">Jurídica</option>
                    </select>
                  </div>
                  <div className="col-md-8">
                    <label htmlFor="documento" className="form-label">
                      <strong>{parte.tipoPessoa === 'JURIDICA' ? 'CNPJ' : parte.tipoPessoa === 'FISICA' ? 'CPF' : 'Documento'}</strong>
                    </label>
                    <input type="text" id="documento" name="documento"
                      className={`form-control ${documentoError ? 'is-invalid' : ''}`}
                      value={parte.documento} onChange={handleChange} onBlur={handleBlurDocumento}
                      placeholder={parte.tipoPessoa === 'JURIDICA' ? '00.000.000/0000-00' : parte.tipoPessoa === 'FISICA' ? '000.000.000-00' : 'Selecione o Tipo de Pessoa'}
                      maxLength={parte.tipoPessoa === 'JURIDICA' ? 18 : 14}
                      disabled={!parte.tipoPessoa} required />
                    {documentoError && <small className="text-danger">{documentoError}</small>}
                  </div>
                  <div className="col-12">
                    <label htmlFor="observacoes" className="form-label"><strong>Observações</strong></label>
                    <textarea id="observacoes" name="observacoes" className="form-control" rows="2"
                      value={parte.observacoes} onChange={handleChange} maxLength="255" />
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold border-bottom pb-2 mb-3 text-secondary">
                  <i className="bi bi-geo-alt-fill me-2"></i>Endereço
                </h5>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label"><strong>CEP</strong></label>
                    <input type="text" name="cep"
                      className={`form-control ${cepError ? 'is-invalid' : ''}`}
                      value={parte.endereco.cep} onChange={handleAddressChange}
                      onBlur={() => buscaCEP(parte.endereco.cep)}
                      placeholder="00000-000" maxLength="9" />
                    {cepError && <small className="text-danger">{cepError}</small>}
                  </div>
                  <div className="col-md-7">
                    <label className="form-label"><strong>Logradouro</strong></label>
                    <input type="text" name="logradouro" className="form-control"
                      value={parte.endereco.logradouro} onChange={handleAddressChange} required />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label"><strong>Número</strong></label>
                    <input type="text" name="numero" className="form-control"
                      value={parte.endereco.numero} onChange={handleAddressChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label"><strong>Bairro</strong></label>
                    <input type="text" name="bairro" className="form-control"
                      value={parte.endereco.bairro} onChange={handleAddressChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label"><strong>Complemento</strong></label>
                    <input type="text" name="complemento" className="form-control"
                      value={parte.endereco.complemento} onChange={handleAddressChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label"><strong>Cidade</strong></label>
                    <input type="text" name="cidade" className="form-control"
                      value={parte.endereco.cidade} onChange={handleAddressChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label"><strong>UF</strong></label>
                    <select name="estado" className="form-select"
                      value={parte.endereco.estado} onChange={handleAddressChange} required>
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
            </div>

            {/* Botões de Ação */}
            <div className="d-flex justify-content-end gap-2">
              <Link to={`/partes/read/${id}`} className='btn btn-outline-secondary'>
                <i className="bi bi-x-circle me-2"></i>Cancelar
              </Link>
              <button type="submit" className='btn text-white' style={{ backgroundColor: Colors.success }} disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>Salvar Alterações
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

export default Update;