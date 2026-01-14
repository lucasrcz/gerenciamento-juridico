import { BrowserRouter, Routes, Route } from "react-router-dom"
import Processos from "./routes/Processos"
import Create from "./routes/Create"
import Update from "./routes/Update"
import Read from "./routes/Read"
import Index from "./routes/Index"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Index />}></Route>
        <Route path='/processos/list' element={<Processos />}></Route>
        <Route path='/create' element={<Create />}></Route>
        <Route path='/update/:id' element={<Update />}></Route>
        <Route path='/read/:id' element={<Read />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
