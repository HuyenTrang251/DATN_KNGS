import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, ListGroup, Spinner } from 'react-bootstrap';
import * as bookingApi from '../../../services/bookingApi';

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // States cho Modal
    const [showDetail, setShowDetail] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const AVATAR_BASE = "http://localhost:3300/uploads/avatars/";

    useEffect(() => {
        fetchData();
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

    // 2. Hủy yêu cầu khi đã gửi tới gia sư nhưng chưa có phản hồi
    const handleCancel = async (id) => {
        if (!window.confirm("Hủy yêu cầu mời dạy này?")) return;
        try {
            await bookingApi.cancelBooking(id);
            alert("Đã hủy yêu cầu!");
            fetchData();
        } catch (e) { alert("Lỗi khi hủy."); }
    };

    // Helper render trạng thái
    const renderStatus = (status) => {
        const map = {
            pending: { bg: 'warning', text: 'MỚI TẠO' },
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
        <Container className="mt-4 pb-5 manage-student-bookings-page">
            <h4 className="fw-bold text-primary mb-4 text-uppercase">Lịch sử mời gia sư dạy</h4>
            
            <Row>
                {bookings.length > 0 ? bookings.map((b) => (
                    <Col md={6} key={b.booking_id} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm overflow-hidden border-top border-4 border-primary">
                            <Card.Body>
                                <div className="booking-overview mb-3">
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

                                <div className="booking-summary-box bg-light p-3 rounded mb-3 small">
                                    <Row>
                                        <Col xs={6}><b>Học phí:</b> <span className="text-danger">{Number(b.tuition).toLocaleString()}đ/buổi</span></Col>
                                        <Col xs={6}><b>Thời lượng:</b> {Number(b.hours_per_session)}h/buổi</Col>
                                        <Col xs={12} className="mt-1"><b>Lịch học:</b> {b.sessions_per_week} buổi/tuần ({b.teaching_mode})</Col>
                                    </Row>
                                </div>

                                <div className="booking-card-actions">
                                    <Button variant="outline-primary" size="sm" className="flex-grow-1" onClick={() => { setSelectedBooking(b); setShowDetail(true); }}>
                                        <i className="bi bi-eye"></i> Chi tiết
                                    </Button>

                                    {/* NÚT XÓA: Chỉ giữ cho bản ghi cũ còn ở trạng thái pending */}
                                    {b.status === 'pending' && (
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(b.booking_id)}><i className="bi bi-trash"></i></Button>
                                    )}

                                    {/* NÚT HỦY: Khi lời mời đã gửi tới gia sư nhưng gia sư chưa đồng ý */}
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
        </Container>
    );
};

export default ManageBookings;