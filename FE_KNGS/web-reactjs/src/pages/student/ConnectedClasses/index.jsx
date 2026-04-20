import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Modal, ListGroup } from 'react-bootstrap';
import * as classApi from '../../../services/classSessionApi';
import RatingModal from '../../../components/RatingModal';
import { useAuth } from '../../../contexts/AuthContext';

const ConnectedClasses = () => {
    const { user } = useAuth(); // Lấy role để biết hiển thị "Gia sư" hay "Học viên"
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // States cho Modals
    const [showReview, setShowReview] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await classApi.getMyClasses();
            setClasses(res || []);
        } catch (e) {
            console.error("Lỗi load dữ liệu lớp:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (item) => {
        setSelectedClass(item);
        setShowDetail(true);
    };

    const handleCancelClass = async (id) => {
        const reason = prompt("Vui lòng nhập lý do hủy lớp:");
        if (!reason) return;
        try {
            await classApi.updateClassStatus(id, { status: 'cancelled', cancel_reason: reason });
            alert("Đã hủy lớp học thành công.");
            loadData();
        } catch (e) { alert("Lỗi khi hủy lớp."); }
    };

    const handleConfirmSuccess = async (id) => {
        if (window.confirm("Xác nhận lớp học này đã hoàn thành? Gia sư sẽ được cộng 10 điểm uy tín.")) {
            try {
                await classApi.confirmCompletion(id);
                alert("Xác nhận thành công!");
                loadData();
            } catch (e) { alert("Lỗi xác nhận."); }
        }
    };

    const handleRatingSubmit = async (data) => {
        try {
            if (selectedClass?.review_id) {
                // Nếu đã có review_id -> Gọi API Sửa (PUT)
                await classApi.updateReview(selectedClass.review_id, data);
                alert("Cập nhật đánh giá thành công!");
            } else {
                // Nếu chưa có -> Gọi API Thêm mới (POST)
                await classApi.createReview({ class_session_id: selectedClass.class_session_id, ...data });
                alert("Đăng đánh giá thành công!");
            }
            setShowReview(false);
            loadData();
        } catch (e) { alert("Lỗi xử lý đánh giá"); }
    };

    // Hàm Xử lý Xóa đánh giá
    const handleRatingDelete = async (reviewId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
        try {
            await classApi.deleteReview(reviewId);
            alert("Đã xóa đánh giá.");
            setShowReview(false);
            loadData();
        } catch (e) { alert("Lỗi khi xóa"); }
    };

    const getStatusBadge = (status) => {
        const map = { 
            ongoing: { bg: 'primary', text: 'ĐANG GIẢNG DẠY' }, 
            completed: { bg: 'warning', text: 'CHỜ XÁC NHẬN HT' }, 
            success: { bg: 'success', text: 'HOÀN THÀNH' }, 
            cancelled: { bg: 'danger', text: 'ĐÃ HỦY' } 
        };
        const res = map[status] || { bg: 'secondary', text: status?.toUpperCase() };
        return <Badge bg={res.bg}>{res.text}</Badge>;
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="mt-4 pb-5">
            <h4 className="fw-bold text-primary mb-4 text-uppercase">
                {user?.role_id === 2 ? "Quản lý lớp đang dạy" : "Quản lý lớp đang học"}
            </h4>
            
            <Row>
                {classes.length > 0 ? classes.map(c => (
                    <Col md={6} key={c.class_session_id} className="mb-4">
                        <Card className="shadow-sm border-0 h-100 border-start border-4 border-success">
                            <Card.Body className="d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <h6 className="fw-bold text-dark mb-0">{c.subject_name} - {c.grade}</h6>
                                    {getStatusBadge(c.status)}
                                </div>

                                <div className="mb-3">
                                    <p className="mb-1 small">
                                        <b>{user?.role_id === 2 ? "Học viên:" : "Gia sư:"}</b> {user?.role_id === 2 ? c.student_name : c.tutor_name}
                                    </p>
                                    <p className="mb-1 text-primary fw-bold small">
                                        <i className="bi bi-telephone-fill me-2"></i>
                                        SĐT: {user?.role_id === 2 ? c.student_phone : c.tutor_phone}
                                    </p>
                                    <p className="mb-0 text-muted small text-truncate">
                                        <i className="bi bi-geo-alt-fill me-1"></i> {c.address}
                                    </p>
                                </div>
                                
                                <div className="d-flex gap-2 mt-auto pt-2 border-top">
                                    <Button variant="light" size="sm" className="border flex-fill" onClick={() => handleViewDetail(c)}>
                                        <i className="bi bi-info-circle me-1"></i> Chi tiết
                                    </Button>

                                    {c.status === 'ongoing' && (
                                        <>
                                            {user?.role_id === 2 && (
                                                <Button variant="success" size="sm" onClick={() => handleRequestComplete(c.class_session_id)}>Hoàn thành</Button>
                                            )}
                                            <Button variant="outline-danger" size="sm" onClick={() => handleCancelClass(c.class_session_id)}>Hủy lớp</Button>
                                        </>
                                    )}

                                    {c.status === 'completed' && user?.role_id === 3 && (
                                        <Button variant="success" size="sm" className="fw-bold" onClick={() => handleConfirmSuccess(c.class_session_id)}>Xác nhận xong</Button>
                                    )}

                                    {c.status === 'success' && (
                                        <Button 
                                            variant={c.review_id ? "outline-secondary" : "outline-primary"} 
                                            size="sm" 
                                            className="px-3"
                                            onClick={() => { setSelectedClass(c); setShowReview(true); }}
                                        >
                                            <i className={`bi ${c.review_id ? 'bi-pencil-square' : 'bi-star-fill'} me-1`}></i>
                                            {c.review_id ? 'Sửa đánh giá' : 'Đánh giá'}
                                        </Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )) : (
                    <Col className="text-center py-5 text-muted">Bạn chưa có lớp học nào được kết nối.</Col>
                )}
            </Row>

            {/* MODAL XEM CHI TIẾT ĐẦY ĐỦ THÔNG TIN */}
            <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold fs-5 text-primary">Chi tiết lớp học #{selectedClass?.class_session_id}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedClass && (
                        <Row>
                            <Col md={6}>
                                <h6 className="fw-bold border-bottom pb-2 mb-3 text-dark">Thông tin hợp đồng</h6>
                                <ListGroup variant="flush" className="small">
                                    <ListGroup.Item><b>Môn học:</b> {selectedClass.subject_name}</ListGroup.Item>
                                    <ListGroup.Item><b>Trình độ/Khối:</b> {selectedClass.grade}</ListGroup.Item>
                                    <ListGroup.Item><b>Số lượng HS:</b> {selectedClass.student_quantity} học sinh</ListGroup.Item>
                                    <ListGroup.Item><b>Hình thức:</b> {selectedClass.teaching_mode === 'online' ? 'Trực tuyến' : 'Tại nhà'}</ListGroup.Item>
                                </ListGroup>
                            </Col>
                            <Col md={6}>
                                <h6 className="fw-bold border-bottom pb-2 mb-3 text-dark">Tài chính & Lịch học</h6>
                                <ListGroup variant="flush" className="small">
                                    <ListGroup.Item><b>Học phí:</b> <span className="text-danger fw-bold">{Number(selectedClass.tuition).toLocaleString()}đ/buổi</span></ListGroup.Item>
                                    <ListGroup.Item><b>Số buổi:</b> {selectedClass.sessions_per_week} buổi/tuần</ListGroup.Item>
                                    <ListGroup.Item><b>Thời lượng:</b> {Number(selectedClass.hours_per_session)}h/buổi</ListGroup.Item>
                                    <ListGroup.Item><b>Ngày bắt đầu:</b> {new Date(selectedClass.created_at).toLocaleDateString('vi-VN')}</ListGroup.Item>
                                </ListGroup>
                            </Col>
                            <Col md={12} className="mt-3">
                                <h6 className="fw-bold border-bottom pb-2 mb-2 text-dark">Địa chỉ & Ghi chú</h6>
                                <div className="p-3 bg-light rounded border mb-3 small">
                                    <p className="mb-1"><b>Địa chỉ dạy:</b> {selectedClass.address}</p>
                                    <p className="mb-0 italic text-muted">"{selectedClass.note || "Không có ghi chú thêm"}"</p>
                                </div>
                                
                                {selectedClass.rating && (
                                    <div className="p-3 border-start border-4 border-warning bg-warning-subtle rounded">
                                        <div className="fw-bold text-dark small mb-1">Đánh giá chất lượng:</div>
                                        <div className="text-warning mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <i key={i} className={`bi ${i < selectedClass.rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                                            ))}
                                        </div>
                                        <p className="mb-0 small fst-italic">"{selectedClass.comment}"</p>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetail(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL ĐÁNH GIÁ */}
            <RatingModal 
                show={showReview} 
                onHide={() => setShowReview(false)} 
                onSubmit={handleRatingSubmit}
                onDelete={handleRatingDelete} 
                initialData={selectedClass} // Truyền toàn bộ object selectedClass (chứa review_id, rating, comment)
                targetName={user?.role_id === 2 ? selectedClass?.student_name : selectedClass?.tutor_name}
            />
        </Container>
    );
};

export default ConnectedClasses;