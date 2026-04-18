import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./HeaderAdmin.scss";
import Cookies from "js-cookie";
import { useAuth } from "../../../contexts/AuthContext";
import { changePassword } from "../../../services/userApi";

function HeaderAdmin({ toggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // --- LOGIC XỬ LÝ ĐƯỜNG DẪN ẢNH (SỬA LỖI JSON TẠI ĐÂY) ---
  const avatarUrl = useMemo(() => {
    if (!user?.avatar) return "/image/avatar.jpg";

    let fileName = user.avatar;

    // Nếu lỡ dữ liệu bị lưu dạng JSON {"avatar":"img-xxx.png"} thì bóc tách lấy mỗi tên file
    if (typeof fileName === "string" && fileName.startsWith("{")) {
      try {
        const parsed = JSON.parse(fileName);
        fileName = parsed.avatar;
      } catch (e) {
        console.error("Lỗi parse avatar JSON:", e);
      }
    }

    // Ghép với URL Backend (Port 3300 như bạn cung cấp)
    return `http://localhost:3300/uploads/avatars/${fileName}`;
  }, [user?.avatar]);

  const handleLogout = () => {
    Cookies.remove("token");
    logout();
    navigate("/dang-nhap");
  };

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!passwordForm.currentPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (!passwordForm.newPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await changePassword({
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccess("Đổi mật khẩu thành công");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
      setTimeout(() => {
        setShowPasswordModal(false);
        setSuccess("");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Mật khẩu hiện tại không đúng");
    }
  };

  const roleName =
    user?.role_id === 1
      ? "Admin"
      : user?.role_id === 2
      ? "Tutor"
      : "Student";

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
          <div className="user-dropdown">
            <button
              className="avatar-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img
                src={avatarUrl}
                alt="Avatar"
                onError={(e) => { e.target.src = "/image/avatar.jpg"; }} // Fallback nếu link lỗi
              />
              {/* <span className="ms-2">{roleName}</span> */}
              <span className="ms-2">
                {user?.role_id === 1 ? 'Admin' : 
                user?.role_id === 2 ? 'Gia sư' : 
                user?.role_id === 3 ? 'Học viên' : ''}
              </span>
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
                    <i className="bi bi-lock me-2"></i>
                    Đổi mật khẩu
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Đăng xuất
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* MODAL ĐỔI MẬT KHẨU (Giữ nguyên) */}
      {showPasswordModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Đổi mật khẩu</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowPasswordModal(false)}
                />
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <div className="mb-3">
                  <label className="form-label">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    className="form-control"
                    id="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmNewPassword"
                    value={passwordForm.confirmNewPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Hủy
                </button>
                <button
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
  );
}

export default HeaderAdmin;