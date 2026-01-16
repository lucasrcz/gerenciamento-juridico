import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
// import Footer from './Footer';

function Layout() {

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />

      <div className="d-flex flex-column w-100">
        <Navbar />
        <main className="flex-grow-1 p-4 bg-light">
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default Layout;
