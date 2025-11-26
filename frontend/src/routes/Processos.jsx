import axios from "axios"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import './Processos.css'

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

const Processos = () => {

  const[processos, setProcessos] = useState([])

  const getProcessos = async() => {
    try {
      const response = await api.get(`/processos`)
      setProcessos(response.data.content || [])

    } catch (error) {
      console.log("Erro ao buscar processos:", error)
    }
  }

  useEffect(() => {
    getProcessos()
  }, [])

return (
    <div style={{padding: '10px'}}>
      <h1>Lista de Processos Jurídicos</h1>
      
      {processos.length === 0 ? (
        <div className="empty-state">
            <p>Nenhum processo encontrado.</p>
        </div>
      ) : (
        <div className="processo-list">
          {processos.map((processo) => (
            
            <div className="processo-card" key={processo.id}> 
              
              <div className="card-header">
                <h3>Processo: {processo.numero}</h3>
                <span className={`status-badge ${processo.status ? processo.status.toLowerCase() : ''}`}>
                    {processo.status}
                </span>
              </div>

              <div className="card-body">
                <p><strong>Estado:</strong> {processo.estado}</p>
                
                {processo.observacoes && (
                    <p className="obs"><strong>Obs:</strong> {processo.observacoes}</p>
                )}
                
                <div className="file-area">
                    <strong>Contrato: </strong>
                    {processo.contrato ? (
                        <span className="file-exists">Arquivo anexado</span> 
                    ) : (
                        <span className="file-missing">Sem contrato</span>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Processos
