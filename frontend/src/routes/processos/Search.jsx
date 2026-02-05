import { useState, useEffect } from 'react'
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros'
import { api } from '../../services/API';

function Search({ onSearch }) {
    const [filters, setFilters] = useState({
        numero: '',
        status: '',
        estado: '',
        advogadoId: '',
        partesIds: []
    });

    // Estados para Advogado Responsável
    const [advogadoSearch, setAdvogadoSearch] = useState('');
    const [advogadoOptions, setAdvogadoOptions] = useState([]);
    const [showAdvogadoOptions, setShowAdvogadoOptions] = useState(false);

    // Estados para Partes
    const [parteSearch, setParteSearch] = useState('');
    const [parteOptions, setParteOptions] = useState([]);
    const [showParteOptions, setShowParteOptions] = useState(false);
    const [selectedPartes, setSelectedPartes] = useState([]);

    // Buscar advogados
    const searchAdvogados = async (query) => {
        setAdvogadoSearch(query);
        
        if (query.length === 0) {
            setFilters({ ...filters, advogadoId: '' });
            setAdvogadoOptions([]);
            setShowAdvogadoOptions(false);
            return;
        }
        
        if (query.length > 2) {
            try {
                const res = await api.get(`/auth/advogados/select?q=${query}`);
                setAdvogadoOptions(res.data);
                setShowAdvogadoOptions(true);
            } catch (error) {
                console.error("Erro ao buscar advogados", error);
            }
        }
    };

    // Selecionar advogado
    const handleSelectAdvogado = (advogado) => {
        setAdvogadoSearch(`${advogado.nome} - OAB: ${advogado.oab || 'N/A'}`);
        setFilters({ ...filters, advogadoId: advogado.id });
        setShowAdvogadoOptions(false);
    };

    // Buscar partes
    const searchPartes = async (query) => {
        setParteSearch(query);
        
        if (query.length === 0) {
            setParteOptions([]);
            setShowParteOptions(false);
            return;
        }
        
        if (query.length > 2) {
            try {
                const res = await api.get(`/partes/search?q=${query}`);
                setParteOptions(res.data);
                setShowParteOptions(true);
            } catch (error) {
                console.error("Erro ao buscar partes", error);
            }
        }
    };

    // Adicionar parte selecionada
    const handleSelectParte = (parte) => {
        if (!selectedPartes.find(p => p.id === parte.id)) {
            const newSelectedPartes = [...selectedPartes, parte];
            setSelectedPartes(newSelectedPartes);
            setFilters({ 
                ...filters, 
                partesIds: newSelectedPartes.map(p => p.id) 
            });
        }
        setParteSearch('');
        setShowParteOptions(false);
    };

    // Remover parte selecionada
    const handleRemoveParte = (parteId) => {
        const newSelectedPartes = selectedPartes.filter(p => p.id !== parteId);
        setSelectedPartes(newSelectedPartes);
        setFilters({ 
            ...filters, 
            partesIds: newSelectedPartes.map(p => p.id) 
        });
    };

    // Handle change genérico
    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Pesquisar
    const handleSearch = () => {
        onSearch(filters);
    };

    // Limpar filtros
    const handleClear = () => {
        setFilters({
            numero: '',
            status: '',
            estado: '',
            advogadoId: '',
            partesIds: []
        });
        setAdvogadoSearch('');
        setParteSearch('');
        setSelectedPartes([]);
        onSearch({});
    };

    // Formatar CPF/CNPJ
    const formatDocument = (doc) => {
        if (!doc) return '';
        const cleaned = doc.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (cleaned.length === 14) {
            return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return doc;
    };

    return (
        <div className='w-100 rounded bg-white border shadow p-4 mb-4'>
            <h5 className="fw-bold mb-4" style={{ color: '#2C2966' }}>
                <i className="bi bi-funnel me-2"></i>Filtros de Busca
            </h5>

            <div className="row g-3 mb-3">
                {/* Nº Processo */}
                <div className='col-lg-3 col-md-6'>
                    <label htmlFor='numero' className='form-label fw-semibold'>
                        <i className="bi bi-file-text me-1"></i>Nº Processo
                    </label>
                    <input 
                        id='numero' 
                        type='text' 
                        name='numero' 
                        className='form-control'
                        placeholder='Ex: 0000000-00.0000.0.00.0000'
                        onChange={handleChange}
                        value={filters.numero}
                    />
                </div>

                {/* Status */}
                <div className='col-lg-3 col-md-6'>
                    <label htmlFor='status' className='form-label fw-semibold'>
                        <i className="bi bi-list-check me-1"></i>Status
                    </label>
                    <select 
                        id='status' 
                        name='status' 
                        className='form-select'
                        onChange={handleChange}
                        value={filters.status}
                    >
                        <option value=''>Todos</option>
                        <option value='EM_ANDAMENTO'>Em Andamento</option>
                        <option value='ARQUIVADO'>Arquivado</option>
                        <option value='FINALIZADO'>Finalizado</option>
                    </select>
                </div>

                {/* Estado */}
                <div className='col-lg-3 col-md-6'>
                    <label htmlFor='estado' className='form-label fw-semibold'>
                        <i className="bi bi-geo-alt me-1"></i>Estado
                    </label>
                    <select 
                        id='estado' 
                        name='estado' 
                        className='form-select'
                        onChange={handleChange}
                        value={filters.estado}
                    >
                        <option value=''>Todos</option>
                        {EstadosBrasileiros.map((estado) => (
                            <option key={estado.sigla} value={estado.sigla}>
                                {estado.sigla} - {estado.nome}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="row g-3 mb-4">
                {/* Advogado Responsável */}
                <div className='col-lg-6 col-md-6 position-relative'>
                    <label htmlFor='advogado' className='form-label fw-semibold'>
                        <i className="bi bi-person-badge me-1"></i>Advogado Responsável
                    </label>
                    <input
                        id='advogado'
                        type='text'
                        className='form-control'
                        placeholder='Busque por nome ou nº OAB'
                        onChange={(e) => searchAdvogados(e.target.value)}
                        value={advogadoSearch}
                        autoComplete='off'
                    />

                    {showAdvogadoOptions && advogadoOptions.length > 0 && (
                        <ul className="list-group position-absolute w-100 shadow-lg mt-1" 
                            style={{ zIndex: 1000, maxHeight: '250px', overflowY: 'auto' }}>
                            {advogadoOptions.map((adv) => (
                                <button 
                                    key={adv.id} 
                                    type="button"
                                    className="list-group-item list-group-item-action text-start d-flex justify-content-between align-items-center"
                                    onClick={() => handleSelectAdvogado(adv)}
                                >
                                    <div>
                                        <strong>{adv.nome}</strong>
                                        <br />
                                        <small className="text-muted">
                                            OAB: {adv.oab || 'N/A'} | {adv.role}
                                        </small>
                                    </div>
                                    <i className="bi bi-arrow-right-circle text-primary"></i>
                                </button>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Partes */}
                <div className='col-lg-6 col-md-6 position-relative'>
                    <label htmlFor='parte' className='form-label fw-semibold'>
                        <i className="bi bi-people me-1"></i>Partes
                    </label>
                    <input
                        id='parte'
                        type='text'
                        className='form-control'
                        placeholder='Busque por nome ou CPF/CNPJ'
                        onChange={(e) => searchPartes(e.target.value)}
                        value={parteSearch}
                        autoComplete='off'
                    />

                    {showParteOptions && parteOptions.length > 0 && (
                        <ul className="list-group position-absolute w-100 shadow-lg mt-1" 
                            style={{ zIndex: 1000, maxHeight: '250px', overflowY: 'auto' }}>
                            {parteOptions.map((parte) => (
                                <button 
                                    key={parte.id} 
                                    type="button"
                                    className="list-group-item list-group-item-action text-start d-flex justify-content-between align-items-center"
                                    onClick={() => handleSelectParte(parte)}
                                >
                                    <div>
                                        <strong>{parte.nome}</strong>
                                        <br />
                                        <small className="text-muted">
                                            {formatDocument(parte.cpfCnpj)} | {parte.tipo}
                                        </small>
                                    </div>
                                    <i className="bi bi-plus-circle text-success"></i>
                                </button>
                            ))}
                        </ul>
                    )}

                    {/* Partes Selecionadas */}
                    {selectedPartes.length > 0 && (
                        <div className="mt-2 d-flex flex-wrap gap-2">
                            {selectedPartes.map((parte) => (
                                <span key={parte.id} className="badge bg-primary d-flex align-items-center gap-2 py-2 px-3">
                                    <span>{parte.nome}</span>
                                    <button 
                                        type="button"
                                        className="btn-close btn-close-white"
                                        style={{ fontSize: '0.6rem' }}
                                        onClick={() => handleRemoveParte(parte.id)}
                                        aria-label="Remover"
                                    ></button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Botões */}
            <div className="d-flex gap-2">
                <button 
                    className='btn btn-primary px-4' 
                    type="button" 
                    onClick={handleSearch}
                >
                    <i className="bi bi-search me-2"></i>Pesquisar
                </button>
                <button 
                    className='btn btn-outline-secondary px-4' 
                    type="button" 
                    onClick={handleClear}
                >
                    <i className="bi bi-x-circle me-2"></i>Limpar Filtros
                </button>
            </div>
        </div>
    )
}

export default Search
