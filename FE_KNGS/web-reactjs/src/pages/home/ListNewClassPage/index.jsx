import { useEffect, useState } from "react";
import { Container, Card, Col, Row, Button, Modal, Form } from "react-bootstrap";
import "./listClass.scss";

// Import các hàm API
import { 
    getApprovedPosts as getApprovedPostsAPI, 
    getAllSubjects as getAllSubjectsAPI,
    getMe as getMeAPI,
    applyPost as applyPostAPI 
} from "../../../services/postApi"; 

function ListNewClassPage() {
    const [posts, setPosts] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [tutorId, setTutorId] = useState(null);

    const [tinh, setTinh] = useState([]);
    const [huyen, setHuyen] = useState([]);
    const [selectedTinh, setSelectedTinh] = useState("");
    const [selectedHuyen, setSelectedHuyen] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("");
    const [selectedAudience, setSelectedAudience] = useState("");

    const methods = ["online", "offline", "all"];
    const audiences = ["student", "teacher", "all"];

    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        fetchPosts();
        fetchSubjects();
        fetchUser();
        fetch("https://provinces.open-api.vn/api/?depth=1")
            .then((res) => res.json())
            .then((data) => setTinh(data))
            .catch((error) => console.log("Lỗi gọi tỉnh: ", error));
    }, []);

    useEffect(() => {
        if (selectedTinh) {
            const province = tinh.find(t => t.name.includes(selectedTinh));
            if (province) {
                fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
                    .then((res) => res.json())
                    .then((data) => setHuyen(data.districts))
                    .catch((error) => console.log("Lỗi gọi huyện: ", error));
            }
        } else {
            setHuyen([]);
        }
    }, [selectedTinh, tinh]);

    const fetchPosts = async () => {
        try {
            const data = await getApprovedPostsAPI();
            setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi lấy posts:", err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const data = await getAllSubjectsAPI();
            setSubjects(Array.isArray(data) ? data : (data.subjects || []));
        } catch (err) {
            console.error("Lỗi lấy subjects:", err);
        }
    };

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const data = await getMeAPI(token);
            setTutorId(data.user_id);
        } catch (err) {
            console.error("Lỗi lấy user:", err);
        }
    };

    const handleApplyClass = async (postId) => {
        const token = localStorage.getItem("token");
        if (!token || !tutorId) {
            setShowLoginModal(true);
            return;
        }
        try {
            await applyPostAPI({ post_id: postId, tutor_id: tutorId, status: 'pending' }, token);
            alert("Đã gửi yêu cầu Nhận lớp, vui lòng chờ học viên phản hồi.");
        } catch (err) {
            alert(err.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu.");
        }
    };

    return (
        <Container className="mt-4 text-black pb-5">
            <div style={{ marginTop: '100px' }}></div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">DANH SÁCH LỚP MỚI</h5>
                <span className="text-muted">Có {posts.length} kết quả</span>
            </div>

            {/* BỘ LỌC - ĐÃ CĂN GIỮA VÀ ĐỀU NHAU */}
            <div className="mb-4 bg-light p-3 rounded shadow-sm">
                <Row className="justify-content-center g-2">
                    <Col xs={12} sm={6} md={2}>
                        <Form.Select 
                            className="form-select-sm w-100"
                            value={selectedTinh}
                            onChange={(e) => setSelectedTinh(e.target.value)}
                        >
                            <option value="">-- Chọn tỉnh --</option>
                            {tinh.map(t => <option key={t.code} value={t.name.replace(/^Thành phố\s|^Tỉnh\s/, '')}>{t.name}</option>)}
                        </Form.Select>
                    </Col>

                    <Col xs={12} sm={6} md={2}>
                        <Form.Select 
                            className="form-select-sm w-100"
                            value={selectedHuyen}
                            onChange={(e) => setSelectedHuyen(e.target.value)}
                        >
                            <option value="">-- Quận/Huyện --</option>
                            {huyen.map(h => <option key={h.code} value={h.name}>{h.name}</option>)}
                        </Form.Select>
                    </Col>

                    <Col xs={12} sm={6} md={2}>
                        <Form.Select 
                            className="form-select-sm w-100"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option value="">-- Môn học --</option>
                            {subjects.map((s) => (
                                <option key={s.subject_id} value={s.subject_id}>{s.name}</option>
                            ))}
                        </Form.Select>
                    </Col>

                    <Col xs={12} sm={6} md={2}>
                        <Form.Select 
                            className="form-select-sm w-100"
                            value={selectedMethod}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                        >
                            <option value="">-- Hình thức --</option>
                            {methods.map((m) => <option key={m} value={m}>{m}</option>)}
                        </Form.Select>
                    </Col>

                    <Col xs={12} sm={6} md={2}>
                        <Form.Select 
                            className="form-select-sm w-100"
                            value={selectedAudience}
                            onChange={(e) => setSelectedAudience(e.target.value)}
                        >
                            <option value="">-- Đối tượng --</option>
                            {audiences.map((a) => <option key={a} value={a}>{a}</option>)}
                        </Form.Select>
                    </Col>

                    <Col xs={12} sm={12} md={1} className="d-flex justify-content-center">
                        <Button variant="primary" size="sm" className="w-100 fw-bold">Áp dụng</Button>
                    </Col>
                </Row>
            </div>

            {/* DANH SÁCH CARD */}
            {posts.map((post) => (
                <Card key={post.post_id} className="mb-3 p-3 shadow-sm border-0">
                    <Row className="align-items-center">
                        <Col md={2} className="text-center">
                            <div className="d-flex flex-column align-items-center">
                                <img
                                    src={post.avatar ? `http://localhost:5000/uploads/${post.avatar}` : "/image/avatar.jpg"}
                                    alt=""
                                    className="rounded-circle mb-2"
                                    style={{ width: "55px", height: "55px", objectFit: "cover", border: '1px solid #ddd' }}
                                />
                                <div className="fw-bold text-primary small">{post.full_name || "Phụ huynh"}</div>
                                <small className="text-muted" style={{ fontSize: '11px' }}>
                                    {new Date(post.created_at).toLocaleDateString('vi-VN')}
                                </small>
                            </div>
                        </Col>

                        <Col md={6}>
                            <h6 className="mb-2 fw-bold text-dark">
                                {post.subject_name} - {post.grade} - {Number(post.tuition_fee_per_session).toLocaleString()}đ/buổi
                            </h6>
                            <p className="mb-2 text-muted small">
                                <i className="bi bi-geo-alt-fill text-danger"></i> {post.address}
                            </p>
                            <p className="mb-2" style={{ fontSize: "0.9rem" }}>{post.note}</p>
                            <div>
                                <span className="badge bg-success-subtle text-success me-1 border border-success-subtle">{post.teaching_mode}</span>
                                <span className="badge bg-info-subtle text-info me-1 border border-info-subtle">{post.tutor_type}</span>
                            </div>
                        </Col>

                        <Col md={2} className="text-center">
                            <div className="mb-1">
                                <span className="fw-bold text-danger">
                                    {(post.tuition_fee_per_session * post.sessions_per_week * 4).toLocaleString()}đ
                                </span>
                                <small className="text-muted"> /tháng</small>
                            </div>
                            <small className="text-muted d-block">
                                {post.sessions_per_week} buổi/tuần
                            </small>
                            {/* XỬ LÝ SỐ GIỜ: Nếu là 2.00 sẽ hiện 2h, nếu 1.5 sẽ hiện 1.5h */}
                            <small className="text-muted">
                                {Number(post.hours_per_session)}h/buổi
                            </small>
                        </Col>

                        {/* <Col md={2} className="text-center">
                            <Button
                                variant="primary"
                                className="w-100 fw-bold rounded-pill"
                                size="sm"
                                onClick={() => handleApplyClass(post.post_id)}
                            >
                                Nhận lớp
                            </Button>
                            <div className="mt-2">
                                <small className="text-success fw-bold" style={{ fontSize: '14px' }}>Phí nhận lớp: Liên hệ</small>
                            </div>
                        </Col> */}

                        {/* Cột phí nhận lớp (Cột cuối cùng trong Card) */}
                        <Col md={2} className="text-center">
                            <div className="mb-2">
                                <span className="fw-bold text-dark">Phí nhận lớp:</span>
                                <div className="fw-bold text-primary fs-6">
                                    {/* Kiểm tra nếu có dữ liệu từ bảng offer thì hiển thị, không thì để 'Liên hệ' */}
                                    {post.fee_receive 
                                        ? `${Number(post.fee_receive).toLocaleString()}đ` 
                                        : "Liên hệ"}
                                </div>
                            </div>

                            {/* Hiển thị phần trăm hỗ trợ nợ phí nếu có */}
                            {post.support > 0 && (
                                <small className="text-success d-block fw-bold" style={{ fontSize: '14px' }}>
                                    Hỗ trợ nợ phí {post.support}%
                                </small>
                            )}

                            <div className="mt-2">
                                <Button
                                    variant="primary"
                                    className="w-100 fw-bold rounded-pill"
                                    size="sm"
                                    onClick={() => handleApplyClass(post.post_id)}
                                >
                                    Nhận lớp
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card>
            ))}

            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Yêu cầu đăng nhập</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn cần đăng nhập với tài khoản <b>Gia sư</b> để thực hiện chức năng nhận lớp.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLoginModal(false)}>Đóng</Button>
                    <Button variant="primary" onClick={() => window.location.href = "/dang-nhap"}>Đăng nhập ngay</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ListNewClassPage;