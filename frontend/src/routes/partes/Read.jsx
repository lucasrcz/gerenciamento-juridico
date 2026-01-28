import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/API';

function Read() {
    const { id } = useParams();
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

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

  // Funções de formatação para exibição
    const formatTelefone = (value) => {
        if (!value) return '';
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) {
            return numbers.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
        } else {
        return numbers.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
        }
    };

    const formatDocumento = (value, tipo) => {
        if (!value) return '';
        const numbers = value.replace(/\D/g, '');
        
        if (tipo === 'JURIDICA') {
            return numbers
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
        } else {
        return numbers
            .replace(/^(\d{3})(\d)/, '$1.$2')
            .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1-$2');
        }
    };

    const formatCEP = (value) => {
        if (!value) return '';
        return value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2');
    };

    // Busca de dados na API
    useEffect(() => {
        const fetchParte = async () => {
            try {
                const res = await api.get(`/partes/${id}`);
                setParte(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Erro ao buscar parte:", err);
                setError("Erro ao carregar os dados da parte.");
                setLoading(false);
            }
        };
        fetchParte();
    }, [id]);

    if (loading) {
    return (
        <div className='d-flex w-100 min-vh-100 justify-content-center align-items-center'>
            <h3>Carregando...</h3>
        </div>
    );
    }

    if (error) {
    return (
        <div className='d-flex w-100 min-vh-100 justify-content-center align-items-center'>
            <div className="alert alert-danger">{error}</div>
            <Link to="/partes" className='btn btn-primary ms-3'>Voltar</Link>
        </div>
    );
    }

    return (
        <div className='d-flex w-100 min-vh-100 justify-content-center align-items-center bg-light py-5'>
            <div className='w-50 border bg-white shadow px-5 pt-3 pb-5 rounded'>
                <center><h2>Detalhes da Parte</h2><br /></center>

                <h5 className="text-secondary mb-3 border-bottom pb-2">Dados Pessoais</h5>
                <div>
                    <div className="mb-2">
                        <strong>Nome:</strong> {parte.nome}
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-2">
                            <strong>E-mail:</strong> {parte.email}
                        </div>

                        <div className="col-md-6 mb-2">
                            <strong>Telefone:</strong> {formatTelefone(parte.telefone)}
                        </div>
                    </div>

                    <div className='row'>
                        <div className="col-md-4 mb-3">
                            <strong>Tipo de Pessoa:</strong> {parte.tipoPessoa === 'FISICA' ? 'Física' : 'Jurídica'}
                        </div>

                        <div className="col-md-8 mb-2">
                            <strong>{parte.tipoPessoa === 'JURIDICA' ? 'CNPJ' : 'CPF'}:</strong>
                            {formatDocumento(parte.documento, parte.tipoPessoa)}
                        </div>
                    </div>

                    <div className="mb-3">
                        <strong>Observações:</strong> {parte.observacoes}
                    </div>
                </div>

                <h5 className="text-secondary mt-4 mb-3 border-bottom pb-2">Endereço</h5>
                <div>
                    <div className="row">
                        <div className="col-md-3 mb-2">
                            <strong>CEP:</strong> {formatCEP(parte.endereco.cep)}
                        </div>

                        <div className="col-md-7 mb-2">
                            <strong>Logradouro:</strong> {parte.endereco.logradouro}
                        </div>

                        <div className="col-md-2 mb-2">
                            <strong>Número:</strong> {parte.endereco.numero || 'S/N'}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 mb-2">
                            <strong>Bairro:</strong> {parte.endereco.bairro}
                        </div>

                        {parte.endereco.complemento ? (
                        <div className="col-md-4 mb-2">
                            <strong>Complemento:</strong> {parte.endereco.complemento}
                        </div>
                        ) : null}

                        <div className="col-md-3 mb-2">
                            <strong>Cidade:</strong> {parte.endereco.cidade}
                        </div>

                        <div className="col-md-1 mb-2">
                            <strong>UF:</strong> {parte.endereco.estado}
                        </div>
                    </div>
                </div>

                <Link to={`/partes/update/${id}`} className='btn btn-success'>Editar</Link>
                <Link to="/partes" className='btn btn-primary ms-3'>Voltar</Link>
            </div>
        </div>
    );
}

export default Read;