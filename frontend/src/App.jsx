import { BrowserRouter, Routes, Route, Navigate, NavigationType } from "react-router-dom"
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
import ReadAdvogados from "./routes/advogados/Read"
import UpdateAdvogados from "./routes/advogados/Update"
import Partes from "./routes/partes/Partes"
import CreatePartes from "./routes/partes/Create"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to="/dashboard" replace />}/>

        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>}>

          {/* Dashboard */}
          <Route index path='/dashboard' element={<Dashboard />}/>

          {/* Procesos */}
          <Route path='processos' element={<Processos />}/>
          <Route path='processos/create' element={<CreateProcessos />}/>
          <Route path='processos/update/:id' element={<UpdateProcessos />}/>
          <Route path='processos/read/:id' element={<ReadProcessos />}/>

          {/* Advogados */}
          <Route path='advogados' element={<Advogados />}/>
          <Route path='advogados/create' element={<CreateAdvogados />}/>
          <Route path='advogados/update/:id' element={<UpdateAdvogados />}/>
          <Route path='advogados/read/:id' element={<ReadAdvogados />}/>

          {/* Partes */}
          <Route path='partes' element={<Partes />}/>
          <Route path='partes/create' element={<CreatePartes />}/>
        </Route>

        {/* Login */}
        <Route path='/login' element={<Login />}/>
      </Routes>
    </BrowserRouter>
  )
}


export default App
