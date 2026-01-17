import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./routes/Login"
import ProtectedRoute from "./routes/ProtectedRoute"
import Layout from "./layouts/Layout"
import Dashboard from "./routes/dashboard/Dashboard"
import Processos from "./routes/processos/Processos"
import CreateProcessos from "./routes/processos/Create"
import ReadProcessos from "./routes/processos/Read"
import UpdateProcessos from "./routes/processos/Update"
import Advogados from "./routes/advogados/Advogados"
import CreateAdvogados from "./routes/advogados/Create"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>}>
          <Route index path='/dashboard' element={<Dashboard />}/>

          {/* Procesos */}
          <Route path='processos' element={<Processos />}/>
          <Route path='processos/create' element={<CreateProcessos />}/>
          <Route path='update/:id' element={<UpdateProcessos />}/>
          <Route path='read/:id' element={<ReadProcessos />}/>

          {/* Advogados */}
          <Route path='advogados' element={<Advogados />}/>
          <Route path='advogados/create' element={<CreateAdvogados />}/>

          {/* Partes */}
        </Route>

        {/* Login */}
        <Route path='/auth/login' element={<Login />}/>
      </Routes>
    </BrowserRouter>
  )
}


export default App
 