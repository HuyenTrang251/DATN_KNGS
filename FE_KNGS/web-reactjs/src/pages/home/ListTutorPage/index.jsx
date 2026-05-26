import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Container, Badge } from "react-bootstrap";
import "./listTutor.scss";

// Import Component dùng chung
import CardTutor from "../../../components/CardTutor"; 

// Import các service
import { getPublicTutors } from "../../../services/tutorApi";
import { getAllSubjects } from "../../../services/subjectApi";
import { createBooking } from "../../../services/bookingApi";
import { useAuth } from "../../../contexts/AuthContext";

function ListTutorPage() {
    const { user } = useAuth(); // Thông tin học viên đang đăng nhập

    // --- State Dữ liệu ---
    const [tutors, setTutors] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filteredTutors, setFilteredTutors] = useState([]);

    // --- State Tìm kiếm ---
    const [tinh, setTinh] = useState([]);
    const [huyen, setHuyen] = useState([]);
    const [selectedTinh, setSelectedTinh] = useState("");
    const [selectedHuyen, setSelectedHuyen] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("");
    const [selectedAudience, setSelectedAudience] = useState("");

    const methods = ["online", "offline", "all"];
    const audiences = ["student", "teacher", "all"];
    const audienceLabels = {
        student: "Sinh viên",
        teacher: "Giáo viên",
        all: "Giáo viên, sinh viên"
    };

    // --- State Modals ---
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedTutor, setSelectedTutor] = useState(null);

    // --- State Form Mời dạy ---
    const [bookingForm, setBookingForm] = useState({
        tutor_subject_level_id: "",
        hours_per_session: 2,
        sessions_per_week: 2,
        teaching_mode: "offline"
    });

    const BASE_URL = "http://localhost:3300";

    const normalizeText = (value) => String(value || "").trim().toLowerCase();

    const normalizeAddressText = (value) => normalizeText(value).replace(/thành phố\s|tỉnh\s/gi, "");

    const matchesAddress = (item) => {
        const addressPool = [item?.home_address, ...(item?.locations || [])]
            .filter(Boolean)
            .map(normalizeAddressText);

        if (selectedTinh && !addressPool.some((address) => address.includes(normalizeAddressText(selectedTinh)))) {
            return false;
        }

        if (selectedHuyen && !addressPool.some((address) => address.includes(normalizeText(selectedHuyen)))) {
            return false;
        }

        return true;
    };

    const getTutorAudience = (item) => {
        if (item?.audience) return normalizeText(item.audience);

        const education = normalizeText(item?.education);
        if (education.includes("sinh viên") || education.includes("sinh vien")) {
            return "student";
        }

        return "teacher";
    };

    // ================== 1. LOAD DỮ LIỆU BAN ĐẦU ==================
    useEffect(() => {
        const fetchTutors = async () => {
            try {
                const res = await getPublicTutors();
                // Tùy vào axiosClient, nếu trả về res.data thì lấy res.data
                const data = res.data ? res.data : res;
                setTutors(Array.isArray(data) ? data : []);
                setFilteredTutors(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Lỗi lấy danh sách gia sư:", error);
            }
        };
        fetchTutors();
        fetchSubjects();

        // Load Tỉnh/Thành phố
        fetch("https://provinces.open-api.vn/api/?depth=1")
            .then((res) => res.json())
            .then((data) => setTinh(data))
            .catch((err) => console.log("Lỗi gọi tỉnh:", err));
    }, []);

    // Load Quận/Huyện khi Tỉnh thay đổi
    useEffect(() => {
        if (selectedTinh) {
            const province = tinh.find(t => t.name.replace(/^Thành phố\s|^Tỉnh\s/, '') === selectedTinh);
            if (province) {
                fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
                    .then((res) => res.json())
                    .then((data) => setHuyen(data.districts))
                    .catch((err) => console.log("Lỗi gọi huyện:", err));
            }
        } else {
            setHuyen([]);
        }
    }, [selectedTinh, tinh]);

    const fetchSubjects = async () => {
        try {
            const data = await getAllSubjects();
            setSubjects(Array.isArray(data) ? data : (data.subjects || []));
        } catch (err) {
            console.error("Lỗi lấy subjects:", err);
        }
    };

    // ================== 2. XỬ LÝ LOGIC TÌM KIẾM ==================
    const handleSearch = () => {
        const selectedSubjectName = subjects.find((subject) => String(subject.subject_id) === String(selectedSubject))?.name;

        const results = tutors.filter((item) => {
            if (!matchesAddress(item)) {
                return false;
            }

            if (selectedSubjectName) {
                const hasSubject = (item?.subject_details || []).some((subject) =>
                    normalizeText(subject.subject_name) === normalizeText(selectedSubjectName)
                );

                if (!hasSubject) {
                    return false;
                }
            }

            if (selectedMethod && selectedMethod !== "all") {
                if (normalizeText(item?.teaching_mode) !== normalizeText(selectedMethod)) {
                    return false;
                }
            }

            if (selectedAudience && selectedAudience !== "all") {
                if (getTutorAudience(item) !== normalizeText(selectedAudience)) {
                    return false;
                }
            }

            return true;
        });

        setFilteredTutors(results);
    };

    // ================== 3. XỬ LÝ MODALS ==================
    const handleViewDetail = (tutor) => {
        setSelectedTutor(tutor);
        setShowDetailModal(true);
    };

    const handleOpenInvite = (tutor) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        if (user.role_id !== 3) {
            alert("Chỉ tài khoản Học viên mới có thể Mời dạy!");
            return;
        }
        setSelectedTutor(tutor);
        setBookingForm({
            tutor_subject_level_id: tutor.subject_details?.[0]?.id || "",
            hours_per_session: 2,
            sessions_per_week: 2,
            teaching_mode: "offline"
        });
        setShowDetailModal(false);
        setShowBookingModal(true);
    };

    const handleBookingNumberChange = (field, value) => {
        const digitsOnly = String(value || "").replace(/\D/g, "").slice(0, 2);

        setBookingForm((prev) => ({
            ...prev,
            [field]: digitsOnly
        }));
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        // Kiểm tra nếu ID môn học chưa được chọn hoặc bị lỗi
        if (!bookingForm.tutor_subject_level_id) {
            alert("Vui lòng chọn môn học muốn đăng ký dạy!");
            return;
        }

        if (!bookingForm.hours_per_session || !bookingForm.sessions_per_week) {
            alert("Vui lòng nhập số giờ/buổi và số buổi/tuần từ 1 đến 99.");
            return;
        }

        try {
            const payload = {
                tutor_id: selectedTutor.tutor_id,
                tutor_subject_level_id: Number(bookingForm.tutor_subject_level_id),
                hours_per_session: Number(bookingForm.hours_per_session),
                sessions_per_week: Number(bookingForm.sessions_per_week),
                teaching_mode: bookingForm.teaching_mode
            };

            await createBooking(payload);
            alert("Đã gửi lời mời dạy thành công!");
            setShowBookingModal(false);
        } catch (error) {
            // Lấy thông tin lỗi cụ thể từ backend trả về
            const errorMessage = error.response?.data?.error || error.response?.data?.message || "Lỗi không xác định";
            alert("Gửi yêu cầu thất bại: " + errorMessage);
            console.error("Lỗi chi tiết:", error.response?.data);
        }
    };

    const translateDay = (day) => {
        const d = { Monday: "Thứ 2", Tuesday: "Thứ 3", Wednesday: "Thứ 4", Thursday: "Thứ 5", Friday: "Thứ 6", Saturday: "Thứ 7", Sunday: "Chủ nhật" };
        return d[day] || day;
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        const parts = timeStr.split(':');
        const hour = parts[0];
        const minute = parts[1];

        // Nếu phút là 00 thì chỉ hiện giờ + h (ví dụ: 14h)
        if (minute === '00' || minute === '0') {
            return `${parseInt(hour)}h`; 
        }
        // Nếu có phút lẻ thì hiện giờ + h + phút (ví dụ: 14h30)
        return `${parseInt(hour)}h${minute}`;
    };

    return (
        <Container className="list-tutor mt-5 pt-5 pb-5">

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">DANH SÁCH GIA SƯ</h5>
                <span className="text-muted">Có {filteredTutors.length} kết quả</span>
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
                            {audiences.map((a) => <option key={a} value={a}>{audienceLabels[a]}</option>)}
                        </Form.Select>
                    </Col>

                    <Col xs={12} sm={12} md={1} className="d-flex justify-content-center">
                        <Button variant="primary" size="sm" className="w-100 fw-bold" onClick={handleSearch}>Áp dụng</Button>
                    </Col>
                </Row>
            </div>

            {/* HIỂN THỊ DANH SÁCH GIA SƯ */}
            <Row>
                {filteredTutors.map((item) => (
                <Col key={item.tutor_id} lg={3} md={6} className="mb-4">
                    {/* TRUYỀN TUTOR VÀO THÌ NÓ CHỈ HIỆN 1 THẺ VÀ DÙNG MODAL CỦA BẠN */}
                    <CardTutor 
                    tutor={item} 
                    showInviteBtn={true} 
                    onViewDetail={handleViewDetail} 
                    onInvite={handleOpenInvite} 
                    />
                </Col>
                ))}
            </Row>

            {/* ================== MODAL CHI TIẾT (FULL THÔNG TIN) ================== */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
                 <Modal.Header closeButton className="bg-light">
                     <Modal.Title className="fw-bold text-primary">Hồ sơ Gia sư</Modal.Title>
                 </Modal.Header>
                 <Modal.Body className="p-5">
                     {selectedTutor && (
                        <Row>
                            <Col md={5} className="text-center border-end">
                                <img src={selectedTutor.avatar ? `${BASE_URL}/uploads/avatars/${selectedTutor.avatar}` : "/image/avatar.jpg"} className="img-fluid rounded mb-3 border shadow-sm" style={{ maxHeight: '250px' }} alt="gs" />
                                <h5 className="fw-bold">{selectedTutor.full_name} <span/> {selectedTutor.is_verified === 1 && <i className="bi bi-patch-check-fill text-info"></i>}</h5>
                                <p className="text-muted small">{selectedTutor.home_address}</p>
                                <Button variant="warning" className="w-100 text-white fw-bold" onClick={() => handleOpenInvite(selectedTutor)}>Mời dạy ngay</Button>
                            </Col>
                            <Col md={7} className="ps-md-4">
                                <h6 className="fw-bold text-dark border-bottom pb-1"><i className="bi bi-book-half me-2"></i>Môn dạy & Học phí</h6>
                                <div className="mb-3 mt-2">
                                    {selectedTutor.subject_details?.map((s, i) => (
                                        <div key={i} className="mb-1 small ms-3">
                                            <Badge bg="info" className="me-2">{s.subject_name} - {s.level}</Badge>
                                            <span className="fw-bold text-danger">{Number(s.tuition).toLocaleString()}đ</span>
                                        </div>
                                    ))}
                                </div>

                                <h6 className="fw-bold text-dark border-bottom pb-1"><i className="bi bi-calendar3 me-2"></i>Lịch rảnh</h6>
                                <div className="mb-3 mt-2 small ms-3">
                                    {selectedTutor.schedules?.map((sch, i) => (
                                        <span key={i} className="d-inline-block me-3">• {translateDay(sch.day)} ({formatTime(sch.start)} - {formatTime(sch.end)})</span>
                                    ))}
                                </div>

                                <h6 className="fw-bold text-dark border-bottom pb-1"><i className="bi bi-geo-alt me-2"></i>Khu vực có thể dạy</h6>
                                <div className="small text-secondary mt-2">
                                  {selectedTutor.locations?.map((loc, i) => (
                                    <div key={i} className="text-success mb-2 ms-3">
                                      {/* <i className="bi bi-geo-alt-fill me-1"></i>  */}
                                      • {loc}
                                    </div>
                                  ))}
                                </div>

                                <h6 className="fw-bold text-dark border-bottom pb-1" style={{ lineHeight: '1.6' }}><i className="bi bi-mortarboard me-2"></i>Kinh nghiệm & Học vấn</h6>
                                <p className="small text-dark mt-2 ms-3">{selectedTutor.education} - {selectedTutor.experience}</p>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
            </Modal>

            {/* MODAL MỜI DẠY (FORM BOOKING) */}
            <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Mời dạy: {selectedTutor?.full_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleBookingSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Chọn môn học</Form.Label>
                            <Form.Select 
                                value={bookingForm.tutor_subject_level_id} 
                                onChange={(e) => setBookingForm({...bookingForm, tutor_subject_level_id: e.target.value})} 
                                required
                            >
                                <option value="">-- Chọn môn học --</option>
                                {selectedTutor?.subject_details?.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.subject_name} - {s.level} ({Number(s.tuition).toLocaleString()}đ)
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Số giờ/buổi</Form.Label>
                                    <Form.Control
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={2}
                                        value={bookingForm.hours_per_session}
                                        onChange={(e) => handleBookingNumberChange('hours_per_session', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Số buổi/tuần</Form.Label>
                                    <Form.Control
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={2}
                                        value={bookingForm.sessions_per_week}
                                        onChange={(e) => handleBookingNumberChange('sessions_per_week', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold">Hình thức học</Form.Label>
                            <Form.Select value={bookingForm.teaching_mode} onChange={(e) => setBookingForm({...bookingForm, teaching_mode: e.target.value})}>
                                <option value="offline">Học tại nhà (Offline)</option>
                                <option value="online">Học trực tuyến (Online)</option>
                            </Form.Select>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100 fw-bold py-2 rounded-pill">Gửi lời mời dạy</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* MODAL CẢNH BÁO ĐĂNG NHẬP */}
            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered size="sm">
                <Modal.Body className="text-center py-4">
                    <i className="bi bi-exclamation-circle text-warning fs-1"></i>
                    <p className="fw-bold mt-2">Vui lòng đăng nhập bằng tài khoản Học viên để thực hiện chức năng này!</p>
                    <Button variant="primary" className="rounded-pill px-4" onClick={() => window.location.href="/dang-nhap"}>Đăng nhập ngay</Button>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default ListTutorPage;






