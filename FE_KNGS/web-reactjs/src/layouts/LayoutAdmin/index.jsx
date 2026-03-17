import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import HeaderAdmin from "../../components/Header/HeaderAdmin";
import SidebarAdmin from "../../components/Sidebar/SidebarAdmin";
import "./LayoutAdmin.scss";

function LayoutAdmin() {
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
        <HeaderAdmin
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
        />
        <div className="admin-content">
            <SidebarAdmin isOpen={isSidebarOpen} />
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
    )
}
export default LayoutAdmin