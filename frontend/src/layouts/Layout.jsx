import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Breadcrumbs from "../components/Breadcrumbs";
import "../components/Breadcrumbs.css";
import Sidebar from './Sidebar';
import Navbar from './Navbar';

function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="d-flex vh-100 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className="d-flex flex-column flex-grow-1" style={{ transition: 'all 0.3s ease' }}>
        <Navbar />
        <Breadcrumbs />
        <main className="flex-grow-1 p-4 bg-light overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
