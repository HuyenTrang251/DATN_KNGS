import React, { useState, useEffect } from 'react';
import { Button, Badge, Row, Col, Card, Modal, ListGroup, Spinner, Form } from 'react-bootstrap';
import * as postApi from '../../../services/postApi';
import { getAllSubjects } from '../../../services/subjectApi';

const defaultDialogState = {
    show: false,
    title: 'Thông báo',
    message: '',
    confirmText: 'OK',
    cancelText: '',
    onConfirm: null
};

const ManagePosts = () => {
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);

    const [showDetail, setShowDetail] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const [showEdit, setShowEdit] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    const [showApps, setShowApps] = useState(false);
    const [tutorApps, setTutorApps] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);

    const [dialogState, setDialogState] = useState(defaultDialogState);

    const showMessage = (message, title = 'Thông báo') => {
        setDialogState({
            show: true,
            title,
            message,
            confirmText: 'Đóng',
            cancelText: '',
            onConfirm: null
        });
    };

    const showConfirmDialog = ({ message, onConfirm, title = 'Thông báo', confirmText = 'OK', cancelText = 'Hủy' }) => {
        setDialogState({
            show: true,
            title,
            message,
            confirmText,
            cancelText,
            onConfirm
        });
    };

    const closeDialog = () => {
        setDialogState(defaultDialogState);
    };

    const handleDialogConfirm = async () => {
        const confirmAction = dialogState.onConfirm;
        closeDialog();

        if (typeof confirmAction === 'function') {
            await confirmAction();
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await postApi.getStudentPosts();
            const data = res.data ? res.data : res;
            setMyPosts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Lỗi lấy bài đăng:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const data = await getAllSubjects();
            setSubjects(data || []);
        } catch (err) {
            console.error('Lỗi lấy môn học', err);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchSubjects();
    }, []);

    const handleOpenEdit = (post) => {
        setEditFormData({
            ...post,
            tuition_fee_per_session: Number(post.tuition_fee_per_session)
        });
        setShowEdit(true);
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        try {
            await postApi.updatePost(editFormData.post_id, editFormData);
            showMessage('Cập nhật bài đăng thành công!');
            setShowEdit(false);
            fetchPosts();
        } catch (error) {
            showMessage(`Cập nhật thất bại: ${error.response?.data?.message || 'Lỗi hệ thống'}`);
        }
    };

    const handleViewApplications = async (postId) => {
        try {
            setLoadingApps(true);
            setShowApps(true);

            const res = await postApi.getApplicationsByPostId(postId);
            let finalData = [];

            if (Array.isArray(res)) {
                finalData = res;
            } else if (res && typeof res === 'object') {
                finalData = [res];
            }

            setTutorApps(finalData);
        } catch (error) {
            console.error('Lỗi lấy danh sách ứng tuyển:', error);
            setTutorApps([]);
        } finally {
            setLoadingApps(false);
        }
    };

    const handleFeedback = (appId, newStatus, postId) => {
        const confirmMsg = newStatus === 'agreed'
            ? 'Bạn có đồng ý cho gia sư này nhận lớp không? (Sau khi đồng ý, gia sư sẽ tiến hành thanh toán phí)'
            : 'Bạn muốn từ chối gia sư này?';

        showConfirmDialog({
            message: confirmMsg,
            onConfirm: async () => {
                try {
                    await postApi.updateApplicationStatus(appId, { status: newStatus });
                    showMessage('Đã gửi phản hồi thành công!');
                    handleViewApplications(postId);
                    fetchPosts();
                } catch (error) {
                    showMessage(`Lỗi phản hồi: ${error.response?.data?.message || error.message}`);
                }
            }
        });
    };

    const handleAction = (id, action) => {
        if (action === 'delete') {
            showConfirmDialog({
                message: 'Bạn chắc chắn muốn xóa bài đăng này?',
                onConfirm: async () => {
                    try {
                        await postApi.deletePost(id);
                        showMessage('Xóa thành công');
                        fetchPosts();
                    } catch (err) {
                        showMessage('Thao tác thất bại');
                    }
                }
            });
            return;
        }

        if (action === 'cancel') {
            showConfirmDialog({
                message: 'Bạn chắc chắn muốn dừng tìm gia sư cho lớp này?',
                onConfirm: async () => {
                    try {
                        await postApi.updatePost(id, { status: 'cancelled' });
                        showMessage('Đã hủy bài đăng');
                        fetchPosts();
                    } catch (err) {
                        showMessage('Thao tác thất bại');
                    }
                }
            });
        }
    };

    const openDetail = (post) => {
        setSelectedPost(post);
        setShowDetail(true);
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'approved':
                return { bg: 'success', text: 'ĐÃ DUYỆT' };
            case 'pending':
                return { bg: 'warning', text: 'ĐANG CHỜ DUYỆT' };
            case 'rejected':
                return { bg: 'danger', text: 'BỊ TỪ CHỐI' };
            case 'cancelled':
                return { bg: 'secondary', text: 'ĐÃ HỦY' };
            case 'success':
                return { bg: 'primary', text: 'ĐÃ KẾT NỐI' };
            default:
                return { bg: 'dark', text: status?.toUpperCase() };
        }
    };

    if (loading) {
        return <div className="text-center mt-5">Đang tải bài đăng của bạn...</div>;
    }

    return (
        <div className="container mt-4 pb-5">
            <h4 className="fw-bold text-primary mb-4 text-uppercase">Quản lý lớp học đã đăng</h4>

            <Row>
                {myPosts.length > 0 ? myPosts.map((post) => {
                    const status = getStatusInfo(post.status);
                    return (
                        <Col md={6} lg={4} className="mb-4" key={post.post_id}>
                            <Card className="h-100 border-0 shadow-sm overflow-hidden" style={{ transition: '0.3s' }}>
                                <div className={`p-1 bg-${status.bg}`}></div>
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h6 className="fw-bold text-dark mb-0">{post.subject_name} - {post.grade}</h6>
                                        <Badge bg={status.bg}>{status.text}</Badge>
                                    </div>

                                    <div className="small text-muted mb-3 flex-grow-1">
                                        <p className="mb-1 text-truncate">
                                            <i className="bi bi-geo-alt-fill text-danger me-1"></i> {post.address}
                                        </p>
                                        <p className="mb-1">
                                            <i className="bi bi-cash-stack text-success me-1"></i> Học phí:
                                            <b className="text-dark"> {Number(post.tuition_fee_per_session).toLocaleString()}đ/buổi</b>
                                        </p>

                                        <p className="mb-1" style={{ cursor: 'pointer' }} onClick={() => handleViewApplications(post.post_id)}>
                                            <i className="bi bi-people-fill text-info me-1"></i>
                                            Gia sư ứng tuyển: <Badge pill bg="primary" className="border">{post.total_applications}</Badge>
                                        </p>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <Button variant="light" size="sm" className="flex-fill border" onClick={() => openDetail(post)}>
                                            <i className="bi bi-eye"></i> Chi tiết
                                        </Button>

                                        {post.status === 'pending' && (
                                            <>
                                                <Button variant="outline-primary" size="sm" onClick={() => handleOpenEdit(post)}>
                                                    <i className="bi bi-pencil-square"></i> Sửa
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleAction(post.post_id, 'delete')}>
                                                    <i className="bi bi-trash"></i> Xóa
                                                </Button>
                                            </>
                                        )}

                                        {(post.status === 'approved' || post.status === 'pending') && (
                                            <Button variant="outline-secondary" size="sm" onClick={() => handleAction(post.post_id, 'cancel')}>
                                                Hủy lớp
                                            </Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                }) : (
                    <div className="text-center py-5 text-muted">Bạn chưa đăng bài tìm gia sư nào.</div>
                )}
            </Row>

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
                                <h6 className="fw-bold border-bottom pb-2 mb-3 text-primary">Yêu cầu gia sư và phí</h6>
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
                                    {selectedPost.note || 'Không có ghi chú.'}
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetail(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Chỉnh sửa bài đăng</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleUpdatePost}>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Label className="small fw-bold">Môn học</Form.Label>
                                <Form.Select
                                    value={editFormData.subject_id}
                                    onChange={(e) => setEditFormData({ ...editFormData, subject_id: e.target.value })}
                                    required
                                >
                                    {subjects.map((subject) => (
                                        <option key={subject.subject_id} value={subject.subject_id}>{subject.name}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label className="small fw-bold">Lớp học / Trình độ</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editFormData.grade}
                                    onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
                                    required
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4} className="mb-3">
                                <Form.Label className="small fw-bold">Học phí / buổi</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editFormData.tuition_fee_per_session}
                                    onChange={(e) => setEditFormData({ ...editFormData, tuition_fee_per_session: e.target.value })}
                                    required
                                />
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Label className="small fw-bold">Số buổi / tuần</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editFormData.sessions_per_week}
                                    onChange={(e) => setEditFormData({ ...editFormData, sessions_per_week: e.target.value })}
                                />
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Label className="small fw-bold">Hình thức</Form.Label>
                                <Form.Select
                                    value={editFormData.teaching_mode}
                                    onChange={(e) => setEditFormData({ ...editFormData, teaching_mode: e.target.value })}
                                >
                                    <option value="offline">Tại nhà</option>
                                    <option value="online">Online</option>
                                </Form.Select>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Địa chỉ chi tiết</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={editFormData.address}
                                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Ghi chú</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={editFormData.note}
                                onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })}
                            />
                        </Form.Group>
                        <div className="text-end">
                            <Button variant="secondary" className="me-2" onClick={() => setShowEdit(false)}>Hủy</Button>
                            <Button variant="primary" type="submit">Lưu thay đổi</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showApps} onHide={() => setShowApps(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="fw-bold fs-5">Gia sư đang chờ phản hồi</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {loadingApps ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : tutorApps.length > 0 ? (
                        <ListGroup variant="flush">
                            {tutorApps.map((app) => (
                                <ListGroup.Item key={app.post_application_id} className="p-3">
                                    <Row className="align-items-center">
                                        <Col xs={2} className="text-center">
                                            <img
                                                src={app.avatar ? `http://localhost:3300/uploads/avatars/${app.avatar}` : '/image/avatar.jpg'}
                                                className="rounded-circle border"
                                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                alt="avt"
                                            />
                                        </Col>
                                        <Col xs={6}>
                                            <div className="fw-bold text-primary">{app.full_name}</div>
                                            <div className="small text-muted mb-1"><b>Học vấn:</b> {app.education}</div>
                                            <div className="small text-dark"><b>Kinh nghiệm:</b> {app.experience}</div>
                                            <div className="mt-1">
                                                Trạng thái:
                                                <Badge
                                                    bg={app.apply_status === 'pending' ? 'warning' : app.apply_status === 'agreed' ? 'success' : 'danger'}
                                                    className="ms-2"
                                                >
                                                    {app.apply_status === 'pending' ? 'Đang chờ' : app.apply_status === 'agreed' ? 'Đã đồng ý' : 'Đã từ chối'}
                                                </Badge>
                                            </div>
                                        </Col>
                                        <Col xs={4} className="text-end">
                                            {app.apply_status === 'pending' ? (
                                                <div className="d-flex flex-column gap-2">
                                                    <Button variant="success" size="sm" onClick={() => handleFeedback(app.post_application_id, 'agreed', app.post_id)}>
                                                        Đồng ý
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleFeedback(app.post_application_id, 'rejected', app.post_id)}>
                                                        Từ chối
                                                    </Button>
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

            <Modal show={dialogState.show} onHide={closeDialog} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">{dialogState.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{dialogState.message}</Modal.Body>
                <Modal.Footer>
                    {dialogState.cancelText && (
                        <Button variant="secondary" onClick={closeDialog}>
                            {dialogState.cancelText}
                        </Button>
                    )}
                    <Button variant="primary" onClick={handleDialogConfirm}>
                        {dialogState.confirmText}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManagePosts;






