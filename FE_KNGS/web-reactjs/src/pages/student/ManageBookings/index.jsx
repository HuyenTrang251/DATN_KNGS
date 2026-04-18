import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, ListGroup, Spinner, Form } from 'react-bootstrap';
import * as bookingApi from '../../../services/bookingApi';
import { getAllSubjects } from '../../../services/subjectApi';

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // States cho Modal
    const [showDetail, setShowDetail] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [subjects, setSubjects] = useState([]);

    const AVATAR_BASE = "http://localhost:3300/uploads/avatars/";

    useEffect(() => {
        fetchData();
        loadSubjects();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await bookingApi.getMyBookings();
            setBookings(Array.isArray(res) ? res : []);
        } catch (error) {
            console.error("Lỗi lấy danh sách đặt lịch:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadSubjects = async () => {
        const res = await getAllSubjects();
        setSubjects(res || []);
    };

    // --- LOGIC XỬ LÝ HÀNH ĐỘNG ---

    // 1. Xóa yêu cầu (Chỉ khi Pending)
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa yêu cầu mời dạy này?")) return;
        try {
            await bookingApi.deleteBooking(id);
            alert("Đã xóa yêu cầu thành công!");
            fetchData();
        } catch (e) { alert("Không thể xóa yêu cầu này."); }
    };

    // 2. Hủy yêu cầu (Khi đã Approved nhưng chưa có phản hồi từ Gia sư)
    const handleCancel = async (id) => {
        if (!window.confirm("Hủy yêu cầu mời dạy này? (Yêu cầu đã được Admin duyệt)")) return;
        try {
            await bookingApi.cancelBooking(id);
            alert("Đã hủy yêu cầu!");
            fetchData();
        } catch (e) { alert("Lỗi khi hủy."); }
    };

    // 3. Mở form sửa
    const handleOpenEdit = (booking) => {
        setSelectedBooking({ ...booking });
        setShowEdit(true);
    };

    const handleUpdate = async () => {
        try {
            await bookingApi.updateBooking(selectedBooking.booking_id, selectedBooking);
            alert("Cập nhật thành công!");
            setShowEdit(false);
            fetchData();
        } catch (e) { alert("Lỗi cập nhật."); }
    };

    // Helper render trạng thái
    const renderStatus = (status) => {
        const map = {
            pending: { bg: 'warning', text: 'CHỜ ADMIN DUYỆT' },
            approved: { bg: 'info', text: 'CHỜ GIA SƯ TRẢ LỜI' },
            connecting: { bg: 'primary', text: 'ĐANG KẾT NỐI' },
            success: { bg: 'success', text: 'KẾT NỐI THÀNH CÔNG' },
            rejected: { bg: 'danger', text: 'BỊ TỪ CHỐI' },
            cancelled: { bg: 'secondary', text: 'ĐÃ HỦY' }
        };
        const item = map[status] || { bg: 'dark', text: status };
        return <Badge bg={item.bg} className="px-3 py-2">{item.text}</Badge>;
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="mt-4 pb-5">
            <h4 className="fw-bold text-primary mb-4 text-uppercase">Lịch sử mời gia sư dạy</h4>
            
            <Row>
                {bookings.length > 0 ? bookings.map((b) => (
                    <Col md={6} key={b.booking_id} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm overflow-hidden border-top border-4 border-primary">
                            <Card.Body>
                                <div className="d-flex align-items-center mb-3">
                                    <img 
                                        src={b.tutor_avatar ? AVATAR_BASE + b.tutor_avatar : "/image/avatar.jpg"} 
                                        alt="avt" className="rounded-circle border me-3"
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <h6 className="fw-bold mb-0 text-dark">Gia sư: {b.tutor_name}</h6>
                                        <small className="text-muted">Môn: {b.subject_name}</small>
                                    </div>
                                    <div className="ms-auto">
                                        {renderStatus(b.status)}
                                    </div>
                                </div>

                                <div className="bg-light p-3 rounded mb-3 small">
                                    <Row>
                                        <Col xs={6}><b>Học phí:</b> <span className="text-danger">{Number(b.tuition).toLocaleString()}đ/buổi</span></Col>
                                        <Col xs={6}><b>Thời lượng:</b> {Number(b.hours_per_session)}h/buổi</Col>
                                        <Col xs={12} className="mt-1"><b>Lịch học:</b> {b.sessions_per_week} buổi/tuần ({b.teaching_mode})</Col>
                                    </Row>
                                </div>

                                <div className="d-flex gap-2">
                                    <Button variant="outline-primary" size="sm" className="flex-grow-1" onClick={() => { setSelectedBooking(b); setShowDetail(true); }}>
                                        <i className="bi bi-eye"></i> Chi tiết
                                    </Button>

                                    {/* NÚT SỬA/XÓA: Chỉ hiện khi Admin chưa động vào (Pending) */}
                                    {b.status === 'pending' && (
                                        <>
                                            <Button variant="outline-warning" size="sm" onClick={() => handleOpenEdit(b)}><i className="bi bi-pencil"></i></Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(b.booking_id)}><i className="bi bi-trash"></i></Button>
                                        </>
                                    )}

                                    {/* NÚT HỦY: Khi Admin đã duyệt nhưng gia sư chưa đồng ý */}
                                    {b.status === 'approved' && (
                                        <Button variant="outline-secondary" size="sm" onClick={() => handleCancel(b.booking_id)}>Hủy yêu cầu</Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )) : (
                    <div className="text-center py-5 text-muted bg-white rounded shadow-sm">Bạn chưa gửi lời mời dạy nào.</div>
                )}
            </Row>

            {/* MODAL CHI TIẾT */}
            <Modal show={showDetail} onHide={() => setShowDetail(false)} centered>
                <Modal.Header closeButton><Modal.Title className="fw-bold fs-5">Chi tiết lời mời dạy</Modal.Title></Modal.Header>
                <Modal.Body>
                    {selectedBooking && (
                        <ListGroup variant="flush">
                            <ListGroup.Item><b>Gia sư:</b> {selectedBooking.tutor_name}</ListGroup.Item>
                            <ListGroup.Item><b>Môn học:</b> {selectedBooking.subject_name}</ListGroup.Item>
                            <ListGroup.Item><b>Học phí đề xuất:</b> {Number(selectedBooking.tuition).toLocaleString()}đ</ListGroup.Item>
                            <ListGroup.Item><b>Hình thức:</b> {selectedBooking.teaching_mode === 'offline' ? 'Tại nhà' : 'Online'}</ListGroup.Item>
                            <ListGroup.Item><b>Trạng thái:</b> {selectedBooking.status.toUpperCase()}</ListGroup.Item>
                            {selectedBooking.cancel_reason && (
                                <ListGroup.Item className="text-danger"><b>Lý do từ chối:</b> {selectedBooking.cancel_reason}</ListGroup.Item>
                            )}
                        </ListGroup>
                    )}
                </Modal.Body>
            </Modal>

            {/* MODAL SỬA THÔNG TIN (CHỈ CHO PHÉP KHI PENDING) */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg" centered>
                <Modal.Header closeButton><Modal.Title className="fw-bold">Chỉnh sửa yêu cầu mời dạy</Modal.Title></Modal.Header>
                <Modal.Body>
                    {selectedBooking && (
                        <Form>
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Label className="small fw-bold">Số buổi / tuần</Form.Label>
                                    <Form.Control type="number" value={selectedBooking.sessions_per_week} onChange={e => setSelectedBooking({...selectedBooking, sessions_per_week: e.target.value})} />
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Label className="small fw-bold">Số giờ / buổi</Form.Label>
                                    <Form.Control type="number" step="0.5" value={selectedBooking.hours_per_session} onChange={e => setSelectedBooking({...selectedBooking, hours_per_session: e.target.value})} />
                                </Col>
                                <Col md={12}>
                                    <Form.Label className="small fw-bold">Hình thức học</Form.Label>
                                    <Form.Select value={selectedBooking.teaching_mode} onChange={e => setSelectedBooking({...selectedBooking, teaching_mode: e.target.value})}>
                                        <option value="offline">Tại nhà (Offline)</option>
                                        <option value="online">Trực tuyến (Online)</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEdit(false)}>Đóng</Button>
                    <Button variant="primary" onClick={handleUpdate}>Lưu thay đổi</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ManageBookings;