import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './pages/App.jsx'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// páginas
import Processos from './routes/Processos.jsx'
import NewProcesso from './routes/NewProcesso.jsx'

import './index.css'

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/processos",
        element: <Processos />
      },
      {
        path: "/processos/create",
        element: <NewProcesso />
      },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
