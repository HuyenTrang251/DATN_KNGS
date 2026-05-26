// // import React, { useEffect, useState } from "react";
// // import { NavLink, useLocation } from "react-router-dom";
// // import "bootstrap/dist/css/bootstrap.min.css";
// // import "bootstrap-icons/font/bootstrap-icons.css";
// // import "./sidebar.scss";
// // // import { getUserLogined } from "../../../services/UserService";

// // function Sidebar({ isOpen, menuItems }) {
// //     const location = useLocation();
// //     const [activePath, setActivePath] = useState(location.pathname);
// //     const [userData, setUserData] = useState(null);

// //     // useEffect(() => {
// //     //     setActivePath(location.pathname);
// //     // }, [location]);

// //     // useEffect(() => {
// //     //     const FetchUserData = async () =>{
// //     //         const data = await getUserLogined();
// //     //         if (data) {
// //     //             setUserData({
// //     //                 img: data.img,          
// //     //                 name: data.name,       
// //     //             });
// //     //         } else {
// //     //             setUserData({ img: '', name: 'User' });
// //     //         }
// //     //     };
// //     //     FetchUserData();
// //     // }, []);

// //     const userImage = userData?.img;
// //     const userName = userData?.name;

// //     return(
// //         <>
// //         <nav className={`sidebar ${isOpen ? "open" : "closed"}`}>
// //         <div className="display-layout d-flex flex-column align-items-center mt-3">
// //             <img src={userImage? `http://localhost:3300/uploads/avatars/${userImage}` : "/image/avatar.jpg"} alt="avatar" className="rounded-circle mb-3" style={{width:'120px', height:'120px', objectFit:'auto', padding: '10px'}}></img>
// //             <h5>{userName}</h5>
// //         </div>
// //         <ul className="nav-options">
// //             {menuItems.map((item, index) => (
// //             <NavLink
// //                 to={item.path}
// //                 key={index}
// //                 className={`nav-option ${activePath === item.path ? "active" : ""}`}
// //             >
// //                 <i className={`${item.icon} nav-img`} />
// //                 <span className="nav-text">{item.label}</span>
// //             </NavLink>
// //             ))}
// //         </ul>
// //         </nav>
// //         </>
// //     )
// // }
// // export default Sidebar;

// import React, { useMemo } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import "./sidebar.scss";
// // Import useAuth để lấy dữ liệu người dùng toàn cục
// import { useAuth } from "../../contexts/AuthContext";

// function Sidebar({ isOpen, menuItems }) {
//     const location = useLocation();
//     const { user } = useAuth(); // Lấy thông tin user từ Context
//     // console.log("Dữ liệu user trong Sidebar:", user);

//     // --- LOGIC XỬ LÝ ẢNH (Giống hệt Header để đảm bảo hiển thị được) ---
//     const avatarUrl = useMemo(() => {
//         if (!user?.avatar) return "/image/avatar.jpg";

//         let fileName = user.avatar;

//         // Xử lý nếu dữ liệu bị dính định dạng JSON {"avatar":"img-xxx.png"}
//         if (typeof fileName === "string" && fileName.startsWith("{")) {
//             try {
//                 const parsed = JSON.parse(fileName);
//                 fileName = parsed.avatar;
//             } catch (e) {
//                 console.error("Lỗi parse avatar trong Sidebar:", e);
//             }
//         }

//         return `http://localhost:3300/uploads/avatars/${fileName}`;
//     }, [user?.avatar]);

//     return (
//         <>
//             <nav className={`sidebar ${isOpen ? "open" : "closed"}`}>
//                 <div className="display-layout d-flex flex-column align-items-center mt-3">
//                     {/* Hiển thị ảnh đại diện */}
//                     <img 
//                         src={avatarUrl} 
//                         alt="avatar" 
//                         className="rounded-circle mb-3 shadow-sm" 
//                         style={{ 
//                             width: '130px', 
//                             height: '130px', 
//                             objectFit: 'cover', // Đổi từ auto sang cover để ảnh không bị méo
//                             padding: '5px',
//                             border: '2px solid #eee'
//                         }}
//                         onError={(e) => { e.target.src = "/image/avatar.jpg"; }}
//                     />
                    
//                     {/* Hiển thị tên người dùng (full_name từ database) */}
//                     <h5 className="text-center px-1 fw-bold mt-2">
//                         {user?.name || "Đang tải..."} 
//                     </h5>
                    
//                     {/* Hiển thị Role nhỏ phía dưới nếu muốn (Tùy chọn) */}
//                     <small className="text-muted mb-3">
//                         {user?.role_id === 1 ? "Quản trị viên" : user?.role_id === 2 ? "Gia sư" : "Học viên"}
//                     </small>
//                 </div>

//                 <ul className="nav-options">
//                     {menuItems.map((item, index) => (
//                         <NavLink
//                             to={item.path}
//                             key={index}
//                             className={({ isActive }) => 
//                                 `nav-option ${isActive ? "active" : ""}`
//                             }
//                         >
//                             <i className={`${item.icon} nav-img`} />
//                             <span className="nav-text">{item.label}</span>
//                         </NavLink>
//                     ))}
//                 </ul>
//             </nav>
//         </>
//     );
// }

