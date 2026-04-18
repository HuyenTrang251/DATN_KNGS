// import { NavLink, useLocation } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import "./SidebarAdmin.scss";
// import { useEffect, useState } from "react";
// function SidebarAdmin({ isOpen }) {
//     const location = useLocation();
//     const [activePath, setActivePath] = useState(location.pathname);

//     useEffect(() => {
//         setActivePath(location.pathname);
//     }, [location]);
//     const menuItems = [
//         {
//         icon: "bi bi-person-circle",
//         label: "Quản lý học viên",
//         path: "/admin/quan-ly-hoc-vien",
//         },
//         {
//         icon: "bi bi-person-vcard",
//         label: "Quản lý gia sư",
//         path: "/admin/quan-ly-gia-su",
//         },
//         {
//         icon: "bi bi-person-square",
//         label: "Quản lý nhân viên",
//         path: "/admin/quan-ly-nhan-vien",
//         },
//         {
//         icon: "bi bi-card-heading",
//         label: "Quản lý bài đăng",
//         path: "/admin/quan-ly-bai-dang",
//         },
//         {
//         icon: "bi bi-file-earmark-check-fill",
//         label: "Quản lý đặt lịch",
//         path: "/admin/quan-ly-dat-lich",
//         },
//         {
//         icon: "bi bi-chat-right-quote-fill",
//         label: "Quản lý lớp đã kết nối",
//         path: "/admin/quan-ly-lop",
//         },
//         {
//         icon: "bi bi-chat-square-quote-fill",
//         label: "Quản lý đánh giá",
//         path: "/admin/quan-ly-danh-gia",
//         },
//         {
//         icon: "bi bi-bar-chart-line-fill",
//         label: "Tổng quan hệ thống",
//         path: "/admin/tong-quan",
//         },
//     ];
//     return (
//         <>
//         <nav className={`sidebar ${isOpen ? "open" : "closed"}`}>
//         <ul className="nav-options">
//             {menuItems.map((item, index) => (
//             <NavLink
//                 to={item.path}
//                 key={index}
//                 className={`nav-option ${activePath === item.path ? "active" : ""}`}
//             >
//                 <i className={`${item.icon} nav-img`} />
//                 <span className="nav-text">{item.label}</span>
//             </NavLink>
//             ))}
//         </ul>
//         </nav>
//         </>
//     )
// }
// export default SidebarAdmin

import React, { useEffect, useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./SidebarAdmin.scss";
import { useAuth } from "../../../contexts/AuthContext";
import { getAdminCounts } from "../../../services/userApi";

function SidebarAdmin({ isOpen }) {
    const location = useLocation();
    const { user, adminCounts } = useAuth();
    
    // State lưu số lượng chờ duyệt
    const [counts, setCounts] = useState({
        tutor_count: 0,
        post_count: 0,
        booking_count: 0,
        payment_count: 0,
        review_count: 0
    });

    // 1. Gọi API lấy số lượng khi Admin đăng nhập
    const fetchCounts = async () => {
        try {
            console.log("--- ADMIN SIDEBAR: FETCHING PENDING COUNTS ---");
            const data = await getAdminCounts();
            console.log("--- ADMIN SIDEBAR DATA:", data);
            setCounts(data || {});
        } catch (e) {
            console.error("Lỗi lấy badge sidebar:", e);
        }
    };

    useEffect(() => {
        // Chỉ gọi khi đúng là Admin (role_id = 1)
        if (user && user.role_id == 1) {
            fetchCounts();
            const interval = setInterval(fetchCounts, 60000); // Tự động cập nhật mỗi phút
            return () => clearInterval(interval);
        }
    }, [user]);

    // 2. Hàm lấy con số tương ứng với từng Menu
    const getBadgeCount = (label) => {
        const text = label.toLowerCase();
        if (text.includes("gia sư")) return adminCounts.tutor_count;
        if (text.includes("bài đăng")) return adminCounts.post_count;
        if (text.includes("đặt lịch")) return (Number(adminCounts.booking_count) || 0) + (Number(adminCounts.payment_count) || 0);
        return 0;
    };

    const menuItems = [
        { icon: "bi bi-person-circle", label: "Quản lý học viên", path: "/admin/quan-ly-hoc-vien" },
        { icon: "bi bi-person-vcard", label: "Quản lý gia sư", path: "/admin/quan-ly-gia-su" },
        { icon: "bi bi-person-square", label: "Quản lý nhân viên", path: "/admin/quan-ly-nhan-vien" },
        { icon: "bi bi-card-heading", label: "Quản lý bài đăng", path: "/admin/quan-ly-bai-dang" },
        { icon: "bi bi-file-earmark-check-fill", label: "Quản lý đặt lịch", path: "/admin/quan-ly-dat-lich" },
        { icon: "bi bi-chat-right-quote-fill", label: "Quản lý lớp đã kết nối", path: "/admin/quan-ly-lop" },
        { icon: "bi bi-chat-square-quote-fill", label: "Quản lý đánh giá", path: "/admin/quan-ly-danh-gia" },
        { icon: "bi bi-bar-chart-line-fill", label: "Tổng quan hệ thống", path: "/admin/tong-quan" },
    ];

    return (
        <nav className={`sidebar ${isOpen ? "open" : "closed"}`}>
            <ul className="nav-options">
                {menuItems.map((item, index) => {
                    const badgeCount = getBadgeCount(item.label);
                    return (
                        <NavLink
                            to={item.path}
                            key={index}
                            className={({ isActive }) => `nav-option ${isActive ? "active" : ""}`}
                        >
                            {/* Bọc icon vào wrapper để định vị Badge */}
                            <div className="icon-wrapper">
                                <i className={`${item.icon} nav-img`} />
                                {badgeCount > 0 && (
                                    <span className="sidebar-badge-new">{badgeCount}</span>
                                )}
                            </div>
                            <span className="nav-text">{item.label}</span>
                        </NavLink>
                    );
                })}
            </ul>
        </nav>
    );
}

export default SidebarAdmin;