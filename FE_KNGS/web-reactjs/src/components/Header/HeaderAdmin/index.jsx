import {useNavigate } from "react-router-dom";
import {useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./HeaderAdmin.scss";
// import { getUserLogined, updatePassword } from "../../../../services/UserService";

function HeaderAdmin({ toggleSidebar }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [userData, setUserData] = useState([null]);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    // const img = localStorage.getItem("img");

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const handleLogout = () => {
        sessionStorage.removeItem('previousPage');
        localStorage.removeItem('id');
        navigate("/dang-nhap");
    };

    // useEffect(() => {
    //     const FetchUserData = async () =>{
    //         const data = await getUserLogined();
    //         if (data) {
    //             setUserData({
    //                 img: data.img,          
    //                 name: data.name,  
    //                 id: data.id,     
    //             });
    //         } else {
    //             setUserData({ img: '', name: 'User', id: null });
    //         }
    //     };
    //     FetchUserData();
    // }, []);

    // Xử lý thay đổi giá trị trong form đổi mật khẩu
    const handlePasswordChange = (e) => {
        const { id, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [id]: value }));
    };

    // Xử lý logic đổi mật khẩu
    const handleChangePassword = async () => {
        setError("");
        setSuccess("");
        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự");
            return;
        }
        try {
            await updatePassword(userData?.id, {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setSuccess("Đổi mật khẩu thành công");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });
            setTimeout(() => {
                setShowPasswordModal(false);
                setSuccess("");
            }, 2000); // Đóng modal sau 2 giây
        } catch (err) {
            setError("Đổi mật khẩu thất bại, vui lòng kiểm tra mật khẩu hiện tại");
            console.error("Lỗi updatePassword:", err);
        }
    };

    const userImage = userData?.img;

    return (
        <>
        <div className="header-admin">
        <div className="header-left">
            <i className="bi bi-list menu-icon" onClick={toggleSidebar} />
            <img className="logo" src="/image/logo_Htrang.png" alt="Logo" />
        </div>

        <div className="header-center">
            <form className="search-form">
            <input
                type="search"
                className="search-input"
                placeholder="Tìm kiếm thông tin ...."
            />
            <span className="search-icon">
                <i className="bi bi-search"></i>
            </span>
            </form>
        </div>

        <div className="header-right">
            {/* <Link className="nav-link" to="/theme">
            <i className="bi bi-palette"></i>
            </Link>
            <Link
            className="nav-link"
            to="https://github.com/HuyenTrang251"
            target="_blank"
            >
            <i className="bi bi-github"></i>
            </Link> */}

            {/* Dropdown Avatar */}
            <div className="user-dropdown">
            <button
                className="avatar-btn"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <img src={userImage ? `http://localhost:3300/uploads/${userImage}`: "/image/avatar.jpg"} alt="Avatar" />
                <i className="bi bi-caret-down-fill dropdown-icon ms-1"></i>
            </button>

            {showDropdown && (
                <ul className="dropdown-menu show">
                <li>
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            setShowDropdown(false);
                            setShowPasswordModal(true); 
                        }}
                    >
                        <i className="bi bi-lock me-2"></i>Đổi mật khẩu
                    </button>
                </li>
                <li>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i> Đăng xuất
                    </button>
                </li>
                </ul>
            )}
            </div>
        </div>
        </div>
        {/* Modal đổi mật khẩu, hiển thị chồng lên layout */}
        {showPasswordModal && (
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                aria-labelledby="changePasswordModalLabel"
                aria-modal="true"
                role="dialog"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="changePasswordModalLabel">
                                Đổi mật khẩu
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowPasswordModal(false)}
                                aria-label="Đóng"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}
                            <div className="mb-3">
                                <label htmlFor="currentPassword" className="form-label">
                                    Mật khẩu hiện tại
                                </label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Nhập mật khẩu hiện tại"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="newPassword" className="form-label">
                                    Mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="confirmNewPassword" className="form-label">
                                    Xác nhận mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="confirmNewPassword"
                                    value={passwordForm.confirmNewPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Xác nhận mật khẩu mới"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowPasswordModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleChangePassword}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}
export default HeaderAdmin