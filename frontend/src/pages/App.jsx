import { getFunction, postFunction } from "../services/APIService"

function App() {

  function ButtonGet() {
    getFunction()
    .then(data => console.log(data))
    .catch(err => console.log(err))
  }

  // function ButtonPost() {
  //   postFunction()
  //   .then(data => console.log(data))
  //   .catch(err => console.log(err))
  // }

  return (
    <>
      <h2>Gerenciamento Jurídico</h2>
      <div style={{padding: '10px'}}>
        <button onClick={ButtonGet}>Teste GET</button>
      </div>
      {/* <div style={{padding: '10px'}}>
        <button onClick={ButtonPost}>Teste POST</button>
      </div> */}
    </>
  )
}

export default App
