import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const AdminLayout = () => (
  <div className="admin-layout">
    <Sidebar />
    <div className="admin-main">
      <Header />
      <main className="content-area">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AdminLayout;
