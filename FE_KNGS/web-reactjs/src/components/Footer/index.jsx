import { Link } from "react-router-dom"
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./footer.scss"
function Footer() {
    return(
        <>
            <footer className="footercss pt-5 pb-2">
                <div className="container">
                    <div className="row footer-main-row">
                        <div className="text-dark col-12 col-lg-5 mb-4 pe-lg-4 footer-brand-column">
                            <div className="d-flex">
                                <img src="/image/logo_Htrang.png" alt="Logo" className="mb-3" style={{ maxWidth: "60px", borderRadius: '10px' }} />
                                <p className="ms-3 fw-semibold fos">
                                HTrang gia sư là nền tảng kết nối gia sư và học viên. 
                                Uy tín - Chất lượng - Chuyên nghiệp
                                </p>
                            </div>
                            <p className="pt-3 fos">Email: htrang@gmail.com</p>
                            <p className="fos">Điện thoại: 0987654321</p>
                            <p className="fos">Địa chỉ: Nguyễn Thiện Thuật - Mỹ Hào - Hưng Yên</p>
                        </div>

                        <div className="col-12 col-lg-7 footer-links-area">
                            <div className="row footer-links-row g-3">
                                <div className="col-4 footer-link-block">
                                    <h5 className="footer-title">Liên kết nhanh</h5>
                                    <ul className="list-unstyled fos footer-list">
                                    <li><Link to="/" className="text-dark text-decoration-none">Trang chủ</Link></li>
                                    <li><Link to="/khoa-hoc" className="text-dark text-decoration-none">Dịch vụ gia sư</Link></li>
                                    <li><Link to="/gia-su" className="text-dark text-decoration-none">Tìm gia sư</Link></li>
                                    <li><Link to="/dang-ky-lam-gia-su" className="text-dark text-decoration-none">Đăng ký làm gia sư</Link></li>
                                    <li><Link to="/lien-he" className="text-dark text-decoration-none">Liên hệ</Link></li>
                                    </ul>
                                </div>

                                <div className="col-4 footer-link-block">
                                    <h5 className="footer-title">Hỗ trợ</h5>
                                    <ul className="list-unstyled fos footer-list">
                                    <li><Link to="/" className="text-dark text-decoration-none">Chính sách bảo mật</Link></li>
                                    <li><Link to="/khoa-hoc" className="text-dark text-decoration-none">Điều khoản dịch vụ</Link></li>
                                    <li><Link to="/noi-quy-nhan-lop" className="text-dark text-decoration-none">Nội quy nhận lớp</Link></li>
                                    </ul>
                                </div>

                                <div className="col-4 footer-link-block">
                                    <h5 className="footer-title">Kết nối với HTrang</h5>
                                    <div className="d-flex footer-socials">
                                    <a href="https://facebook.com" className="me-3 footer-social-link"><i className="fab fa-facebook-f"></i></a>
                                    <a href="https://youtube.com" className="footer-social-link text-danger"><i className="fab fa-youtube"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-top border-dark" />

                    <p className="text-center mb-0">© 2025 Gia sư Htrang. All rights reserved.</p>
                </div>
            </footer>
        </>
    )
}

export default Footer


