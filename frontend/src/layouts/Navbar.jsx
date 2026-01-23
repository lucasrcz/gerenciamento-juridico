import { useEffect, useState } from 'react'
import { logout } from '../services/API'

function Navbar() {
    const [user, setUser] = useState({ nome: '', role: '' });

  useEffect(() => {
    const stored = localStorage.getItem('user_data');
    
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      console.log("Dados do usuário na Navbar:", parsedUser);
    }
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top bg-white shadow-sm px-4">
        <div className="d-flex container-fluid justify-content-between">
            <span className="navbar-text fw-bold">Gerenciamento de Processos Jurídicos</span>

            <div className="d-flex align-items-center gap-3">
                <span className="badge bg-warning text-dark px-3 py-2 rounded-3" style={{ fontSize: '15px' }}>{user.role}</span>

                <div className="dropdown">
                    <button type="button" 
                        className="btn btn-outline-dark rounded-3 dropdown-toggle d-flex align-items-center py-1" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false">
                        <i className="bi bi-person-circle me-3"></i>
                        <span className="me-2">{user.nome}</span>
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                            <a className="dropdown-item" href="#">
                            <i className="bi bi-gear me-2"></i>Editar Perfil</a>
                        </li>

                        <li>
                            <button className="dropdown-item" onClick={logout}>
                            <i className="bi bi-box-arrow-right me-2"></i> Sair</button>
                        </li>
                    </ul>
                </div>
                
            </div>
        </div>
    </nav>
  );
};

export default Navbar;