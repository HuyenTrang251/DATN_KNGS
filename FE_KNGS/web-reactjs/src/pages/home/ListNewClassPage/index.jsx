import { useEffect, useState } from "react";
import { Container, Card, Col, Row, Button, Modal, Form } from "react-bootstrap";
import "./listClass.scss";
import { useAuth } from "../../../contexts/AuthContext";
import {
    getApprovedPosts as getApprovedPostsAPI,
    getAllSubjects as getAllSubjectsAPI,
    applyPost as applyPostAPI,
    getTutorApplications as getTutorApplicationsAPI
} from "../../../services/postApi";

function ListNewClassPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [applicationStatusByPost, setApplicationStatusByPost] = useState({});

    const [tinh, setTinh] = useState([]);
    const [huyen, setHuyen] = useState([]);
    const [selectedTinh, setSelectedTinh] = useState("");
    const [selectedHuyen, setSelectedHuyen] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("");
    const [selectedAudience, setSelectedAudience] = useState("");
    const [showLoginModal, setShowLoginModal] = useState(false);

    const methods = ["online", "offline", "all"];
    const audiences = ["student", "teacher", "all"];
    const audienceLabels = {
        student: "Sinh viên",
        teacher: "Giáo viên",
        all: "Giáo viên, sinh viên"
    };

    const normalizeText = (value) => String(value || "").trim().toLowerCase();
    const normalizeAddressText = (value) =>
        normalizeText(value).replace(/thành phố\s|tỉnh\s/gi, "");

    useEffect(() => {
        fetchPosts();
        fetchSubjects();
        fetch("https://provinces.open-api.vn/api/?depth=1")
            .then((res) => res.json())
            .then((data) => setTinh(data))
            .catch((error) => console.log("Lỗi gọi tỉnh:", error));
    }, []);

    useEffect(() => {
        if (Number(user?.role_id) === 2) {
            fetchTutorApplications();
        } else {
            setApplicationStatusByPost({});
        }
    }, [user]);

    useEffect(() => {
        if (selectedTinh) {
            const province = tinh.find((item) => item.name.includes(selectedTinh));
            if (province) {
                fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
                    .then((res) => res.json())
                    .then((data) => setHuyen(data.districts))
                    .catch((error) => console.log("Lỗi gọi huyện:", error));
            }
        } else {
            setHuyen([]);
        }
    }, [selectedTinh, tinh]);

    const fetchPosts = async () => {
        try {
            const res = await getApprovedPostsAPI();
            const data = res.data ? res.data : res;
            const safeData = Array.isArray(data) ? data : [];
            setPosts(safeData);
            setFilteredPosts(safeData);
        } catch (err) {
            console.error("Lỗi lấy danh sách lớp mới:", err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await getAllSubjectsAPI();
            const data = res.data ? res.data : res;
            const list = Array.isArray(data) ? data : (data.subjects || []);
            setSubjects(list);
        } catch (err) {
            console.error("Lỗi lấy môn học:", err);
        }
    };

    const fetchTutorApplications = async () => {
        try {
            const res = await getTutorApplicationsAPI();
            const data = res.data ? res.data : res;
            const safeData = Array.isArray(data) ? data : [];
            const nextStatusByPost = safeData.reduce((acc, item) => {
                if (item?.post_id && item?.apply_status) {
                    acc[item.post_id] = item.apply_status;
                }
                return acc;
            }, {});
            setApplicationStatusByPost(nextStatusByPost);
        } catch (err) {
            console.error("Lỗi lấy danh sách lớp đã nhận:", err);
            setApplicationStatusByPost({});
        }
    };

    const handleApplyClass = async (postId) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        if (Number(user.role_id) !== 2) {
            alert(
                "Bạn đang đăng nhập với tài khoản " +
                (user.role_id === 1 ? "Admin" : "Học viên") +
                ". Chỉ tài khoản Gia sư mới có thể nhận lớp!"
            );
            return;
        }

        if (applicationStatusByPost[postId] === "pending") {
            alert("Bạn đã nhận lớp này rồi, đang chờ học viên phản hồi.");
            return;
        }

        try {
            await applyPostAPI({ post_id: postId });
            setApplicationStatusByPost((prev) => ({
                ...prev,
                [postId]: "pending"
            }));
            alert("Đã gửi yêu cầu nhận lớp thành công! Vui lòng chờ học viên phản hồi.");
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Bạn đã ứng tuyển lớp này hoặc hệ thống đang bận.";
            alert(errorMessage);
        }
    };

    const handleSearch = () => {
        const selectedSubjectName = subjects.find(
            (subject) => String(subject.subject_id) === String(selectedSubject)
        )?.name;

        const results = posts.filter((post) => {
            const normalizedAddress = normalizeAddressText(post.address);

            if (selectedTinh && !normalizedAddress.includes(normalizeAddressText(selectedTinh))) {
                return false;
            }

            if (selectedHuyen && !normalizedAddress.includes(normalizeText(selectedHuyen))) {
                return false;
            }

            if (selectedSubjectName && normalizeText(post.subject_name) !== normalizeText(selectedSubjectName)) {
                return false;
            }

            if (
                selectedMethod &&
                selectedMethod !== "all" &&
                normalizeText(post.teaching_mode) !== normalizeText(selectedMethod)
            ) {
                return false;
            }

            if (
                selectedAudience &&
                selectedAudience !== "all" &&
                normalizeText(post.tutor_type) !== normalizeText(selectedAudience)
            ) {
                return false;
            }

            return true;
        });

        setFilteredPosts(results);
    };

    return (
        <Container className="mt-4 text-black pb-5 new-class-page">
            <div style={{ marginTop: "100px" }}></div>

            <div className="new-class-toolbar d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">DANH SÁCH LỚP MỚI</h5>
                <span className="text-muted">Có {filteredPosts.length} kết quả</span>
            </div>

            <div className="new-class-filters mb-4 bg-light p-3 rounded shadow-sm">
                <Row className="justify-content-center g-2">
                    <Col xs={12} sm={6} md={4} lg={2}>
                        <Form.Select
                            className="form-select-sm w-100"
                            value={selectedTinh}
                            onChange={(e) => setSelectedTinh(e.target.value)}
                        >
                            <option value="">-- Chọn tỉnh --</option>
                            {tinh.map((item) => (
                                <option key={item.code} value={item.name.replace(/^Thành phố\s|^Tỉnh\s/, "")}>
                                    {item.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col xs={12} sm={6} md={4} lg={2}>
                        <Form.Select
                            className="form-select-sm w-100"
                            value={selectedHuyen}
                            onChange={(e) => setSelectedHuyen(e.target.value)}
                        >
                            <option value="">-- Quận/Huyện --</option>
                            {huyen.map((item) => (
                                <option key={item.code} value={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col xs={12} sm={6} md={4} lg={2}>
                        <Form.Select
                            className="form-select-sm w-100"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option value="">-- Môn học --</option>
                            {subjects.map((item) => (
                                <option key={item.subject_id} value={item.subject_id}>
                                    {item.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col xs={12} sm={6} md={4} lg={2}>
                        <Form.Select
                            className="form-select-sm w-100"
                            value={selectedMethod}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                        >
                            <option value="">-- Hình thức --</option>
                            {methods.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col xs={12} sm={6} md={4} lg={2}>
                        <Form.Select
                            className="form-select-sm w-100"
                            value={selectedAudience}
                            onChange={(e) => setSelectedAudience(e.target.value)}
                        >
                            <option value="">-- Đối tượng --</option>
                            {audiences.map((item) => (
                                <option key={item} value={item}>
                                    {audienceLabels[item]}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col xs={12} sm={12} md={4} lg={1} className="d-flex justify-content-center">
                        <Button variant="primary" size="sm" className="w-100 fw-bold" onClick={handleSearch}>
                            Áp dụng
                        </Button>
                    </Col>
                </Row>
            </div>

            {filteredPosts.map((post) => (
                <Card key={post.post_id} className="new-class-card mb-3 p-3 shadow-sm border-0">
                    <Row className="align-items-center g-3">
                        <Col xl={2} md={3} className="text-center new-class-profile-column">
                            <div className="d-flex flex-column align-items-center">
                                <img
                                    src={post.avatar ? `http://localhost:3300/uploads/avatars/${post.avatar}` : "/image/avatar.jpg"}
                                    alt=""
                                    className="rounded-circle mb-2 new-class-avatar"
                                    style={{ width: "55px", height: "55px", objectFit: "cover", border: "1px solid #ddd" }}
                                    onError={(e) => {
                                        e.target.src = "/image/avatar.jpg";
                                    }}
                                />
                                <div className="fw-bold text-primary small">{post.full_name || "Phụ huynh"}</div>
                                <small className="text-muted new-class-created-at" style={{ fontSize: "11px" }}>
                                    {new Date(post.created_at).toLocaleDateString("vi-VN")}
                                </small>
                            </div>
                        </Col>
                        <Col xl={5} md={9} className="new-class-content-column">
                            <h6 className="mb-2 fw-bold text-dark new-class-title">
                                {post.subject_name} - {post.grade} - {Number(post.tuition_fee_per_session).toLocaleString()}đ/buổi
                            </h6>
                            <p className="mb-2 text-muted small new-class-address">
                                <i className="bi bi-geo-alt-fill text-danger"></i> {post.address}
                            </p>
                            <p className="mb-2 new-class-note" style={{ fontSize: "0.9rem" }}>
                                {post.note}
                            </p>
                            <div className="new-class-badges">
                                <span className="badge bg-success-subtle text-success me-1 border border-success-subtle">
                                    {post.teaching_mode}
                                </span>
                                <span className="badge bg-info-subtle text-info me-1 border border-info-subtle">
                                    {post.tutor_type === "teacher"
                                        ? "Giáo viên"
                                        : post.tutor_type === "student"
                                            ? "Sinh viên"
                                            : "Giáo viên, Sinh viên"}
                                </span>
                            </div>
                        </Col>
                        <Col xl={2} md={6} className="text-center new-class-metrics-column">
                            <div className="mb-1">
                                <span className="fw-bold text-danger">
                                    {(post.tuition_fee_per_session * post.sessions_per_week * 4).toLocaleString()}đ
                                </span>
                                <small className="text-muted"> /tháng</small>
                            </div>
                            <small className="text-muted d-block">{post.sessions_per_week} buổi/tuần</small>
                            <small className="text-muted">{Number(post.hours_per_session)}h/buổi</small>
                        </Col>
                        <Col xl={3} md={6} className="text-center new-class-fee-column">
                            <div className="mb-2">
                                <span className="fw-bold text-dark">Phí nhận lớp:</span>
                                <div className="fw-bold text-primary fs-6">
                                    {post.fee_receive ? `${Number(post.fee_receive).toLocaleString()}đ` : "Liên hệ"}
                                </div>
                            </div>
                            <div className="mt-2">
                                <Button
                                    variant={applicationStatusByPost[post.post_id] === "pending" ? "warning" : "primary"}
                                    className="w-100 fw-bold rounded-pill"
                                    size="sm"
                                    onClick={() => handleApplyClass(post.post_id)}
                                >
                                    {applicationStatusByPost[post.post_id] === "pending"
                                        ? "Đang chờ phản hồi"
                                        : "Nhận lớp"}
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
                <Modal.Body>
                    Bạn cần đăng nhập với tài khoản <b>Gia sư</b> để thực hiện chức năng nhận lớp.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={() => { window.location.href = "/dang-nhap"; }}>
                        Đăng nhập ngay
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ListNewClassPage;



