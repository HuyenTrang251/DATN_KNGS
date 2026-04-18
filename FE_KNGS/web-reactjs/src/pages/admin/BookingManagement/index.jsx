import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Modal, Row, Col, Form, ListGroup, Spinner } from 'react-bootstrap';
import * as bookingApi from '../../../services/bookingApi';
import "../admin.scss"; 
import { useAuth } from "../../../contexts/AuthContext";

const AdminBookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { refreshAdminCounts } = useAuth(); 
    
    // State Filter & Modal
    const [statusFilter, setStatusFilter] = useState('all');
    const [showDetail, setShowDetail] = useState(false);
    const [selected, setSelected] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => { loadData(); }, []);

    // Logic Lọc
    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredBookings(bookings);
        } else if (statusFilter === 'need_payment') {
            setFilteredBookings(bookings.filter(b => b.has_pending_payment > 0));
        } else {
            setFilteredBookings(bookings.filter(b => b.status === statusFilter));
        }
    }, [statusFilter, bookings]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await bookingApi.adminGetBookings();
            setBookings(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Lỗi load bookings:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (id) => {
        try {
            setShowDetail(true);
            setLoadingDetail(true);
            const data = await bookingApi.adminGetBookingDetail(id);
            setSelected(data);
        } catch (e) {
            alert("Không thể lấy chi tiết");
        } finally {
            setLoadingDetail(false);
        }
    };

    // Hàm Admin duyệt yêu cầu đặt lịch (Bước 1)
    const handleUpdateBooking = async (id, newStatus) => {
        const msg = newStatus === 'approved' ? "Duyệt yêu cầu này để Gia sư có thể phản hồi?" : "Từ chối yêu cầu này?";
        if (!window.confirm(msg)) return;
        try {
            await bookingApi.adminUpdateBookingStatus(id, { status: newStatus });
            alert("Thao tác thành công!");
            loadData();
            setShowDetail(false);
            refreshAdminCounts();
        } catch (e) { alert("Lỗi: " + e.message); }
    };

    // Hàm Admin duyệt tiền từ Gia sư (Bước 2)
    const handleApproveMoney = async (paymentId, bookingId) => {
    if (!window.confirm("Xác nhận đã nhận đủ tiền? Hệ thống sẽ mở khóa số điện thoại học viên cho gia sư.")) return;
    try {
        // 1. Gọi API duyệt bảng payments (chuyển status thành 'success')
        await bookingApi.adminApprovePayment(paymentId, { status: 'success' });
        
        // 2. Gọi API cập nhật trạng thái booking sang 'connecting'
        await bookingApi.adminUpdateBookingStatus(bookingId, { status: 'connecting' });
        
        alert("Duyệt thanh toán thành công!");
        loadData(); // Load lại bảng danh sách chính
        setShowDetail(false); // Đóng modal
        refreshAdminCounts();
    } catch (e) {
        alert("Lỗi duyệt tiền: " + e.message);
    }
  };

    const renderStatus = (status) => {
        const map = {
            pending: { bg: 'warning', text: 'CHỜ DUYỆT' },
            approved: { bg: 'info', text: 'CHỜ GIA SƯ' },
            connecting: { bg: 'primary', text: 'ĐANG KẾT NỐI' },
            success: { bg: 'success', text: 'THÀNH CÔNG' },
            rejected: { bg: 'danger', text: 'BỊ TỪ CHỐI' },
            cancelled: { bg: 'secondary', text: 'ĐÃ HỦY' }
        };
        const item = map[status] || { bg: 'dark', text: status };
        return <Badge bg={item.bg}>{item.text}</Badge>;
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <div className="admin-management-wrapper">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="page-title mb-0">Quản lý Đặt lịch Gia sư</h3>
                
                <Form.Select size="sm" style={{ width: '220px' }} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">Tất cả đặt lịch</option>
                    <option value="need_payment">🔴 Cần duyệt tiền ({bookings.filter(b => b.has_pending_payment > 0).length})</option>
                    <option value="pending">Đang chờ duyệt bài</option>
                    <option value="connecting">Đang trong kết nối</option>
                </Form.Select>
            </div>

            <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
                <Table striped bordered hover className="custom-table align-middle text-center">
                    <thead>
                        <tr>
                            <th>Học viên</th>
                            <th>Gia sư</th>
                            <th>Môn học</th>
                            <th>Học phí</th>
                            <th>Trạng thái</th>
                            <th>Tiền nộp</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map((b) => (
                            <tr key={b.booking_id} className={b.has_pending_payment > 0 ? "table-warning" : ""}>
                                <td className="text-start fw-bold">{b.student_name}</td>
                                <td className="text-start">{b.tutor_name}</td>
                                <td>{b.subject_name} ({b.level})</td>
                                <td className="text-danger fw-bold">{Number(b.tuition).toLocaleString()}đ</td>
                                <td>{renderStatus(b.status)}</td>
                                <td>
                                    {b.has_pending_payment > 0 ? (
                                        <Badge pill bg="danger" className="pulse">CẦN DUYỆT</Badge>
                                    ) : (
                                        <span className="small text-muted">{b.payment_status || '---'}</span>
                                    )}
                                </td>
                                <td>
                                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleViewDetail(b.booking_id)}>
                                        <i className="bi bi-eye"></i>
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => {if(window.confirm("Xóa lịch?")) bookingApi.adminDeleteBooking(b.booking_id).then(()=>loadData())}}>
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* MODAL CHI TIẾT */}
            <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold" style={{color: '#0c024c'}}>Chi tiết lịch hẹn #{selected?.booking_id}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {loadingDetail ? <div className="text-center"><Spinner animation="grow" /></div> : selected && (
                        <>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h6 className="modal-section-title"><i className="bi bi-person-fill"></i> Bên thuê (Học viên)</h6>
                                    <ListGroup variant="flush" className="border rounded small">
                                        <ListGroup.Item><b>Họ tên:</b> {selected.student_name}</ListGroup.Item>
                                        <ListGroup.Item><b>SĐT:</b> <span className="text-primary fw-bold">{selected.student_phone}</span></ListGroup.Item>
                                        <ListGroup.Item><b>Địa chỉ:</b> {selected.student_address}</ListGroup.Item>
                                        <ListGroup.Item><b>Email:</b> {selected.student_email}</ListGroup.Item>
                                    </ListGroup>
                                </Col>
                                <Col md={6}>
                                    <h6 className="modal-section-title"><i className="bi bi-mortarboard-fill"></i> Bên dạy (Gia sư)</h6>
                                    <ListGroup variant="flush" className="border rounded small">
                                        <ListGroup.Item><b>Gia sư:</b> {selected.tutor_name}</ListGroup.Item>
                                        <ListGroup.Item><b>SĐT:</b> {selected.tutor_phone}</ListGroup.Item>
                                        <ListGroup.Item><b>Môn dạy:</b> {selected.subject_name} ({selected.level})</ListGroup.Item>
                                        <ListGroup.Item><b>Học phí:</b> <span className="text-danger fw-bold">{Number(selected.tuition).toLocaleString()}đ/buổi</span></ListGroup.Item>
                                    </ListGroup>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col md={12}>
                                    <h6 className="modal-section-title"><i className="bi bi-info-circle"></i> Nội dung đặt lịch</h6>
                                    <div className="p-3 bg-light rounded border small">
                                        <Row>
                                            <Col sm={4}><b>Thời lượng:</b> {selected.hours_per_session}h/buổi</Col>
                                            <Col sm={4}><b>Số buổi:</b> {selected.sessions_per_week} buổi/tuần</Col>
                                            <Col sm={4}><b>Hình thức:</b> {selected.teaching_mode.toUpperCase()}</Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>

                            {/* FOOTER MODAL - KHU VỰC XỬ LÝ CỦA ADMIN */}
                            <div className="p-3 rounded border shadow-sm" style={{ backgroundColor: '#f8faff' }}>
                                <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">
                                    <i className="bi bi-gear-fill me-2"></i>Xử lý quản trị viên
                                </h6>
                                
                                <div className="d-flex flex-column gap-3">
                                    {/* TRƯỜNG HỢP 1: DUYỆT YÊU CẦU ĐẶT LỊCH BAN ĐẦU */}
                                    {selected.status === 'pending' && (
                                        <div className="d-flex gap-2">
                                            <Button variant="success" className="fw-bold px-4" onClick={() => handleUpdateBooking(selected.booking_id, 'approved')}>
                                                CHẤP NHẬN YÊU CẦU
                                            </Button>
                                            <Button variant="outline-danger" onClick={() => handleUpdateBooking(selected.booking_id, 'rejected')}>
                                                TỪ CHỐI
                                            </Button>
                                        </div>
                                    )}

                                    {/* TRƯỜNG HỢP 2: DUYỆT THANH TOÁN (KHI GIA SƯ ĐÃ XÁC NHẬN) */}
                                    {selected.has_pending_payment > 0 ? (
                                        <div className="alert alert-warning border-warning d-flex justify-content-between align-items-center mb-0 shadow-sm">
                                            <div>
                                                <div className="fw-bold text-danger">
                                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                                    GIA SƯ ĐÃ GỬI XÁC NHẬN THANH TOÁN
                                                </div>
                                                <small className="text-muted italic">Vui lòng kiểm tra tài khoản ngân hàng trước khi xác nhận.</small>
                                            </div>
                                            <Button 
                                                variant="dark" 
                                                className="fw-bold px-4 py-2" 
                                                onClick={() => handleApproveMoney(selected.payment_id, selected.booking_id)}
                                            >
                                                DUYỆT TIỀN NGAY & MỞ KHÓA SĐT
                                            </Button>
                                        </div>
                                    ) : (
                                        /* Hiển thị trạng thái nếu không có tiền chờ duyệt */
                                        <div className="small text-muted">
                                            {selected.status === 'approved' && "Đang chờ gia sư phản hồi"}
                                            {selected.status === 'connecting' && !selected.payment_status && "Gia sư đã đồng ý, chờ thanh toán..."}
                                            {selected.status === 'connecting' && selected.payment_status === 'success' && <span className="text-success fw-bold">Tiền đã duyệt. Gia sư đang liên hệ học viên.</span>}
                                            {selected.status === 'success' && <span className="text-primary fw-bold">Lớp học đã được tạo thành công!</span>}
                                            {selected.status === 'cancelled' && <span className="text-danger">Lớp đã hủy: {selected.cancel_reason}</span>}
                                        </div>
                                    )}

                                    {/* NÚT XÓA MỀM (CHO PHÉP ADMIN DỌN DẸP) */}
                                    {(selected.status === 'cancelled' || selected.status === 'rejected') && (
                                        <Button variant="outline-secondary" size="sm" className="w-25">Xóa bản ghi này</Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AdminBookingManagement;