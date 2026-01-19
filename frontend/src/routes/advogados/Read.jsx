import { useEffect, useState } from 'react'
import { api } from '../../services/API';
import { Link, useParams } from 'react-router-dom';

function Read() {
  const [advogado, setAdvogado] = useState({})
  const { cpf } = useParams();

  useEffect(()=> {
    api.get('/auth/advogados/' + cpf)
      .then(res => setAdvogado(res.data))
      .catch(err => console.log(err));
  }, [cpf])

  return (
    <div className='d-flex w-100 vh-100 justify-content-center align-items-center bg-light'>
        <div className='w-50 border bg-white shadow px-5 pt-3 pb-5 rounded'>
            <h3>Informações do Advogado</h3>
            <br></br>
            <div className='mb-2'>
                <strong>Nome Completo:</strong> {advogado.nome}
            </div>
            <div className='mb-2'>
                <strong>CPF:</strong> {advogado.cpf}
            </div>
            <div className='mb-3'>
                <strong>Telefone:</strong> {advogado.telefone}
            </div>
            <div className='mb-3'>
                <strong>E-mail:</strong> {advogado.email}
            </div>
            <div className='mb-3'>
                <strong>Número OAB:</strong> {advogado.numeroOAB}/{advogado.seccional}
            </div>

            <Link to={`/update/${cpf}`} className='btn btn-success'>Editar</Link>
            <Link to="/advogados" className='btn btn-primary ms-3'>Voltar</Link>
        </div>
    </div>
  )
}

export default Read