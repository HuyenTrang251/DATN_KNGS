import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../LayoutAdmin/LayoutAdmin.scss"; 
import Sidebar from "../../components/Sidebar";

function LayoutUser({ HeaderRole, SidebarRole }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Mỗi lần đổi route, đảm bảo sidebar không bị ảnh hưởng
  }, [location]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <>
      <div className="admin-layout">
        <HeaderRole
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <div className="admin-content">
        <Sidebar isOpen={isSidebarOpen} menuItems={SidebarRole} />
          <div
            className={`main-content ${
              isSidebarOpen ? "with-sidebar" : "full-width"
            }`}
            >
            {console.log("Outlet Rendered")}
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default LayoutUser;