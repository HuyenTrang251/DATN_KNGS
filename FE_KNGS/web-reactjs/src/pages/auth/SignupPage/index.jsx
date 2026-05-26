import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerStudent, registerTutor } from "../../../services/authApi";
import "./signup.scss";

function SignupPage() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "học viên"
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [error, setError] = useState("");

  // nhập input
  const handleInputChange = (e) => {

    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));

  };

  // chọn role
  const handleRoleChange = (e) => {

    setFormData((prev) => ({
      ...prev,
      role: e.target.value
    }));

  };

  // submit form
  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    if (!formData.full_name.trim()) {
      return setError("Họ tên không được để trống");
    }

    if (!formData.email.trim()) {
      return setError("Email không được để trống");
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      return setError("Email không hợp lệ");
    }

    if (!formData.phone.trim()) {
      return setError("Số điện thoại không được để trống");
    }

    if (!formData.password) {
      return setError("Mật khẩu không được để trống");
    }

    if (formData.password.length < 6) {
      return setError("Mật khẩu phải ít nhất 6 ký tự");
    }

    if (formData.password !== confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp");
    }

    try {

      const body = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirm_password: confirmPassword
      };

      let res;

      // chọn API theo role
      // if (formData.role === "học viên") {
      //   api = "http://localhost:3300/api/auth/register/student";
      // } else {
      //   api = "http://localhost:3300/api/auth/register/tutor";
      // }

      if (formData.role === "học viên") {
        res = await registerStudent(body);
      } else {
        res = await registerTutor(body);
      }

      // const res = await axios.post(api, body);

      alert(res.message);

      navigate("/dang-nhap");

    } catch (err) {

      setError(
        err.response?.message || "Đăng ký thất bại"
      );

    }

  };

  return (
    <>
      <div className="containerSignup d-flex justify-content-center align-items-center">
        <div className="card p-4" style={{ width: 500 }}>

          <h4 className="text-center mb-3" style={{ color: "#0c024c" }}>
            ĐĂNG KÝ
          </h4>

          <p className="me-3 fs-5">Nhập thông tin của bạn:</p>

          {/* chọn role */}
          <form className="d-flex mb-3">

            <div className="rdoRole">
              <input
                type="radio"
                id="tutor"
                name="role"
                value="gia sÆ°"
                checked={formData.role === "gia sÆ°"}
                onChange={handleRoleChange}
              />
              <label htmlFor="tutor" className="ms-2">
                Gia sư
              </label>
            </div>

            <div className="rdoRole">
              <input
                type="radio"
                id="student"
                name="role"
                value="học viên"
                checked={formData.role === "học viên"}
                onChange={handleRoleChange}
              />
              <label htmlFor="student" className="ms-2">
                Học viên
              </label>
            </div>

          </form>

          {/* form đăng ký */}
          <form className="form-SignUp" onSubmit={handleSubmit}>

            <div className="mb-4">
              <input
                type="text"
                id="full_name"
                className="form-control"
                placeholder="Họ tên"
                value={formData.full_name}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-4">
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-4">
              <input
                type="text"
                id="phone"
                className="form-control"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-4" style={{ position: "relative" }}>

              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                className="form-control"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleInputChange}
              />

              <i
                className={`bi ${passwordVisible ? "bi-eye-slash" : "bi-eye"}`}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  cursor: "pointer"
                }}
                onClick={() => setPasswordVisible(!passwordVisible)}
              ></i>

            </div>

            <div className="mb-4" style={{ position: "relative" }}>

              <input
                type={confirmPasswordVisible ? "text" : "password"}
                className="form-control"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <i
                className={`bi ${confirmPasswordVisible ? "bi-eye-slash" : "bi-eye"}`}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  cursor: "pointer"
                }}
                onClick={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
              ></i>

            </div>

            {error && <p className="text-danger">{error}</p>}

            <button type="submit" className="btnDK w-100 mb-3">
              Đăng ký
            </button>

            <div className="d-flex mb-2" style={{ marginLeft: "120px" }}>

              <p className="me-3">Bạn đã có tài khoản?</p>

              <Link to="/dang-nhap" style={{ textDecoration: "none" }}>
                Đăng nhập
              </Link>

            </div>

          </form>

        </div>
      </div>
    </>
  );
}

export default SignupPage;


