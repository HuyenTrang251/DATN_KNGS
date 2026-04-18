import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, ListGroup, Spinner } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import * as bookingApi from '../../../services/bookingApi';
import * as postApi from '../../../services/postApi'; // Dùng hàm createPayment

const removeAccents = (str) => {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9 ]/g, ''); // Loại bỏ ký tự đặc biệt
};

const TutorBookingManagement = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showQR, setShowQR] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selected, setSelected] = useState(null);

    const { user } = useAuth(); // Lấy thông tin người dùng đang đăng nhập

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await bookingApi.getReceivedInvitations();
            // Lọc: Không hiển thị những booking đã thành công hoặc đã hủy
            const activeData = Array.isArray(res) 
                ? res.filter(item => item.status !== 'success' && item.status !== 'cancelled') 
                : [];
            setInvitations(activeData);
        } catch (e) {
            console.error("Lỗi load dữ liệu:", e);
        } finally {
            setLoading(false);
        }
    };

    // 1. Gia sư phản hồi Đồng ý/Từ chối
    const handleRespond = async (id, status) => {
        const msg = status === 'agreed' ? "Bạn đồng ý nhận lớp này và sẽ tiến hành nộp phí?" : "Bạn muốn từ chối lời mời này?";
        if (!window.confirm(msg)) return;
        try {
            await bookingApi.respondToInvitation(id, { status });
            alert("Đã gửi phản hồi thành công!");
            loadData();
        } catch (e) { alert("Thao tác thất bại"); }
    };

    // 2. Mở Modal thanh toán
    const openPayment = (item) => {
        setSelected(item);
        setShowQR(true);
    };

    // 3. Xác nhận đã chuyển khoản
    const handleConfirmPaid = async () => {
        // Chuẩn bị các thành phần nội dung
        const bookingId = selected.booking_id;
        const typeLabel = "PHI NHAN LOP"; // Hoặc lấy từ payment_type
        const tutorName = removeAccents(user?.name || '').toUpperCase();
        
        // Nội dung cuối cùng: BK1 - PHI NHAN LOP - HOANG MINH DUC
        const transactionCode = `BK${bookingId} - ${typeLabel} - ${tutorName} - ${Date.now()}`;
        
        try {
            // 2. Chuẩn bị dữ liệu khớp với Validation của Backend
            const payload = {
                tutor_id: Number(selected.tutor_id),
                booking_id: Number(selected.booking_id),
                post_id: null, 
                payment_type: 'receive_booking',
                amount: String(Math.round(selected.tuition * 0.3)), 
                transaction_code: transactionCode,
                status: 'pending'
            };

            await postApi.createPayment(payload);
            
            alert("Đã gửi xác nhận thanh toán! Vui lòng chờ Admin duyệt.");
            setShowQR(false);
            loadData();
        } catch (e) {
            // Hiển thị lỗi chi tiết từ Backend trả về (ví dụ: "post_id is required")
            const errorMsg = e.response?.data || "Lỗi không xác định";
            alert("Lỗi gửi xác nhận: " + errorMsg);
            console.error("Chi tiết lỗi 400:", e.response?.data);
        }
    };

    // 4. Xác nhận kết nối thành công or thất bại
    const handleFinalizeBooking = async (id, action) => {
        const confirmMsg = action === 'success' 
            ? "Xác nhận bạn đã liên hệ thành công và chốt lớp dạy?" 
            : "Xác nhận bạn không thể liên hệ được học viên này?";
            
        if (!window.confirm(confirmMsg)) return;

        try {
            // action truyền vào: 'success' hoặc 'cancel'
            await bookingApi.confirmConnectionSuccess(id, { action });
            
            alert(action === 'success' 
                ? "Chúc mừng! Lớp học đã được tạo thành công." 
                : "Đã ghi nhận liên hệ thất bại.");
            
            loadData(); // Reload sẽ tự động mất bài này khỏi danh sách do đã filter
        } catch (error) {
            alert("Lỗi thao tác: " + (error.response?.data?.message || error.message));
        }
    };

    const renderStatusBadge = (item) => {
        if (item.status === 'approved') return <Badge bg="info">CHỜ BẠN PHẢN HỒI</Badge>;
        if (item.status === 'rejected') return <Badge bg="danger">BẠN ĐÃ TỪ CHỐI</Badge>;
        
        // XỬ LÝ TRẠNG THÁI CONNECTING (Giai đoạn thanh toán)
        if (item.status === 'connecting') {
            // Trường hợp 1: Chưa nộp tiền (payment_status là null)
            if (!item.payment_status) {
                return <Badge bg="primary">ĐÃ ĐỒNG Ý - HÃY THANH TOÁN</Badge>;
            }
            // Trường hợp 2: Đã nộp, đang chờ Admin duyệt (payment_status là pending)
            if (item.payment_status === 'pending') {
                return <Badge bg="warning" text="dark">CHỜ ADMIN DUYỆT TIỀN</Badge>;
            }
            // Trường hợp 3: Admin đã duyệt tiền (payment_status là success)
            if (item.payment_status === 'success') {
                return <Badge bg="success">ĐÃ DUYỆT TIỀN - HÃY GỌI ĐIỆN</Badge>;
            }
        }

        if (item.status === 'success') return <Badge bg="primary">KẾT NỐI THÀNH CÔNG</Badge>;
        return <Badge bg="secondary">{item.status?.toUpperCase()}</Badge>;
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="mt-4 pb-5">
            <h4 className="fw-bold text-primary mb-4 text-uppercase">Danh sách lời mời dạy</h4> 
            <Row>
                {invitations.length > 0 ? invitations.map((item) => {
                    const canPay = item.status === 'connecting' || (item.status === 'approved' && !item.payment_status);
                    const isSuccessPayment = item.payment_status === 'success';

                    return (
                        <Col md={6} key={item.booking_id} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm border-start border-4 border-info">
                                <Card.Body>
                                    <div className="d-flex justify-content-between mb-3">
                                        <h6 className="fw-bold text-dark mb-0">{item.subject_name} - {item.level}</h6>
                                        {renderStatusBadge(item)}
                                    </div>

                                    <div className="small mb-3">
                                        <p className="mb-1"><b>Học viên:</b> {item.student_name}</p>
                                        <p className="mb-1"><b>Khu vực:</b> {item.student_address}</p>
                                        <p className="mb-1"><b>Học phí:</b> <span className="text-danger fw-bold">{Number(item.tuition).toLocaleString()}đ/buổi</span></p>
                                    </div>

                                    {/* THÔNG TIN SỐ ĐIỆN THOẠI (CHỈ HIỆN KHI DUYỆT TIỀN XONG) */}
                                    <div className="alert alert-light border py-2 mb-3 shadow-sm">
                                        {isSuccessPayment ? (
                                            <div className="text-success fw-bold">
                                                <i className="bi bi-telephone-outbound-fill me-2"></i>
                                                SĐT Liên hệ: {item.student_phone}
                                            </div>
                                        ) : (
                                            <div className="text-muted small italic text-center">
                                                <i className="bi bi-lock-fill me-1"></i>
                                                SĐT học viên sẽ hiện sau khi Admin duyệt tiền.
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-flex gap-2">
                                        <Button variant="outline-primary" size="sm" className="px-3 rounded-pill" onClick={() => { setSelected(item); setShowDetail(true); }}>Chi tiết</Button>
                                        
                                        {/* GIAI ĐOẠN 1: MỚI NHẬN LỜI MỜI */}
                                        {item.status === 'approved' && (
                                            <>
                                                <Button variant="success" size="sm" className="px-3 rounded-pill" onClick={() => handleRespond(item.booking_id, 'agreed')}>Đồng ý</Button>
                                                <Button variant="outline-danger" size="sm" className="px-3 rounded-pill" onClick={() => handleRespond(item.booking_id, 'rejected')}>Từ chối</Button>
                                            </>
                                        )}

                                        {/* GIAI ĐOẠN 2: ĐÃ ĐỒNG Ý NHƯNG CHƯA NỘP TIỀN */}
                                        {item.status === 'connecting' && !item.payment_status && (
                                            <Button variant="warning" size="sm" className="fw-bold flex-grow-1 rounded-pill" onClick={() => openPayment(item)}>Thanh toán phí</Button>
                                        )}

                                        {/* GIAI ĐOẠN 3: ĐÃ CÓ SĐT - GỌI ĐIỆN XONG THÌ CHỐT */}
                                        {isSuccessPayment && (
                                            <>
                                                <Button variant="success" size="sm" className="fw-bold flex-grow-1 rounded-pill" onClick={() => handleFinalizeBooking(item.booking_id, 'success')}>
                                                    <i className="bi bi-check-lg me-1"></i> Liên hệ thành công
                                                </Button>
                                                <Button variant="outline-danger" size="sm" className="fw-bold rounded-pill" onClick={() => handleFinalizeBooking(item.booking_id, 'cancel')}>
                                                    <i className="bi bi-x-lg"></i> Thất bại
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                }) : (
                    <div className="text-center py-5 text-muted bg-white rounded border">Hiện bạn chưa có lời mời dạy nào từ học viên.</div>
                )}
            </Row>

            {/* MODAL CHI TIẾT ĐẦY ĐỦ THÔNG TIN */}
            <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
                <Modal.Header closeButton><Modal.Title className="fw-bold fs-5">Thông tin đặt lịch</Modal.Title></Modal.Header>
                <Modal.Body className="p-4">
                    {selected && (
                        <Row>
                            <Col md={6}>
                                <h6 className="fw-bold border-bottom pb-2 mb-3">Yêu cầu học tập</h6>
                                <ListGroup variant="flush" className="small">
                                    <ListGroup.Item><b>Học viên:</b> {selected.student_name}</ListGroup.Item>
                                    <ListGroup.Item><b>Môn học:</b> {selected.subject_name}</ListGroup.Item>
                                    <ListGroup.Item><b>Thời lượng:</b> {Number(selected.hours_per_session)}h/buổi</ListGroup.Item>
                                    <ListGroup.Item><b>Số buổi:</b> {selected.sessions_per_week} buổi/tuần</ListGroup.Item>
                                </ListGroup>
                            </Col>
                            <Col md={6}>
                                <h6 className="fw-bold border-bottom pb-2 mb-3">Thông tin chi phí</h6>
                                <ListGroup variant="flush" className="small">
                                    <ListGroup.Item><b>Học phí:</b> {Number(selected.tuition).toLocaleString()}đ/buổi</ListGroup.Item>
                                    <ListGroup.Item><b>Hình thức:</b> {selected.teaching_mode?.toUpperCase()}</ListGroup.Item>
                                    <ListGroup.Item><b>Phí kết nối (30%):</b> <span className="text-danger fw-bold">{Number(selected.tuition * 0.3).toLocaleString()}đ</span></ListGroup.Item>
                                </ListGroup>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
            </Modal>

            {/* MODAL QR THANH TOÁN */}
            <Modal show={showQR} onHide={() => setShowQR(false)} centered>
                <Modal.Body className="text-center p-4">
                    <h6 className="fw-bold mb-3 text-uppercase">Nộp phí kết nối đặt lịch</h6>
                    <h3 className="text-danger fw-bold">{Number(selected?.tuition * 0.3).toLocaleString()}đ</h3>
                    <div className="bg-white p-2 border rounded d-inline-block my-3 shadow-sm">
                        <img 
                            src={`https://img.vietqr.io/image/VCB-1022641936-compact.png?amount=${selected?.tuition * 0.3}&addInfo=${encodeURIComponent(`BK${selected?.booking_id} - PHI NHAN LOP - {removeAccents(user?.name || '').toUpperCase()}`)}`} 
                            alt="QR" style={{ width: '280px' }}
                        />
                    </div>
                    <div className="alert alert-info text-start small"><b>Nội dung chuyển khoản:</b> BK{selected?.booking_id} - PHI NHAN LOP - {removeAccents(user?.name || '').toUpperCase()} </div>
                    <Button variant="primary" className="w-100 fw-bold py-2 mt-2 shadow-sm" onClick={handleConfirmPaid}>TÔI ĐÃ THANH TOÁN XONG</Button>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default TutorBookingManagement;