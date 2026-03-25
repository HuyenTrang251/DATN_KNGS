import React, { useState, useEffect } from 'react';
import { Button, Badge, Row, Col, Card, Modal, Spinner, ListGroup } from 'react-bootstrap';
import * as postApi from '../../../services/postApi';
import './manageApplications.scss';

const ManageApplications = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQR, setShowQR] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const fetchApps = async () => {
        try {
            setLoading(true);
            const res = await postApi.getTutorApplications();
            const data = res.data ? res.data : res;
            setApps(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi lấy danh sách ứng tuyển:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApps();
    }, []);

    const handlePay = (job) => {
        setSelectedJob(job);
        setShowQR(true);
    };

    const handleViewDetail = (job) => {
        setSelectedJob(job);
        setShowDetail(true);
    };

    const confirmPaid = async () => {
        const transactionCode = `GS${selectedJob.tutor_id}P${selectedJob.post_id}T${Date.now()}`;
        try {
            await postApi.createPayment({
                tutor_id: selectedJob.tutor_id,
                post_id: selectedJob.post_id,
                payment_type: 'receive_job',
                amount: selectedJob.fee_receive,
                transaction_code: transactionCode,
                status: 'pending' // Khi nhấn xác nhận, status payment là pending
            });
            alert("Đã gửi thông báo thanh toán. Vui lòng chờ Admin xác nhận!");
            setShowQR(false);
            fetchApps();
        } catch (e) {
            alert("Lỗi: " + (e.response?.data?.message || "Không thể gửi thanh toán"));
        }
    };

    const handleConfirmClass = async (item) => {
        if (!window.confirm("Xác nhận bạn đã liên hệ và bắt đầu dạy lớp này thành công?")) return;
        try {
            const payload = {
                student_id: item.student_id,
                tutor_id: item.tutor_id,
                post_id: item.post_id,
                status: 'ongoing'
            };
            await postApi.createClassSession(payload);
            alert("Chúc mừng! Lớp học đã được thêm vào danh sách lớp đang dạy.");
            fetchApps();
        } catch (error) {
            alert("Lỗi kết nối lớp: " + (error.response?.data?.message || "Hệ thống bận"));
        }
    };

    const translateGender = (g) => {
        if (g === 'male') return 'Nam';
        if (g === 'female') return 'Nữ';
        return 'Không yêu cầu';
    };

    // Helper xử lý text và màu sắc trạng thái tổng hợp (Dựa trên apply_status và payment_status)
    const getStatusInfo = (item) => {
        if (item.apply_status === 'pending') return { text: 'CHỜ PHẢN HỒI', bg: 'warning' };
        if (item.apply_status === 'rejected') return { text: 'BỊ TỪ CHỐI', bg: 'danger' };
        
        if (item.apply_status === 'agreed') {
            // Nếu học viên đã đồng ý, xét tiếp trạng thái thanh toán (Cần join bảng payment ở BE)
            if (!item.payment_status) return { text: 'ĐÃ ĐỒNG Ý - CẦN ĐÓNG PHÍ', bg: 'info' };
            if (item.payment_status === 'pending') return { text: 'CHỜ XÁC NHẬN THANH TOÁN', bg: 'secondary' };
            if (item.payment_status === 'success') return { text: 'THANH TOÁN THÀNH CÔNG', bg: 'success' };
            if (item.payment_status === 'refunded') return { text: 'ĐÃ HOÀN PHÍ', bg: 'dark' };
        }
        return { text: item.apply_status?.toUpperCase(), bg: 'secondary' };
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <div className="container mt-4 pb-5">
            <h4 className="fw-bold text-primary mb-4 text-uppercase">Lớp học đang theo dõi</h4>
            <Row>
                {apps.length > 0 ? apps.map(item => {
                    const statusInfo = getStatusInfo(item);
                    // Chỉ hiện SĐT khi Admin đã duyệt thanh toán (payment_status === 'success')
                    const isPaidAndApproved = item.payment_status === 'success';
                    // Chỉ hiện nút thanh toán khi đã đồng ý và chưa nộp tiền
                    const showPayButton = item.apply_status === 'agreed' && !item.payment_status;

                    return (
                        <Col md={6} key={item.post_id} className="mb-4">
                            <Card className="p-3 border-start border-4 border-primary shadow-sm h-100">
                                <div className="row align-items-center h-100">
                                    <Col md={7}>
                                        <h6 className="fw-bold text-dark">{item.subject_name} - {item.grade}</h6>
                                        <div className="small mb-2">
                                            <p className="mb-1">Học phí: <b className="text-success">{Number(item.tuition_fee_per_session).toLocaleString()}đ/buổi</b></p>
                                            <p className="mb-1">Phí nhận lớp: <b className="text-danger">{Number(item.fee_receive).toLocaleString()}đ</b></p>
                                            <p className="mb-1 text-muted"><i className="bi bi-geo-alt-fill text-danger me-1"></i> {item.address}</p>
                                        </div>
                                        
                                        {/* Logic hiển thị SĐT bảo mật */}
                                        {isPaidAndApproved ? (
                                            <div className="mt-2 p-2 bg-light rounded border border-success small">
                                                <p className="mb-1 text-success fw-bold"><i className="bi bi-person-check-fill me-1"></i> Đã mở khóa liên hệ:</p>
                                                <p className="mb-0"><b>SĐT Phụ huynh:</b> <span className="fs-6 fw-bold text-primary">{item.phone}</span></p>
                                            </div>
                                        ) : (
                                            <p className="text-muted fst-italic small mt-2">
                                                <i className="bi bi-lock-fill me-1"></i> 
                                                {item.apply_status === 'pending' ? 'Thông tin SĐT sẽ hiện sau khi học viên đồng ý.' : 'SĐT bị ẩn cho đến khi hoàn tất đóng phí.'}
                                            </p>
                                        )}
                                    </Col>
                                    <Col md={5} className="text-md-end text-start mt-1 mt-md-0 d-flex flex-column justify-content-between h-100">
                                        <div>
                                            <Badge bg={statusInfo.bg} className="mb-2 p-2 px-2">
                                                {statusInfo.text}
                                            </Badge>
                                        </div>
                                        <div className="d-flex flex-column gap-2 mt-4 align-items-end">
                                            <Button variant="outline-primary" size="sm" className="fw-bold px-3 rounded-pill w-75" onClick={() => handleViewDetail(item)}>
                                                <i className="bi bi-eye"></i> Chi tiết
                                            </Button>
                                            
                                            {showPayButton && (
                                                <Button variant="success" size="sm" className="fw-bold rounded-pill px-3 w-75" onClick={() => handlePay(item)}>
                                                    Thanh toán phí
                                                </Button>
                                            )}

                                            {isPaidAndApproved && (
                                                <Button variant="primary" size="sm" className="fw-bold rounded-pill px-3 w-75" onClick={() => handleConfirmClass(item)}>
                                                    Xác nhận kết nối
                                                </Button>
                                            )}
                                        </div>
                                    </Col>
                                </div>
                            </Card>
                        </Col>
                    );
                }) : (
                    <div className="text-center py-5 text-muted bg-light rounded border w-100 mx-3">
                        Bạn chưa có đơn ứng tuyển nhận lớp nào.
                    </div>
                )}
            </Row>

            {/* MODAL CHI TIẾT BÀI ĐĂNG - GIỮ NGUYÊN FE CỦA BẠN */}
            <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold fs-5 text-primary">Thông tin chi tiết lớp học</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedJob && (
                        <Row>
                            <Col md={6}>
                                <h6 className="fw-bold border-bottom pb-2 mb-3 text-dark">Yêu cầu lớp học</h6>
                                <ListGroup variant="flush" className="small">
                                    <ListGroup.Item><b>Môn học:</b> {selectedJob.subject_name}</ListGroup.Item>
                                    <ListGroup.Item><b>Trình độ:</b> {selectedJob.grade}</ListGroup.Item>
                                    <ListGroup.Item><b>Số lượng học sinh:</b> {selectedJob.student_quantity} học sinh</ListGroup.Item>
                                    <ListGroup.Item><b>Thời lượng:</b> {Number(selectedJob.hours_per_session)} giờ/buổi</ListGroup.Item>
                                    <ListGroup.Item><b>Số buổi:</b> {selectedJob.sessions_per_week} buổi/tuần</ListGroup.Item>
                                    <ListGroup.Item><b>Hình thức:</b> {selectedJob.teaching_mode === 'offline' ? 'Tại nhà' : 'Online'}</ListGroup.Item>
                                </ListGroup>
                            </Col>
                            <Col md={6}>
                                <h6 className="fw-bold border-bottom pb-2 mb-3 text-dark">Tiêu chí & Địa điểm</h6>
                                <ListGroup variant="flush" className="small">
                                    <ListGroup.Item><b>Yêu cầu gia sư:</b> {selectedJob.tutor_type === 'teacher' ? 'Giáo viên' : 'Sinh viên'}</ListGroup.Item>
                                    <ListGroup.Item><b>Giới tính ưu tiên:</b> {translateGender(selectedJob.preferred_gender)}</ListGroup.Item>
                                    <ListGroup.Item><b>Địa chỉ:</b> {selectedJob.address}</ListGroup.Item>
                                    <ListGroup.Item><b>Học phí/buổi:</b> <span className="text-success fw-bold">{Number(selectedJob.tuition_fee_per_session).toLocaleString()}đ</span></ListGroup.Item>
                                    <ListGroup.Item><b>Phí nhận lớp:</b> <span className="text-danger fw-bold">{Number(selectedJob.fee_receive).toLocaleString()}đ</span></ListGroup.Item>
                                    <ListGroup.Item><b>Hỗ trợ nợ phí:</b> {selectedJob.support}%</ListGroup.Item>
                                </ListGroup>
                            </Col>
                            <Col md={12} className="mt-3">
                                <h6 className="fw-bold border-bottom pb-2 mb-2 text-dark">Ghi chú từ học viên</h6>
                                <div className="p-3 bg-light rounded border small fst-italic">
                                    "{selectedJob.note || "Không có ghi chú thêm."}"
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetail(false)}>Đóng</Button>
                    {selectedJob?.apply_status === 'agreed' && !selectedJob?.payment_status && (
                        <Button variant="success" onClick={() => { setShowDetail(false); handlePay(selectedJob); }}>Đi tới thanh toán</Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* QR Payment Modal */}
            <Modal show={showQR} onHide={() => setShowQR(false)} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold fs-6">Thanh toán phí nhận lớp</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center p-4">
                    <p className="mb-1 small">Vui lòng chuyển khoản chính xác:</p>
                    <h4 className="text-danger fw-bold mb-3">{Number(selectedJob?.fee_receive).toLocaleString()}đ</h4>
                    
                    <div className="bg-white p-2 border rounded d-inline-block mb-3 shadow-sm">
                        <img 
                            src={`https://img.vietqr.io/image/VCB-1022641936-compact.png?amount=${selectedJob?.fee_receive}&addInfo=NHANLOP${selectedJob?.post_id}`} 
                            alt="QR Code" 
                            style={{ width: '250px' }}
                        />
                    </div>
                    
                    <div className="alert alert-info text-start small py-2">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        <b>Nội dung chuyển khoản:</b> NHANLOP{selectedJob?.post_id}
                    </div>
                    
                    <Button variant="primary" className="w-100 fw-bold py-2 mt-2 shadow-sm" onClick={confirmPaid}>
                        XÁC NHẬN ĐÃ THANH TOÁN XONG
                    </Button>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ManageApplications;