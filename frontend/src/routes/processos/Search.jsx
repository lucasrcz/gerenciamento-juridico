import React from 'react'
import { EstadosBrasileiros } from '../../constants/EstadosBrasileiros'

function Search({handleChange}) {
  return (
    <div className='w-75 rounded bg-white border shadow p-4 m-4'>
        <div className="row row-cols-6 mb-3">
            <div className='col-lg-2 col-md-4'>
                <label htmlFor='processos'><strong>Nº Processo</strong></label>
                <input id='processos' type='text' name='numero' className='form-control border p-2 mt-2'
                onChange={handleChange}
                placeholder='Pesquisar processo'
                />
            </div>

            <div className='col-lg-2 col-md-4'>
                <label htmlFor='status'><strong>Status</strong></label>
                <select id='status' name='status' className='form-select border p-2 mt-2'
                onChange={handleChange}>
                    <option value={''}>Selecione</option>
                    <option value={'EM_ANDAMENTO'}>Em Andamento</option>
                    <option value={'ARQUIVADO'}>Arquivado</option>
                    <option value={'FINALIZADO'}>Finalizado</option>
                </select>
            </div>

            <div className='col-lg-2 col-md-4'>
                <label htmlFor='estado'><strong>Estado</strong></label>
                <select id='estado' name='estado' className='form-select border p-2 mt-2'
                onChange={handleChange}>
                    <option value=''>Selecione</option>
                    {EstadosBrasileiros.map((estado) => (
                        <option key={estado.sigla} value={estado.sigla}>
                            {estado.sigla} - {estado.nome}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <button className='btn btn-sm btn-info border me-2'>Pesquisar</button>
        <button className='btn btn-sm btn-info border me-2'>Limpar Filtros</button>
    </div>
  )
}

export default Search