// export default Sidebar;

import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./sidebar.scss";
import { useAuth } from "../../contexts/AuthContext";
import axiosClient from "../../api/axiosClient";

function Sidebar({ isOpen, menuItems }) {
    const location = useLocation();
    const { user, setUser } = useAuth(); // Lấy setUser để cập nhật ảnh mới toàn cục
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const syncCurrentUser = async () => {
            if (!user?.id) return;

            try {
                const profile = await axiosClient.get("/auth/me");
                const normalizedUser = {
                    ...user,
                    ...profile,
                    id: profile.user_id || user.id,
                    name: profile.full_name || user.full_name || user.name,
                };

                setUser(normalizedUser);
                localStorage.setItem("user", JSON.stringify(normalizedUser));
            } catch (error) {
                console.error("Khong the dong bo thong tin user cho sidebar:", error);
            }
        };

        syncCurrentUser();
    }, [setUser, user?.id]);

    // --- LOGIC XỬ LÝ ẢNH HIỂN THỊ ---
    const avatarUrl = useMemo(() => {
        if (!user?.avatar) return "/image/avatar.jpg";
        let fileName = user.avatar;
        if (typeof fileName === "string" && fileName.startsWith("{")) {
            try {
                const parsed = JSON.parse(fileName);
                fileName = parsed.avatar;
            } catch (e) {
                console.error("Lỗi parse avatar:", e);
            }
        }
        return `http://localhost:3300/uploads/avatars/${fileName}`;
    }, [user?.avatar]);

    // --- XỬ LÝ UPLOAD ẢNH ---
    const handleTriggerUpload = () => {
        if (!isUploading) fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Kiểm tra định dạng
        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn file ảnh!");
            return;
        }

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            setIsUploading(true);
            // Gọi API upload avatar dùng chung của group users
            const res = await axiosClient.post("/users/upload-avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Sau khi upload thành công, BE trả về tên file mới
            const newAvatarName = res.filename;

            // Cập nhật Context để Header và các trang khác thay đổi theo
            const updatedUser = { ...user, avatar: newAvatarName };
            setUser(updatedUser);

            // Cập nhật cả LocalStorage để khi F5 không bị mất ảnh mới
            localStorage.setItem("user", JSON.stringify(updatedUser));

            alert("Cập nhật ảnh đại diện thành công!");
        } catch (error) {
            console.error("Lỗi upload:", error);
            alert("Không thể upload ảnh, vui lòng thử lại.");
        } finally {
            setIsUploading(false);
            e.target.value = null; // Reset input file
        }
    };

    return (
        <nav className={`sidebar ${isOpen ? "open" : "closed"}`}>
            <div className="display-layout d-flex flex-column align-items-center mt-3">
                {/* Vùng chứa ảnh đại diện có chức năng upload */}
                <div 
                    className={`avatar-upload-container ${isUploading ? 'loading' : ''}`}
                    onClick={handleTriggerUpload}
                    title="Click để đổi ảnh đại diện"
                >
                    <img 
                        src={avatarUrl} 
                        alt="avatar" 
                        className="sidebar-avatar-img rounded-circle shadow-sm" 
                        onError={(e) => { e.target.src = "/image/avatar.jpg"; }}
                    />
                    {/* Lớp phủ icon máy ảnh khi di chuột vào */}
                    <div className="avatar-overlay">
                        {isUploading ? (
                            <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                        ) : (
                            <i className="bi bi-camera-fill"></i>
                        )}
                    </div>
                </div>

                {/* Input file ẩn */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    style={{ display: "none" }} 
                />
                
                {/* Thông tin User */}
                {isOpen && (
                    <>
                        <div className="sidebar-user-name-row mt-3 mb-0 w-100 justify-content-center">
                            <h5 className="text-center px-1 fw-bold mb-0 text-truncate">
                                {user?.full_name || user?.name || "Người dùng"}
                            </h5>
                            {user?.role_id === 2 && Number(user?.is_verified) === 1 && (
                                <i className="bi bi-patch-check-fill sidebar-verified-icon" title="Gia sư đã được duyệt Tích xanh"></i>
                            )}
                        </div>
                        <small className="text-muted mb-3">
                            {user?.role_id === 1 ? "Quản trị viên" : user?.role_id === 2 ? "Gia sư" : "Học viên"}
                        </small>
                    </>
                )}
            </div>

            <ul className="nav-options">
                {menuItems.map((item, index) => (
                    <NavLink
                        to={item.path}
                        key={index}
                        className={({ isActive }) => `nav-option ${isActive ? "active" : ""}`}
                    >
                        <i className={`${item.icon} nav-img`} />
                        <span className="nav-text">{item.label}</span>
                    </NavLink>
                ))}
            </ul>
        </nav>
    );
}

export default Sidebar;


