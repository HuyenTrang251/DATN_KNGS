import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Badge, Row, Col, ListGroup } from 'react-bootstrap';
import * as postApi from '../../../services/postApi';
import "../admin.scss"; 

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State Modal & Filter
    const [showDetail, setShowDetail] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    // State Form Duyệt bài
    const [approveForm, setApproveForm] = useState({ 
        commission: 30, 
        support: 0,
        reason: '' 
    });

    const IMG_URL = "http://localhost:3300/uploads/avatars/";

    useEffect(() => { loadPosts(); }, []);

    // Lọc dữ liệu khi statusFilter hoặc danh sách posts thay đổi
    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredPosts(posts);
        } else {
            setFilteredPosts(posts.filter(p => p.status === statusFilter));
        }
    }, [statusFilter, posts]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const res = await postApi.getAllPostsAdmin();
            const data = res.data ? res.data : res;
            setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi load bài đăng:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (post) => {
        setSelectedPost(post);
        setApproveForm({
            commission: 30,
            support: post.support || 0,
            reason: post.cancel_reason || ''
        });
        setShowDetail(true);
    };

    const handleUpdateStatus = async (status) => {
        try {
            // Gọi API Duyệt bài + Tính phí
            await postApi.approvePostWithFee(selectedPost.post_id, {
                status: status,
                commissionPercent: approveForm.commission,
                supportPercent: approveForm.support,
                reason: approveForm.reason
            });
            
            alert(status === 'approved' ? "Đã duyệt bài đăng!" : "Đã từ chối bài đăng!");
            setShowDetail(false);
            loadPosts();
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || "Thao tác thất bại"));
        }
    };

    const renderStatusBadge = (status) => {
        const map = {
            approved: { bg: 'success', text: 'ĐÃ DUYỆT' },
            pending: { bg: 'warning', text: 'CHỜ DUYỆT' },
            rejected: { bg: 'danger', text: 'TỪ CHỐI' },
            success: { bg: 'primary', text: 'ĐÃ KẾT NỐI' }
        };
        const item = map[status] || { bg: 'secondary', text: status };
        return <Badge bg={item.bg}>{item.text}</Badge>;
    };

    if (loading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>;

    return (
        <div className="admin-management-wrapper">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="page-title mb-0">Quản lý bài đăng tìm Gia sư</h3>
                
                {/* BỘ LỌC TRẠNG THÁI */}
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold small text-muted">Lọc trạng thái:</span>
                    <Form.Select 
                        size="sm" 
                        style={{ width: '180px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả bài đăng</option>
                        <option value="pending">Chờ phê duyệt</option>
                        <option value="approved">Đã phê duyệt</option>
                        <option value="rejected">Đã từ chối</option>
                        <option value="success">Đã kết nối lớp</option>
                    </Form.Select>
                </div>
            </div>

            <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
                <Table striped bordered hover className="custom-table align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Học viên</th>
                            <th>Môn học / Lớp</th>
                            <th className="text-center">Học phí</th>
                            <th className="text-center">Trạng thái</th>
                            <th className="text-center">Phí nhận lớp</th>
                            <th className="text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPosts.length > 0 ? filteredPosts.map((p) => (
                            <tr key={p.post_id}>
                                <td>
                                    <div className="fw-bold">{p.full_name}</div>
                                    <div className="text-muted small" style={{fontSize: '11px'}}>{p.address}</div>
                                </td>
                                <td>{p.subject_name} - {p.grade}</td>
                                <td className="text-center text-danger fw-bold">
                                    {Number(p.tuition_fee_per_session).toLocaleString()}đ
                                </td>
                                <td className="text-center">{renderStatusBadge(p.status)}</td>
                                <td className="text-center text-primary fw-bold">
                                    {p.fee_receive ? Number(p.fee_receive).toLocaleString() + 'đ' : '---'}
                                </td>
                                <td className="text-center">
                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleViewDetail(p)}>
                                        <i className="bi bi-eye"></i>
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => {if(window.confirm("Bạn chắc chắn muốn xóa bài đăng?")) postApi.deletePost(p.post_id).then(()=>loadPosts())}}>
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center py-4 text-muted">Không có bài đăng nào trong mục này.</td></tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* MODAL CHI TIẾT & DUYỆT BÀI */}
            <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold text-primary fs-5">Chi tiết bài đăng tìm Gia sư</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedPost && (
                        <>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h6 className="detail-section-title"><i className="bi bi-person-circle"></i> Thông tin liên hệ</h6>
                                    <ListGroup variant="flush" className="small border rounded">
                                        <ListGroup.Item><b>Học viên:</b> {selectedPost.full_name}</ListGroup.Item>
                                        <ListGroup.Item><b>Số điện thoại:</b> <span className="text-primary fw-bold">{selectedPost.contact_phone}</span></ListGroup.Item>
                                        <ListGroup.Item><b>Địa chỉ:</b> {selectedPost.address}</ListGroup.Item>
                                        <ListGroup.Item><b>Ngày đăng:</b> {new Date(selectedPost.created_at).toLocaleString('vi-VN')}</ListGroup.Item>
                                    </ListGroup>
                                </Col>
                                <Col md={6}>
                                    <h6 className="detail-section-title"><i className="bi bi-book"></i> Yêu cầu lớp học</h6>
                                    <ListGroup variant="flush" className="small border rounded">
                                        <ListGroup.Item><b>Môn học:</b> {selectedPost.subject_name} ({selectedPost.grade}) - <b>Học phí:</b> {Number(selectedPost.tuition_fee_per_session).toLocaleString()}đ</ListGroup.Item>
                                        <ListGroup.Item><b>Thời gian:</b> {selectedPost.sessions_per_week} buổi/tuần ({Number(selectedPost.hours_per_session)}h/buổi)</ListGroup.Item>
                                        <ListGroup.Item><b>Hình thức:</b> {selectedPost.teaching_mode} - <b>Số lượng:</b> {selectedPost.student_quantity} HS</ListGroup.Item>
                                        <ListGroup.Item><b>Yêu cầu gia sư:</b> {
                                            selectedPost.tutor_type === 'teacher' ? 'Giáo viên' : 
                                            selectedPost.tutor_type === 'student' ? 'Sinh viên' : 'Sinh viên, Giáo viên'
                                        } ({
                                            selectedPost.preferred_gender === 'male' ? 'Nam' : 
                                            selectedPost.preferred_gender === 'female' ? 'Nữ' : 'Không yêu cầu'
                                        })</ListGroup.Item>
                                    </ListGroup>
                                </Col>
                            </Row>

                            <div className="mb-4">
                                <h6 className="detail-section-title"><i className="bi bi-chat-left-text"></i> Ghi chú phụ huynh</h6>
                                <div className="p-3 bg-light rounded border small italic">
                                    "{selectedPost.note || "Không có ghi chú."}"
                                </div>
                            </div>

                            {/* PHẦN XỬ LÝ CỦA ADMIN */}
                            <div className="p-3 border rounded shadow-sm" style={{ backgroundColor: '#f8faff' }}>
                                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Xử lý Phê duyệt & Phí</h6>
                                {selectedPost.status === 'pending' ? (
                                    <Row className="g-3">
                                        <Col md={4}>
                                            <Form.Label className="small fw-bold">Phí hoa hồng (%)</Form.Label>
                                            <Form.Control type="number" value={approveForm.commission} onChange={e => setApproveForm({...approveForm, commission: e.target.value})} />
                                        </Col>
                                        <Col md={4}>
                                            <Form.Label className="small fw-bold">Hỗ trợ nợ phí (%)</Form.Label>
                                            <Form.Select value={approveForm.support} onChange={e => setApproveForm({...approveForm, support: e.target.value})}>
                                                <option value="0">0%</option><option value="25">25%</option><option value="50">50%</option><option value="100">100%</option>
                                            </Form.Select>
                                        </Col>
                                        <Col md={4} className="d-flex align-items-end">
                                            <div className="small bg-white p-2 border rounded w-100">
                                                Phí dự tính: <b className="text-danger">
                                                    {(selectedPost.tuition_fee_per_session * selectedPost.sessions_per_week * 4 * (approveForm.commission / 100)).toLocaleString()}đ
                                                </b>
                                            </div>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Label className="small fw-bold">Lý do (nếu từ chối)</Form.Label>
                                            <Form.Control size="sm" placeholder="Nhập lý do từ chối..." value={approveForm.reason} onChange={e => setApproveForm({...approveForm, reason: e.target.value})} />
                                        </Col>
                                        <Col md={12} className="text-end mt-3">
                                            <Button variant="danger" className="me-2 fw-bold" onClick={() => handleUpdateStatus('rejected')}>TỪ CHỐI BÀI</Button>
                                            <Button variant="success" className="px-5 fw-bold" onClick={() => handleUpdateStatus('approved')}>DUYỆT BÀI NGAY</Button>
                                        </Col>
                                    </Row>
                                ) : (
                                    <div className="d-flex justify-content-between">
                                        <span>Trạng thái hiện tại: {renderStatusBadge(selectedPost.status)}</span>
                                        <span>Phí thu: <b>{Number(selectedPost.fee_receive).toLocaleString()}đ</b></span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default PostManagement;