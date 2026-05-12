import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Modal, Row, Col, Form } from 'react-bootstrap';
import * as tutorApi from "../../../services/tutorApi";
import * as userApi from "../../../services/userApi"; 
import axiosClient from "../../../api/axiosClient";
import { useAuth } from "../../../contexts/AuthContext";
import "../admin.scss";

const TutorManagement = () => {
    const [tutors, setTutors] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { refreshAdminCounts } = useAuth(); 

    const IMG_URL = "http://localhost:3300/uploads/avatars/";
    const CV_URL = "http://localhost:3300/uploads/cvs/";
    const VIDEO_URL = "http://localhost:3300/uploads/videos/";

    useEffect(() => { loadTutors(); }, []);

    const loadTutors = async () => {
        try {
            const response = await tutorApi.getAllTutorsAdmin();
            // SỬA LỖI: Kiểm tra nếu dữ liệu nằm trong .data (Axios default)
            const data = response.data ? response.data : response;
            setTutors(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi load gia sư:", error);
            setTutors([]);
        }
    };

    const handleApprove = async (id, status) => {
        try {
            // Khớp với tên hàm updateApproveStatus trong tutorApi.jsx của bạn
            await tutorApi.updateApproveStatus(id, { status });
            alert("Đã cập nhật trạng thái duyệt");
            loadTutors();
            setShowModal(false);
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateStatus = async (userId, newStatus) => {
        const statusMap = { 'active': 'KÍCH HOẠT', 'warning': 'CẢNH CÁO', 'locked': 'KHÓA' };
        
        if (window.confirm(`Xác nhận chuyển trạng thái tài khoản sang: ${statusMap[newStatus]}?`)) {
            try {
                // Gọi API từ userApi thay vì tutorApi
                await userApi.updateUserStatus(userId, newStatus);
                alert("Cập nhật trạng thái thành công!");
                loadTutors(); // Refresh danh sách
                refreshAdminCounts();
            } catch (error) {
                alert("Lỗi thao tác: " + (error.response?.data?.message || "Không thể kết nối server"));
            }
        }
    };

    const handleVerifyBlueTick = async (tutorId) => {
        if (!window.confirm("Xác nhận cấp tích xanh cho gia sư này?")) return;

        try {
            await tutorApi.verifyTutorBlueTick(tutorId);
            alert("Đã cấp tích xanh cho gia sư.");
            loadTutors();
            refreshAdminCounts();
            setShowModal(false);
        } catch (error) {
            alert("Lỗi: " + (error.response?.data || error.response?.data?.message || error.message));
        }
    };

    const handleRejectVerify = async (userId) => {
        const reason = prompt("Nhập nội dung yêu cầu bổ sung (Ví dụ: Thiếu bằng đại học, CV mờ...):");
        if (!reason) return;
        
        try {
            // Gọi API tạo thông báo (Bạn đã có bảng notifications)
            await axiosClient.post("/notifications", {
                user_id: userId,
                title: "Yêu cầu bổ sung hồ sơ Tích xanh",
                content: `Hồ sơ của bạn chưa đủ điều kiện: ${reason}. Vui lòng cập nhật lại.`
            });
            alert("Đã gửi yêu cầu bổ sung cho gia sư.");
        } catch (e) { alert("Lỗi gửi thông báo"); }
    };

    // Helper: Tách chuỗi từ API thành mảng
    const parseList = (str) => str ? str.split('||') : [];

    return (
        <div className="admin-management-wrapper">
            <h3 className="page-title">Quản lý Gia sư</h3>
            <Table striped bordered hover responsive className="custom-table">
                <thead>
                    <tr>
                        <th>Avatar</th>
                        <th>Họ tên</th>
                        <th>Email / SĐT</th>
                        <th className="text-center">CV</th>
                        <th className="text-center">Duyệt hồ sơ</th>
                        <th className="text-center">Trạng thái</th>
                        <th className="text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {tutors.length > 0 ? tutors.map(t => (
                        <tr key={t.tutor_id}>
                            <td className="text-center">
                                <img 
                                    src={t.avatar ? IMG_URL + t.avatar : '/image/avatar.jpg'} 
                                    width="45" height="45" 
                                    className="table-avatar"
                                    style={{objectFit: 'cover'}}
                                    onError={(e) => e.target.src = '/image/avatar.jpg'}
                                />
                            </td>
                            <td className="fw-bold text-primary">{t.full_name}</td>
                            <td className="small">{t.email}<br/><span className="text-muted">{t.phone}</span></td>
                            <td className="text-center">
                                {t.cv_url ? (
                                    <a href={CV_URL + t.cv_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info p-1 px-2">
                                        <i className="bi bi-file-earmark-pdf"></i> Xem
                                    </a>
                                ) : <span className="text-muted small">Chưa cập nhật</span>}
                            </td>
                            <td className="text-center">
                                <Badge bg={t.approval_status === 'approved' ? 'success' : t.approval_status === 'rejected' ? 'danger' : 'warning'}>
                                    {t.approval_status?.toUpperCase()}
                                </Badge>
                            </td>
                            <td className="text-center">
                                <Badge bg={t.user_status === 'active' ? 'primary' : t.user_status === 'locked' ? 'dark' : 'warning'}>
                                    {t.user_status?.toUpperCase()}
                                </Badge>
                            </td>
                            <td className="text-center">
                                <div className="d-flex justify-content-center gap-1">
                                    <Button variant="outline-primary" size="sm" onClick={() => { setSelectedTutor(t); setShowModal(true); }}>
                                        <i className="bi bi-eye"></i>
                                    </Button>
                                    {/* Nút bấm thay đổi theo trạng thái hiện tại */}
                                    {t.user_status === 'active' ? (
                                        <Button variant="outline-warning" size="sm" onClick={() => handleUpdateStatus(t.user_id, 'warning')} title="Cảnh cáo">
                                            <i className="bi bi-exclamation-triangle"></i>
                                        </Button>
                                    ) : (
                                        <Button variant="outline-success" size="sm" onClick={() => handleUpdateStatus(t.user_id, 'active')} title="Kích hoạt lại">
                                            <i className="bi bi-check-circle"></i>
                                        </Button>
                                    )}

                                    <Button 
                                        variant={t.user_status === 'locked' ? "success" : "outline-danger"} 
                                        size="sm" 
                                        onClick={() => handleUpdateStatus(t.user_id, t.user_status === 'locked' ? 'active' : 'locked')}
                                        title={t.user_status === 'locked' ? "Mở khóa" : "Khóa"}
                                    >
                                        <i className={`bi ${t.user_status === 'locked' ? 'bi-unlock' : 'bi-lock'}`}></i>
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="7" className="text-center py-4 text-muted">Không tìm thấy dữ liệu gia sư.</td></tr>
                    )}
                </tbody>
            </Table>

            {/* Modal Chi tiết hiển thị đầy đủ thông tin */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold">Hồ sơ chi tiết Gia sư</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedTutor && (
                        <Row>
                            <Col md={4} className="border-end text-center">
                                <img 
                                    src={selectedTutor.avatar ? IMG_URL + selectedTutor.avatar : '/image/avatar.jpg'} 
                                    className="img-fluid rounded shadow-sm mb-3" 
                                    style={{maxHeight: '180px', objectFit: 'cover'}}
                                    alt="gs"
                                />
                                <h5 className="fw-bold">{selectedTutor.full_name}</h5>
                                {selectedTutor.is_verified === 1 && <Badge bg="info" className="mb-2 fs-6">Đã xác minh <i className="bi bi-patch-check-fill"></i></Badge>}
                                <hr/>
                                <p className="modal-detail-content">
                                    <strong>Điểm uy tín:</strong> 
                                    <Badge bg="light" text="primary" className="border">
                                        {selectedTutor.accumulated_points} điểm
                                    </Badge>
                                </p>
                                <div className="d-grid gap-2 mt-3">
                                    {selectedTutor.verify_payment_id && Number(selectedTutor.is_verified) !== 1 ? (
                                        <>
                                            <Button variant="info" className="text-white fw-bold" 
                                                onClick={() => handleVerifyBlueTick(selectedTutor.tutor_id)}>
                                                <i className="bi bi-patch-check-fill me-2"></i> DUYỆT CẤP TÍCH XANH
                                            </Button>
                                            
                                            <Button variant="outline-warning" size="sm" className="fw-bold"
                                                onClick={() => handleRejectVerify(selectedTutor.user_id)}>
                                                YÊU CẦU BỔ SUNG HỒ SƠ
                                            </Button>
                                        </>
                                    ) : (
                                        ""
                                        // <small className="text-muted italic">Gia sư chưa gửi yêu cầu cấp tích xanh.</small>
                                    )}
                                </div>
                                <div className="text-start">
                                    <Form.Label className="fs-6 fw-bold text-dark ">Duyệt hồ sơ hệ thống:</Form.Label>
                                    <Form.Select 
                                        size="sm"
                                        defaultValue={selectedTutor.approval_status} 
                                        onChange={(e) => handleApprove(selectedTutor.tutor_id, e.target.value)}
                                    >
                                        <option value="pending">Chờ duyệt</option>
                                        <option value="approved">Chấp nhận (Approved)</option>
                                        <option value="rejected">Từ chối (Rejected)</option>
                                    </Form.Select>
                                </div>
                            
                                {/* Section Media hiển thị nhanh */}
                                <div className="text-start mt-3">
                                    <Form.Label className="fs-6 fw-bold border-bottom pb-1">Tài liệu đính kèm:</Form.Label>
                                    <div className="d-grid gap-2">
                                        {selectedTutor.cv_url && (
                                            <Button variant="outline-danger" size="sm" as="a" href={CV_URL + selectedTutor.cv_url} target="_blank">
                                                <i className="bi bi-file-pdf me-2"></i>Xem hồ sơ CV
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Col>

                            <Col md={8} className="ps-md-4">
                                <div className="mb-3">
                                    <h4 className="fw-bold fs-6 border-bottom pb-1 text-dark">Học vấn & Kinh nghiệm</h4>
                                    <h3 className="small mb-1 ms-3 mt-2 fs-6" style={{ color: "#455a64", fontSize: '15px' }}><strong>Trình độ:</strong> {selectedTutor.education}</h3>
                                    <h3 className="small ms-3 mt-3 fs-6" style={{ color: "#455a64", fontSize: '15px' }}><strong>Kinh nghiệm:</strong> {selectedTutor.experience}</h3>
                                </div>

                                <div className="mb-3">
                                    <h5 className="fw-bold border-bottom pb-1 text-dark fs-6">Khu vực dạy</h5>
                                    <div className="mb-2 ms-2">
                                        {parseList(selectedTutor.locations).map((l, i) => (
                                            <Badge key={i} bg="light" style={{ color: "#455a64", fontSize: '15px' }} className="border me-1 m-2">{l}</Badge>
                                        ))}
                                    </div>
                                    <h5 className="fw-bold border-bottom pb-1 fs-6 text-dark">Môn dạy</h5>
                                    <ul className="list-unstyled ps-1 ms-3" style={{ color: "#536c78", fontSize: '15px' }}>
                                        {parseList(selectedTutor.subjects).map((s, i) => {
                                            const [name, level, fee] = s.split('#');
                                            return <li key={i} className='mt-2'>• {name} ({level}): <span className="text-danger fw-bold">{Number(fee).toLocaleString()}đ/buổi</span></li>
                                        })}
                                    </ul>
                                </div>

                                <div>
                                    <h6 className="fw-bold border-bottom pb-1 fs-6 text-dark">Lịch rảnh trong tuần</h6>
                                    <div className="d-flex flex-wrap gap-2 ms-3" style={{ color: "#455a64", fontSize: '15px' }}>
                                        {parseList(selectedTutor.schedules).map((sc, i) => {
                                            const [day, start, end] = sc.split('#');
                                            return <Badge key={i} bg="secondary" className="fw-normal fs-6 text-white">{day}: {start}-{end}</Badge>
                                        })}
                                    </div>
                                    {/* PHẦN HIỂN THỊ VIDEO GIỚI THIỆU */}
                                    <div className="mt-3">
                                            <h5 className="fw-bold border-bottom pb-1 mb-2 fs-6 text-dark">Video giới thiệu:</h5>
                                            {selectedTutor.intro_video_url ? (
                                            <div className="ratio ratio-16x9 shadow-sm rounded overflow-hidden">
                                                <video controls>
                                                    <source src={VIDEO_URL + selectedTutor.intro_video_url} type="video/mp4" />
                                                    Trình duyệt không hỗ trợ xem video.
                                                </video>
                                            </div>
                                        ) : (
                                            <span className="text-muted italic" style={{ color: "#455a64", fontSize: '15px' }}>Gia sư chưa cập nhật video giới thiệu.</span>
                                        )}
                                    </div>   
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TutorManagement;
