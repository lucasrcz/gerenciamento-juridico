import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path) => location.pathname === path;

  const sidebarStyle = {
    width: collapsed ? '80px' : '220px',
    transition: 'width 0.3s ease',
  };

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={sidebarStyle}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        {!collapsed && <span className="fs-4 fw-bold overflow-hidden text-nowrap">Juris</span>}

        <button className="btn btn-dark border-0" onClick={toggleSidebar}>
          <i className="bi bi-list fs-4"></i>
        </button>
      </div>
      
      <hr />
      
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <Link to="/dashboard"
          className={`nav-link d-flex align-items-center ${isActive('/dashboard') ? 'active' : 'text-white'}`}
          aria-current={isActive('/dashboard') ? 'page' : undefined}>
            <i className="bi bi-house-door fs-4"></i>
            {!collapsed && <span className="ms-2">Dashboard</span>}
          </Link>
        </li>

        <li className='nav-item'>
          <Link to="/processos"
          className={`nav-link d-flex align-items-center ${isActive('/processos') ? 'active' : 'text-white'}`}
          aria-current={isActive('/processos') ? 'page' : undefined}>
            <i className="bi bi-folder fs-4"></i>
            {!collapsed && <span className="ms-2">Processos</span>}
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/advogados"
          className={`nav-link d-flex align-items-center ${isActive('/advogados') ? 'active' : 'text-white'}`}
          aria-current={isActive('/advogados') ? 'page' : undefined}>
            <i className="bi bi-person-lines-fill fs-4"></i>
            {!collapsed && <span className="ms-2">Advogados</span>}
          </Link>
        </li>

        <li className="nav-item">
          <a href="#" className="nav-link text-white d-flex align-items-center">
            <i className="bi bi-people-fill fs-4"></i>
            {!collapsed && <span className="ms-2">Partes</span>}
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
