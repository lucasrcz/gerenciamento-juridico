import { postFunction  } from "../services/APIService"
import Navbar from "../components/Navbar"
import { Outlet } from "react-router-dom"

function App() {

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
            <button onClick={ButtonPost}>Adicionar requisição de teste (POST)</button>
          </div>
        <div className="container">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default App
