import React, { useState, useEffect } from 'react';
import { Button, Badge, Row, Col, Card, Modal, ListGroup, Spinner } from 'react-bootstrap';
import * as postApi from '../../../services/postApi';

const ManagePosts = () => {
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // State cho Modal chi tiết bài đăng
    const [showDetail, setShowDetail] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    // --- BỔ SUNG: State cho Modal danh sách gia sư ứng tuyển ---
    const [showApps, setShowApps] = useState(false);
    const [tutorApps, setTutorApps] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await postApi.getStudentPosts();
            const data = res.data ? res.data : res;
            setMyPosts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi lấy bài đăng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // --- BỔ SUNG: Hàm lấy danh sách gia sư khi click vào số lượng ---
    const handleViewApplications = async (postId) => {
        try {
            setLoadingApps(true);
            setShowApps(true);
            
            const res = await postApi.getApplicationsByPostId(postId);
            
            console.log("Dữ liệu nhận được:", res);

            // LOGIC MỚI: Kiểm tra linh hoạt
            let finalData = [];
            if (Array.isArray(res)) {
                finalData = res; // Nếu là mảng thì dùng luôn
            } else if (res && typeof res === 'object') {
                finalData = [res]; // Nếu là 1 object thì bọc nó vào mảng [ ]
            }

            setTutorApps(finalData);
            
        } catch (error) {
            console.error("Lỗi:", error);
            setTutorApps([]);
        } finally {
            setLoadingApps(false);
        }
    };

    const handleFeedback = async (appId, newStatus, postId) => {
        const confirmMsg = newStatus === 'agreed' 
            ? "Bạn có đồng ý cho gia sư này nhận lớp không? (Sau khi đồng ý, gia sư sẽ tiến hành thanh toán phí)" 
            : "Bạn muốn từ chối gia sư này?";
            
        if (!window.confirm(confirmMsg)) return;

        try {
            // Gọi API cập nhật status post_application
            await postApi.updateApplicationStatus(appId, { status: newStatus });
            alert("Đã gửi phản hồi thành công!");
            
            // Load lại danh sách gia sư trong Modal để thấy trạng thái mới
            handleViewApplications(postId);
            // Load lại bài đăng ngoài trang chính để cập nhật số lượng (nếu cần)
            fetchPosts();
        } catch (error) {
            alert("Lỗi phản hồi: " + (error.response?.data?.message || error.message));
        }
    };

    const handleAction = async (id, action) => {
        try {
            if (action === 'delete') {
                if (window.confirm("Bạn chắc chắn muốn xóa bài đăng này?")) {
                    await postApi.deletePost(id);
                    alert("Xóa thành công");
                } else return;
            } else if (action === 'cancel') {
                if (window.confirm("Bạn chắc chắn muốn dừng tìm gia sư cho lớp này?")) {
                    await postApi.updatePost(id, { status: 'cancelled' });
                    alert("Đã hủy bài đăng");
                } else return;
            }
            fetchPosts();
        } catch (err) {
            alert("Thao tác thất bại");
        }
    };

    const openDetail = (post) => {
        setSelectedPost(post);
        setShowDetail(true);
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'approved': return { bg: 'success', text: 'ĐÃ DUYỆT' };
            case 'pending': return { bg: 'warning', text: 'ĐANG CHỜ DUYỆT' };
            case 'rejected': return { bg: 'danger', text: 'BỊ TỪ CHỐI' };
            case 'cancelled': return { bg: 'secondary', text: 'ĐÃ HỦY' };
            case 'success': return { bg: 'primary', text: 'ĐÃ KẾT NỐI' };
            default: return { bg: 'dark', text: status?.toUpperCase() };
        }
    };

    if (loading) return <div className="text-center mt-5">Đang tải bài đăng của bạn...</div>;

    return (
        <div className="container mt-4 pb-5">
            <h4 className="fw-bold text-primary mb-4 text-uppercase">Quản lý lớp học đã đăng</h4>
            
            <Row>
                {myPosts.length > 0 ? myPosts.map(p => {
                    const status = getStatusInfo(p.status);
                    return (
                        <Col md={6} lg={4} className="mb-4" key={p.post_id}>
                            <Card className="h-100 border-0 shadow-sm overflow-hidden" style={{ transition: '0.3s' }}>
                                <div className={`p-1 bg-${status.bg}`}></div>
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h6 className="fw-bold text-dark mb-0">{p.subject_name} - {p.grade}</h6>
                                        <Badge bg={status.bg}>{status.text}</Badge>
                                    </div>
                                    
                                    <div className="small text-muted mb-3 flex-grow-1">
                                        <p className="mb-1 text-truncate"><i className="bi bi-geo-alt-fill text-danger me-1"></i> {p.address}</p>
                                        <p className="mb-1"><i className="bi bi-cash-stack text-success me-1"></i> Học phí: <b className="text-dark">{Number(p.tuition_fee_per_session).toLocaleString()}đ/buổi</b></p>
                                        
                                        {/* Cho phép click vào để xem gia sư */}
                                        <p className="mb-1" style={{cursor: 'pointer'}} onClick={() => handleViewApplications(p.post_id)}>
                                            <i className="bi bi-people-fill text-info me-1"></i> 
                                            Gia sư ứng tuyển: <Badge pill bg="primary" className="border">{p.total_applications}</Badge>
                                            {/* <small className="ms-2 text-primary text-decoration-underline">Xem ngay</small> */}
                                        </p>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <Button variant="light" size="sm" className="flex-fill border" onClick={() => openDetail(p)}>
                                            <i className="bi bi-eye"></i> Chi tiết
                                        </Button>
                                        
                                        {p.status === 'pending' && (
                                            <Button variant="outline-danger" size="sm" onClick={() => handleAction(p.post_id, 'delete')}>
                                                <i className="bi bi-trash"></i> Xóa
                                            </Button>
                                        )}

                                        {(p.status === 'approved' || p.status === 'pending') && (
                                            <Button variant="outline-secondary" size="sm" onClick={() => handleAction(p.post_id, 'cancel')}>
                                                Hủy lớp
                                            </Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    )
                }) : (
                    <div className="text-center py-5 text-muted">Bạn chưa đăng bài tìm gia sư nào.</div>
                )}
            </Row>

            {/* MODAL CHI TIẾT BÀI ĐĂNG (GIỮ NGUYÊN) */}
            <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold fs-5">Chi tiết bài đăng #{selectedPost?.post_id}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedPost && (
                        <Row>
                            <Col md={6}>
                                <h6 className="fw-bold border-bottom pb-2 mb-3 text-primary">Thông tin lớp học</h6>
                                <ListGroup variant="flush" className="small">
                                    <ListGroup.Item><b>Môn học:</b> {selectedPost.subject_name}</ListGroup.Item>
                                    <ListGroup.Item><b>Trình độ:</b> {selectedPost.grade}</ListGroup.Item>
                                    <ListGroup.Item><b>Số lượng học sinh:</b> {selectedPost.student_quantity} học sinh</ListGroup.Item>
                                    <ListGroup.Item><b>Số buổi:</b> {selectedPost.sessions_per_week} buổi/tuần</ListGroup.Item>
                                    <ListGroup.Item><b>Thời lượng:</b> {Number(selectedPost.hours_per_session)} giờ/buổi</ListGroup.Item>
                                    <ListGroup.Item><b>Hình thức:</b> {selectedPost.teaching_mode === 'offline' ? 'Tại nhà (Offline)' : 'Trực tuyến (Online)'}</ListGroup.Item>
                                </ListGroup>
                            </Col>
                            <Col md={6}>
                                <h6 className="fw-bold border-bottom pb-2 mb-3 text-primary">Yêu cầu gia sư & Phí</h6>
                                <ListGroup variant="flush" className="small">
                                    <ListGroup.Item><b>Đối tượng:</b> {selectedPost.tutor_type === 'teacher' ? 'Giáo viên' : selectedPost.tutor_type === 'student' ? 'Sinh viên' : 'Tùy ý'}</ListGroup.Item>
                                    <ListGroup.Item><b>Giới tính ưu tiên:</b> {selectedPost.preferred_gender === 'male' ? 'Nam' : selectedPost.preferred_gender === 'female' ? 'Nữ' : 'Không yêu cầu'}</ListGroup.Item>
                                    <ListGroup.Item><b>Học phí/buổi:</b> <span className="text-danger fw-bold">{Number(selectedPost.tuition_fee_per_session).toLocaleString()}đ</span></ListGroup.Item>
                                    <ListGroup.Item><b>Liên hệ:</b> {selectedPost.contact_phone}</ListGroup.Item>
                                    <ListGroup.Item><b>Địa chỉ:</b> {selectedPost.address}</ListGroup.Item>
                                </ListGroup>
                            </Col>
                            <Col md={12} className="mt-3">
                                <h6 className="fw-bold border-bottom pb-2 mb-2 text-primary">Ghi chú thêm</h6>
                                <div className="p-3 bg-light rounded border small italic">
                                    {selectedPost.note || "Không có ghi chú."}
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetail(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>

            {/* --- BỔ SUNG: MODAL DANH SÁCH GIA SƯ ỨNG TUYỂN --- */}
            <Modal show={showApps} onHide={() => setShowApps(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="fw-bold fs-5">Gia sư đang chờ phản hồi</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {loadingApps ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : tutorApps.length > 0 ? (
                        <ListGroup variant="flush">
                            {tutorApps.map((app) => (
                                <ListGroup.Item key={app.post_application_id} className="p-3">
                                    <Row className="align-items-center">
                                        <Col xs={2} className="text-center">
                                            <img 
                                                src={app.avatar ? `http://localhost:3300/uploads/avatars/${app.avatar}` : "/image/avatar.jpg"} 
                                                className="rounded-circle border" style={{width: '60px', height: '60px', objectFit: 'cover'}}
                                                alt="avt"
                                            />
                                        </Col>
                                        <Col xs={6}>
                                            <div className="fw-bold text-primary">{app.full_name}</div>
                                            <div className="small text-muted mb-1"><b>Học vấn:</b> {app.education}</div>
                                            <div className="small text-dark"><b>Kinh nghiệm:</b> {app.experience}</div>
                                            <div className="mt-1">
                                                Trạng thái: 
                                                <Badge bg={app.status === 'pending' ? 'warning' : app.status === 'agreed' ? 'success' : 'danger'} className="ms-2">
                                                    {app.status === 'pending' ? 'Đang chờ' : app.status === 'agreed' ? 'Đã đồng ý' : 'Đã từ chối'}
                                                </Badge>
                                            </div>
                                        </Col>
                                        <Col xs={4} className="text-end">
                                            {app.status === 'pending' ? (
                                                <div className="d-flex flex-column gap-2">
                                                    <Button variant="success" size="sm" onClick={() => handleFeedback(app.post_application_id, 'agreed', app.post_id)}>Đồng ý</Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleFeedback(app.post_application_id, 'rejected', app.post_id)}>Từ chối</Button>
                                                </div>
                                            ) : (
                                                <small className="text-muted italic">Đã phản hồi</small>
                                            )}
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <div className="text-center py-5 text-muted">Chưa có gia sư nào ứng tuyển lớp này.</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowApps(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManagePosts;