import { NavLink, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./SidebarAdmin.scss";
import { useEffect, useState } from "react";
function SidebarAdmin({ isOpen }) {
    const location = useLocation();
    const [activePath, setActivePath] = useState(location.pathname);

    useEffect(() => {
        setActivePath(location.pathname);
    }, [location]);
    const menuItems = [
        {
        icon: "bi bi-person-circle",
        label: "Quản lý học viên",
        path: "/admin/quan-ly-nguoi-dung",
        },
        {
        icon: "bi bi-person-vcard",
        label: "Quản lý gia sư",
        path: "/admin/quan-ly-gia-su",
        },
        {
        icon: "bi bi-person-square",
        label: "Quản lý nhân viên",
        path: "/admin/quan-ly-hoc-vien",
        },
        {
        icon: "bi bi-card-heading",
        label: "Quản lý bài đăng",
        path: "/admin/quan-ly-bai-dang",
        },
        {
        icon: "bi bi-file-earmark-check-fill",
        label: "Quản lý đặt lịch",
        path: "/admin/quan-ly-dat-lich",
        },
        {
        icon: "bi bi-chat-right-quote-fill",
        label: "Quản lý lớp đã két nối",
        path: "/admin/quan-ly-phan-hoi",
        },
        {
        icon: "bi bi-chat-square-quote-fill",
        label: "Quản lý đánh giá",
        path: "/admin/quan-ly-danh-gia",
        },
        {
        icon: "bi bi-bar-chart-line-fill",
        label: "Tổng quan hệ thống",
        path: "/admin/tong-quan",
        },
    ];
    return (
        <>
        <nav className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <ul className="nav-options">
            {menuItems.map((item, index) => (
            <NavLink
                to={item.path}
                key={index}
                className={`nav-option ${activePath === item.path ? "active" : ""}`}
            >
                <i className={`${item.icon} nav-img`} />
                <span className="nav-text">{item.label}</span>
            </NavLink>
            ))}
        </ul>
        </nav>
        </>
    )
}
export default SidebarAdmin