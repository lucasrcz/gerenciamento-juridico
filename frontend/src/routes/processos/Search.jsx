import { useState, useEffect } from 'react'
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros'
import { api } from '../../services/API';

function Search({handleChange, handleSearch, handleClear, values}) {
    const [advogadoSearch, setAdvogadoSearch] = useState('');
    const [advogadoOptions, setAdvogadoOptions] = useState([]);
    const [showOptions, setShowOptions] = useState(false);

    useEffect(() => {
        if (!values.advogadoId) {
            setAdvogadoSearch('');
        }
    }, [values]);

    const searchAdvogados = async (query) => {
        setAdvogadoSearch(query);
        if (query.length === 0) {
            handleChange({ target: { name: 'advogadoId', value: '' } });
            setAdvogadoOptions([]);
            return;
        }
        if (query.length > 2) {
            try {
                const res = await api.get(`/auth/advogados/select?q=${query}`);
                setAdvogadoOptions(res.data);
                setShowOptions(true);
            } catch (error) {
                console.error("Erro ao buscar advogados", error);
            }
        } else {
            setShowOptions(false);
        }
    }

    const handleSelectAdvogado = (advogado) => {
        setAdvogadoSearch(advogado.nome);
        handleChange({ target: { name: 'advogadoId', value: advogado.id } });
        setShowOptions(false);
    };

  return (
    <div className='w-75 rounded bg-white border shadow p-4 m-4'>
        <div className="row row-cols-6 mb-3">
            <div className='col-lg-2 col-md-4'>
                <label htmlFor='processos'><strong>Nº Processo</strong></label>
                <input id='processos' type='text' name='numero' className='form-control border p-2 mt-2'
                onChange={handleChange}
                value={values.numero || ''}
                />
            </div>

            <div className='col-lg-2 col-md-4'>
                <label htmlFor='status'><strong>Status</strong></label>
                <select id='status' name='status' className='form-select border p-2 mt-2'
                onChange={handleChange}
                value={values.status || ''}>
                    <option value={''}>Selecione</option>
                    <option value={'EM_ANDAMENTO'}>Em Andamento</option>
                    <option value={'ARQUIVADO'}>Arquivado</option>
                    <option value={'FINALIZADO'}>Finalizado</option>
                </select>
            </div>

            <div className='col-lg-2 col-md-4'>
                <label htmlFor='estado'><strong>Estado</strong></label>
                <select id='estado' name='estado' className='form-select border p-2 mt-2'
                onChange={handleChange}
                value={values.estado || ''}>
                    <option value=''>Selecione</option>
                    {EstadosBrasileiros.map((estado) => (
                        <option key={estado.sigla} value={estado.sigla}>
                            {estado.sigla} - {estado.nome}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <div className="row row-cols-6 mb-3">
            <div className='col-lg-4 col-md-6 position-relative'>
                <label htmlFor='advogado'><strong>Advogado Responsável</strong></label>
                <input
                id='advogado'
                type='text'className='form-control border p-2 mt-2'
                placeholder='Selecione'
                onChange={(e) => searchAdvogados(e.target.value)}
                value={advogadoSearch}
                autoComplete='off'
                />

                {showOptions && advogadoOptions.length > 0 && (
                    <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                        {advogadoOptions.map((adv) => (
                            <button 
                                key={adv.id} 
                                type="button"
                                className="list-group-item list-group-item-action text-start"
                                onClick={() => handleSelectAdvogado(adv)}>
                                {adv.nome} <small className="text-muted">({adv.role})</small>
                            </button>
                        ))}
                    </ul>
                )}
            </div>
        </div>

        <button className='btn btn-sm btn-info border me-2' type="button" onClick={handleSearch}>Pesquisar</button>
        <button className='btn btn-sm btn-info border me-2' type="button" onClick={handleClear}>Limpar Filtros</button>
    </div>
  )
}

export default Search
