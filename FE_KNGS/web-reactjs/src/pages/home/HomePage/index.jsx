import { Link } from "react-router-dom"
import { Row, Col, Button } from 'react-bootstrap';
import "./home.scss"
import SlideShowHome from "../../../components/SlideShowHome";
import CardTutor from "../../../components/CardTutor";
import CommentTutor from "../../../components/CommentTutor";
import SignUp from "../../../components/SignUp";

function HomePage() {
    return(
        <>
            <div className="header-content">
                <div className="hero-copy">
                    <h1 className="hero-title">Gia Sư Online – Dạy Kèm Trực Tuyến</h1>
                    <p className="hero-subtitle">
                        Gia sư HTrang - Nơi gửi gắm niềm tin
                    </p>
                    <p className="hero-description">
                        Uy tín - Chất lượng - Chuyên nghiệp
                    </p>
                    <div className="hero-actions">
                        <Link className="btn text-white hero-action-button" to="/dang-ki">
                            Đăng ký học thử miễn phí
                        </Link>
                        <Link className="btn text-white hero-action-button" to="/dang-ki">
                            Đăng Ký Làm Gia Sư
                        </Link>
                    </div>
                </div>
            </div>
            <h3 className="text-center fs-2 text-dark my-5">Điểm khác biệt của gia sư HTrang</h3>
            <div className="mainContent1 mb-5">
                <Row className="text-center py-3 border">
                    <Col md={7}>
                        <Row className="text-left">
                            <Col md={6} className="p-3">
                            <h5 style={{color: '#056fa4', fontWeight: '550'}}>CHẤT LƯỢNG</h5>
                            <p>Gia sư giỏi, kinh nghiệm từ các trường TOP đầu. HTcon cung cấp thông tin hồ sơ rõ ràng, minh bạch.</p>
                            </Col>
                            <Col md={6} className="p-3 ps-5">
                            <h5 style={{color: '#056fa4', fontWeight: '550'}}>NHANH CHÓNG</h5>
                            <p>Chỉ 0-2 ngày để tìm gia sư giỏi phù hợp với đúng yêu cầu của gia đình.</p>
                            </Col>
                        </Row>
                        <Row className="text-left">
                            <Col md={6} className="p-3">
                            <h5 style={{color: '#056fa4', fontWeight: '550'}}>MIỄN PHÍ</h5>
                            <p>Miễn phí tư vấn, tìm và đối gia sư theo yêu cầu của Phụ huynh / Học sinh.</p>
                            </Col>
                            <Col md={6} className="p-3 ps-5">
                            <h5 style={{color: '#056fa4', fontWeight: '550'}}>ĐỘI NGŨ</h5>
                            <p>Đội ngũ Gia sư của HTcon đầy đủ gồm: Sinh viên, Giáo viên, Cử nhân, người nước ngoài giàu kinh nghiệm.</p>
                            </Col>
                        </Row>
                        <Row className="text-left">
                            <Col md={6} className="p-3">
                            <h5 style={{color: '#056fa4', fontWeight: '550'}}>HỌC PHÍ</h5>
                            <p>Học phí gia sư Tại nhà/Online 1 kèm 1 siêu ưu đãi chỉ từ 60k/h.</p>
                            </Col>
                            <Col md={6} className="p-3 ps-5">
                            <h5 style={{color: '#056fa4', fontWeight: '550'}}>HỌC THỬ</h5>
                            <p>Học thử 2 buổi để đánh giá chất lượng gia sư & mức độ phù hợp với học sinh.</p>
                            </Col>
                        </Row>
                    </Col>
                    <Col md={1}></Col>
                    <Col md={4}>
                    <div className="my-3 introduction-banner">
                        <Button variant="primary" className="introduction-banner-button">TÌM GIA SƯ NGAY</Button>
                    </div>
                    </Col>
                </Row>
            </div>
            
            <div className="container my-4">
                {/* <h2 className="text-center mb-5">Tìm gia sư theo môn học</h2> */}
                <SlideShowHome />
            </div>

            <div className="container my-4">
                <h2 className="text-center my-4">Đội ngũ gia sư HTrang</h2>
                <div className="row">
                    <div className="col-md-6 pe-3 pt-3">
                        <h3>Gia sư giáo viên</h3>
                        <p style={{fontSize: '20px'}}>Là các thầy, cô giáo tốt nghiệp ĐH sư phạm, hiện đang công tác tại các trường học, trung tâm dạy học, 
                            mở lớp tại nhà hoặc thầy cô dạy gia sư tự do…. Thầy cô với nhiều năm kinh nghiệm giảng dạy, áp dụng các phương pháp dạy học phù hợp với từng đối tượng học sinh, mang lại kết quả học tập tốt nhất.</p>
                    </div>
                    <div className="col-md-6">
                        <img src="/image/giaovien.jpg" alt='giaovien' className="img-fluid ps-5 rounded-pill"/>
                    </div>
                </div>
                <div className="row mt-5">
                    <div className="col-md-6 ps-3">
                        <img src="/image/sinhvien.jpg" alt='giaovien' className="img-fluid pe-5 rounded-pill"/>
                    </div>
                    <div className="col-md-6 ps-3 pt-3">
                        <h3>Gia sư sinh viên</h3>
                        <p style={{fontSize: '20px'}}>Gia sư tuyển chọn tại các trường TOP 1 ở Hà Nội với thành tích cao trong học tập, điểm thi đại học trên 8,5 điểm trở lên như ĐH Sư Phạm, ĐH Bách Khoa, ĐH Kinh Tế Quốc Dân, Ngoại Thương, ĐH Y Hà Nội, ĐH Quốc Gia Hà Nội…. Tùy vào vị trí khu vực sống của gia đình mà trung tâm sẽ giới thiệu các gia sư phù hợp, gần nhà để dạy lâu dài, ổn định.</p>
                    </div>
                </div>
            </div>
            <div className="container">
                <h2 className="text-center my-5">Danh sách gia sư nổi bật</h2>
                <div className="row d-flex">
                    <CardTutor />
                </div>
            </div>
            <CommentTutor />
            <div className="container">
                <div className="row">
                    <div className="col-md-5">
                        <img src="/image/gs.webp" className="w-90" alt="logo" />
                    </div>
                    <div className="col-md-7">
                        <SignUp />
                    </div>
                </div>
            </div>
        </>
    )
}
export default HomePage