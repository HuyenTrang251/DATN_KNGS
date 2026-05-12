import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Modal, Row, Col, Form, ListGroup, Spinner } from 'react-bootstrap';
import * as bookingApi from '../../../services/bookingApi';
import "../admin.scss"; 
import { useAuth } from "../../../contexts/AuthContext";

const getPaymentProvider = (transactionCode = '') => {
    const normalizedCode = String(transactionCode).toUpperCase();
    if (normalizedCode.startsWith('MOMO_')) return 'momo';
    if (/^\d{6}_ZLP/.test(normalizedCode)) return 'zalopay';
    return 'payos';
};

const getPaymentProviderLabel = (provider = 'payos') => {
    if (provider === 'momo') return 'MoMo';
    if (provider === 'zalopay') return 'ZaloPay';
    return 'PayOS';
};

const createRefundForm = () => ({
    paymentId: null,
    provider: 'payos',
    toBin: '',
    toAccountNumber: '',
    description: ''
});

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
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundForm, setRefundForm] = useState(createRefundForm());
    const [submittingRefund, setSubmittingRefund] = useState(false);

    useEffect(() => { loadData(); }, []);

    // Logic Lọc
    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredBookings(bookings);
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

    const openRefundModal = () => {
        if (!selected?.payment_id) return;

        setRefundForm({
            paymentId: selected.payment_id,
            provider: getPaymentProvider(selected.transaction_code),
            toBin: '',
            toAccountNumber: '',
            description: `Hoan phi booking #${selected.booking_id}`
        });
        setShowRefundModal(true);
    };

    const closeRefundModal = () => {
        if (submittingRefund) return;
        setShowRefundModal(false);
        setRefundForm(createRefundForm());
    };

    const handleRefundInputChange = (event) => {
        const { name, value } = event.target;
        setRefundForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitRefund = async () => {
        if (refundForm.provider !== 'payos') {
            alert(`${getPaymentProviderLabel(refundForm.provider)} hiện chưa hỗ trợ hoàn tiền tự động trong hệ thống này. Hãy yêu cầu gia sư gửi mã QR hoặc tài khoản để admin hoàn thủ công.`);
            return;
        }

        if (!refundForm.toBin.trim() || !refundForm.toAccountNumber.trim()) {
            alert('Cần nhập mã ngân hàng và số tài khoản nhận hoàn tiền.');
            return;
        }

        try {
            setSubmittingRefund(true);
            const response = await bookingApi.adminRefundPayment(refundForm.paymentId, {
                toBin: refundForm.toBin.trim(),
                toAccountNumber: refundForm.toAccountNumber.trim(),
                description: refundForm.description.trim()
            });
            const message = response?.message || response?.data?.message || 'Đã tạo lệnh hoàn tiền thành công.';
            alert(message);
            closeRefundModal();
            if (selected?.booking_id) {
                await handleViewDetail(selected.booking_id);
            }
            loadData();
        } catch (e) {
            alert('Lỗi hoàn tiền: ' + (e.response?.data?.error || e.message));
        } finally {
            setSubmittingRefund(false);
        }
    };

    const renderStatus = (status) => {
        const map = {
            pending: { bg: 'warning', text: 'MỚI TẠO' },
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
        <div className="admin-management-wrapper admin-booking-page">
            <div className="admin-toolbar responsive-page-header mb-4">
                <h3 className="page-title mb-0">Quản lý Đặt lịch Gia sư</h3>
                
                <Form.Select size="sm" className="responsive-filter" style={{ width: '220px' }} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">Tất cả đặt lịch</option>
                    <option value="approved">Chờ gia sư phản hồi</option>
                    <option value="connecting">Đang trong kết nối</option>
                </Form.Select>
            </div>

            <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
                <Table striped bordered hover className="custom-table align-middle text-center responsive-table">
                    <thead>
                        <tr>
                            <th>Học viên</th>
                            <th>Gia sư</th>
                            <th>Môn học</th>
                            <th>Học phí</th>
                            <th>Trạng thái</th>
                            <th>Thanh toán</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map((b) => (
                            <tr key={b.booking_id}>
                                <td className="text-start fw-bold">{b.student_name}</td>
                                <td className="text-start">{b.tutor_name}</td>
                                <td>{b.subject_name} ({b.level})</td>
                                <td className="text-danger fw-bold">{Number(b.tuition).toLocaleString()}đ</td>
                                <td>{renderStatus(b.status)}</td>
                                <td>
                                    <span className="small text-muted">{b.payment_status || '---'}</span>
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
                                    <div className="small text-muted">
                                        {selected.payment_status && (
                                            <div className="mb-2">
                                                Cổng thanh toán: <b>{getPaymentProviderLabel(getPaymentProvider(selected.transaction_code))}</b>
                                                {selected.transaction_code ? ` - Mã GD: ${selected.transaction_code}` : ''}
                                            </div>
                                        )}
                                        {selected.status === 'approved' && "Lời mời đã được gửi trực tiếp tới gia sư, đang chờ phản hồi."}
                                        {selected.status === 'connecting' && !selected.payment_status && "Gia sư đã đồng ý, đang chờ cổng thanh toán xác nhận."}
                                        {selected.status === 'connecting' && selected.payment_status === 'pending' && "Giao dịch đang được cổng thanh toán xử lý tự động."}
                                        {selected.status === 'connecting' && selected.payment_status === 'success' && <span className="text-success fw-bold">Gia sư đã thanh toán thành công và đang liên hệ học viên.</span>}
                                        {selected.status === 'success' && <span className="text-primary fw-bold">Lớp học đã được tạo thành công.</span>}
                                        {selected.status === 'cancelled' && <span className="text-danger">Lớp đã hủy: {selected.cancel_reason}</span>}
                                        {selected.status === 'cancelled' && selected.payment_status === 'refunded' && <span className="text-success fw-bold d-block mt-2">Giao dịch này đã được admin xác nhận hoàn tiền.</span>}
                                    </div>

                                    {selected.status === 'cancelled' && selected.payment_status === 'success' && (
                                        selected.refund_eligible ? (
                                            <Button variant="warning" className="fw-bold" onClick={openRefundModal}>
                                                XỬ LÝ HOÀN TIỀN
                                            </Button>
                                        ) : (
                                            <div className="small text-muted">
                                                Đã quá 5 ngày kể từ lúc mở số điện thoại hoặc giao dịch không còn đủ điều kiện hoàn tiền.
                                            </div>
                                        )
                                    )}

                                    {/* NÚT XÓA MỀM (CHO PHÉP ADMIN DỌN DẸP) */}
                                    {(selected.status === 'cancelled' || selected.status === 'rejected') && (
                                        <Button variant="outline-secondary" size="sm" className="compact-delete-button">Xóa bản ghi này</Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            <Modal show={showRefundModal} onHide={closeRefundModal} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold">Hoàn tiền giao dịch</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {refundForm.provider !== 'payos' ? (
                        <div className="small text-muted d-flex flex-column gap-2">
                            <div><b>{getPaymentProviderLabel(refundForm.provider)} hiện chưa có luồng auto-refund trong codebase này.</b></div>
                            <div>Admin cần nhận mã QR hoặc thông tin tài khoản từ gia sư rồi hoàn thủ công ngoài hệ thống.</div>
                            <div>Mã giao dịch: <b>{selected?.transaction_code || '---'}</b></div>
                        </div>
                    ) : (
                        <Form className="d-flex flex-column gap-3">
                            <div className="small text-muted">
                                Hệ thống sẽ tạo lệnh chi qua PayOS payout để chuyển lại đúng số tiền phí đã thu cho gia sư.
                            </div>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Mã ngân hàng nhận tiền</Form.Label>
                                <Form.Control name="toBin" value={refundForm.toBin} onChange={handleRefundInputChange} placeholder="Ví dụ: 970422" />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Số tài khoản nhận tiền</Form.Label>
                                <Form.Control name="toAccountNumber" value={refundForm.toAccountNumber} onChange={handleRefundInputChange} placeholder="Nhập số tài khoản của gia sư" />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Mô tả lệnh chi</Form.Label>
                                <Form.Control name="description" value={refundForm.description} onChange={handleRefundInputChange} maxLength={50} />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeRefundModal}>Đóng</Button>
                    {refundForm.provider === 'payos' && (
                        <Button variant="warning" className="fw-bold" onClick={handleSubmitRefund} disabled={submittingRefund}>
                            {submittingRefund ? 'ĐANG GỬI LỆNH CHI...' : 'TẠO LỆNH CHI HOÀN TIỀN'}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminBookingManagement;