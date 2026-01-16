import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProtectedRoute from "./routes/ProtectedRoute"
import Layout from "./layouts/Layout"
import Processos from "./routes/processos/Processos"
import Create from "./routes/processos/Create"
import Update from "./routes/processos/Update"
import Read from "./routes/processos/Read"
import Login from "./routes/Login"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>}>

          {/* Procesos */}
          <Route index path='processos' element={<Processos />}/>
          <Route path='processos/create' element={<Create />}/>
          <Route path='update/:id' element={<Update />}/>
          <Route path='read/:id' element={<Read />}/>

          {/* Advogados */}
          {/* Partes */}
        </Route>

        {/* Login */}
        <Route path='/auth/login' element={<Login />}/>
      </Routes>
    </BrowserRouter>
  )
}


export default App
 