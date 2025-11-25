import { getFunction, postFunction  } from "../services/APIService"
import Navbar from "../components/Navbar"
import { Outlet } from "react-router-dom"

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
    <>
      <div className="App">
        <Navbar />
        <div style={{padding: '10px'}}>
        <button onClick={ButtonGet}>Teste GET</button>
      </div>

      <div style={{padding: '10px'}}>
        <button onClick={ButtonPost}>Teste POST</button>
      </div>
        <div className="container">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default App
