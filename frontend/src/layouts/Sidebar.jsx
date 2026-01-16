import { useState } from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

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
          <Link to="/processos" className="nav-link d-flex text-white align-items-center" aria-current="page">
            <i className="bi bi-house-door fs-4"></i>
            {!collapsed && <span className="ms-2">Dashboard</span>}
          </Link>
        </li>

        <li className='nav-item'>
          <a className="nav-link text-white d-flex align-items-center"
          href="#submenuProcessos"
          data-bs-toggle="collapse"
          role='button'
          aria-expanded="false"
          aria-controls='submenuProcessos'
          >
            <div className="d-flex align-items-center">
            <i className="bi bi-folder fs-4"></i>
            {!collapsed && <span className="ms-2">Processos</span>}
            {!collapsed && <i className="bi bi-chevron-down transition ms-2" id="iconSetaCertidoes"></i>}
            </div>
          </a>

          <div className='collapse' id='submenuProcessos'>
            <ul className="list-unstyled ps-4">
              <li>
                <a className="nav-link text-white py-1" href="#">
                <i className="bi bi-file-earmark-text"></i>
                {!collapsed && <span className="ms-2">Lista de Processos</span>}
                </a>
              </li>

              <li>
                <a className="nav-link text-white py-1" href="#">
                <i className="bi bi-file-earmark-text"></i>
                {!collapsed && <span className="ms-2">Prazos</span>}
                </a>
              </li>

              <li>
                <a className="nav-link text-white py-1" href="#">
                <i className="bi bi-file-earmark-check"></i>
                {!collapsed && <span className="ms-2">Contratos</span>}
                </a>
              </li>

              <li>
                <a className="nav-link text-white py-1" href="#">
                <i className="bi bi-file-earmark-pdf"></i>
                {!collapsed && <span className="ms-2">Documentos</span>}
                </a>
              </li>
            </ul>
          </div>
        </li>

        <li className="nav-item">
          <a href="#" className="nav-link text-white d-flex align-items-center">
            <i className="bi bi-speedometer2 fs-4"></i>
            {!collapsed && <span className="ms-2">Advogados</span>}
          </a>
        </li>

        <li className="nav-item">
          <a href="#" className="nav-link text-white d-flex align-items-center">
            <i className="bi bi-table fs-4"></i>
            {!collapsed && <span className="ms-2">Partes</span>}
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
