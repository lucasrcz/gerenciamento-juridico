import { getFunction, postFunction  } from "../services/APIService"

function App() {

  function ButtonGet() {
    getFunction()
    .then(data => console.log(data))
    .catch(err => console.log(err))
  }

  function ButtonPost() {
    postFunction()
    .then(data => console.log(data))
    .catch(err => console.log(err))
  }

  return (
    <div style={{
      backgroundColor: '#1a1a1a',  // Fundo escuro
      color: '#ffffff',            // Texto branco
      minHeight: '100vh',          // Altura mínima da tela toda
      padding: '20px'
    }}>
      <h2>Gerenciamento Jurídico</h2>

      <div style={{padding: '10px'}}>
        <button onClick={ButtonGet}>Teste GET</button>
      </div>

      <div style={{padding: '10px'}}>
        <button onClick={ButtonPost}>Teste POST</button>
      </div>
    </div>
  )
}

export default App
