import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Cookies from "js-cookie";
import { login  as loginAPI } from "../services/authApi";
import { useAuth } from "./../contexts/AuthContext";
import "../pages/home/HomePage/home.scss";

function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const setEmailHandler = (event) => {
    setEmail(event.target.value);
  };

  const setPasswordHandler = (event) => {
    setPassword(event.target.value);
  };

  // const handleLogin = async (event) => {
  //   event.preventDefault();

  //   if (!email || !password) {
  //     alert("Vui lòng nhập email và mật khẩu");
  //     return;
  //   }

  //   try {

  //     setLoading(true);

  //     const res = await loginAPI({
  //       email: email,
  //       password: password
  //     });

  //     const data = res.data;

  //     // lưu token
  //     Cookies.set("token", data.token, {
  //       expires: 1,
  //       path: "/"
  //     });

  //     // lưu user
  //     login(data.user);

  //     // localStorage.setItem("user", JSON.stringify(data.user));

  //     const role = data.user.role_id;
      
  //     // redirect theo role
  //     if (role === 1) {
  //       navigate("/admin");
  //     }
  //     else if (role === 2) {
  //       navigate("/tutor");
  //     }
  //     else if (role === 3) {
  //       navigate("/student");
  //     }
  //     else {
  //       alert("Không có quyền truy cập");
  //     }

  //   } catch (error) {
  //     console.error(error);
  //     alert(
  //       error.response?.data?.message ||
  //       "Đăng nhập thất bại"
  //     );
  //   } finally {

  //     setLoading(false);

  //   }
  // };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      alert("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      setLoading(true);

      // Gọi API
      const res = await loginAPI({
        email: email,
        password: password
      });

      // VÌ ĐÃ CÓ INTERCEPTOR, 'res' CHÍNH LÀ DỮ LIỆU CẦN THIẾT
      // Bạn có thể gán thẳng hoặc đổi tên biến cho dễ hiểu
      const data = res; 

      if (data && data.token) {
        // lưu token vào Cookie
        Cookies.set("token", data.token, {
          expires: 1,
          path: "/"
        });

        // lưu user vào Context và LocalStorage
        login(data.user);

        const role = data.user.role_id;
        
        // redirect theo role
        if (role === 1) navigate("/admin");
        else if (role === 2) navigate("/tutor");
        else if (role === 3) navigate("/student");
        else alert("Không có quyền truy cập");

      } else {
        alert("Phản hồi từ server không hợp lệ");
      }

    } catch (error) {
      console.error(error);
      // Xử lý lỗi cũng cần gọn hơn vì interceptor có thể đã xử lý một phần
      alert(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <section className="sectionLogin">
        <div className="containerLogin d-flex justify-content-center align-items-center">
          <div className="card p-4" style={{ width: 600 }}>
            <img
              src="/image/logo_Htrang.png"
              alt="logo"
              className="mx-auto my-3"
              style={{ width: "65px" }}
            />
            <h4 className="text-center mb-3" style={{ color: "black" }}>
              Xin chào!
            </h4>
            <p className="text-center mb-5" style={{ color: "#333" }}>
              Đăng nhập để tiếp tục
            </p>

            <form className="form-Login" onSubmit={handleLogin}>

              <div className="mb-4">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={setEmailHandler}
                />
              </div>

              <div className="mb-4" style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Mật khẩu"
                  required
                  value={password}
                  onChange={setPasswordHandler}
                />

                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "70px",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                  }}
                  onClick={togglePasswordVisibility}
                ></i>
              </div>

              <div className="d-flex mb-4">
                <input
                  type="checkbox"
                  id="cbox"
                  style={{
                    width: "20px",
                    marginLeft: "55px",
                    marginRight: "10px",
                  }}
                />
                <label htmlFor="cbox">Ghi nhớ</label>

                <Link
                  to="/quen-mat-khau"
                  style={{ marginLeft: "230px", textDecoration: "none" }}
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <button className="btnDN mb-3" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <div className="d-flex" style={{ marginLeft: "150px" }}>
                <p className="me-3">Bạn chưa có tài khoản?</p>

                <Link to="/dang-ki" style={{ textDecoration: "none" }}>
                  Đăng kí
                </Link>
              </div>

            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default Login;