import { useEffect, useState } from 'react'
import { logout } from '../services/API'
import './Navbar.css';

function Navbar() {
    const [user, setUser] = useState({ nome: '', role: '' });

  useEffect(() => {
    const stored = localStorage.getItem('user_data');
    
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
    }
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-juris sticky-top px-4">
        <div className="d-flex container-fluid justify-content-between">
            <span className="navbar-text">Gerenciamento de Processos Jurídicos</span>

            <div className="d-flex align-items-center gap-3">
                <span className="badge badge-role">{user.role}</span>

                <div className="dropdown">
                    <button type="button" 
                        className="btn btn-user dropdown-toggle d-flex align-items-center py-1" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false">
                        <i className="bi bi-person-circle me-2"></i>
                        <span className="me-1">{user.nome}</span>
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                            <a className="dropdown-item" href="#">
                            <i className="bi bi-gear me-2"></i>Editar Perfil</a>
                        </li>

                        <li><hr className="dropdown-divider" /></li>

                        <li>
                            <button className="dropdown-item text-danger" onClick={logout}>
                            <i className="bi bi-box-arrow-right me-2"></i>Sair</button>
                        </li>
                    </ul>
                </div>
                
            </div>
        </div>
    </nav>
  );
};

export default Navbar;