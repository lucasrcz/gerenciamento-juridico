import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
// import Footer from './Footer';

function Layout() {

  return (
    <div className="d-flex vh-100 overflow-hidden">
      <Sidebar />

      <div className="d-flex flex-column w-100">
        <Navbar />
        <main className="flex-grow-1 p-4 bg-light overflow-auto">
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default Layout;
