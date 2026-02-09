import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar d-flex flex-column text-white ${collapsed ? 'sidebar-collapsed d-flex align-items-center gap-2' : ''}`}>
      {/* Header com logo e toggle */}
      <div className="sidebar-header">
        <div className="d-flex align-items-center gap-2 ms-3">
          <img src="/logo.png" alt="Juris" className="sidebar-logo-img" />
          {!collapsed && <span className="fw-bold fs-5">Juris</span>}
        </div>
        <i
          className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-list'} sidebar-toggle`}
          role="button"
          onClick={onToggle}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        ></i>
      </div>

      {/* Menu© */}
      <nav className="flex-grow-1 py-2">
        <ul className="nav flex-column ms-3">
          <li className="nav-item">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : ''}`} title="Dashboard">
              <i className="bi bi-house-door sidebar-icon"></i>
              {!collapsed && <span className="sidebar-label">Dashboard</span>}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/processos" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : ''}`} title="Processos">
              <i className="bi bi-folder sidebar-icon"></i>
              {!collapsed && <span className="sidebar-label">Processos</span>}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/advogados" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : ''}`} title="Advogados">
              <i className="bi bi-person-badge sidebar-icon"></i>
              {!collapsed && <span className="sidebar-label">Advogados</span>}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/partes" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : ''}`} title="Partes">
              <i className="bi bi-people sidebar-icon"></i>
              {!collapsed && <span className="sidebar-label">Partes</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
      <footer className="d-flex align-items-center px-3 fixed-bottom ">
        {!collapsed && <span className="sidebar-label py-2">Juris © 2026</span>}
      </footer>
    </aside>
  );
}

export default Sidebar;
