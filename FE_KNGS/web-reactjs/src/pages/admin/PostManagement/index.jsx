// import React, { useEffect, useState } from 'react';
// import { Table, Button, Modal, Form, Badge, Row, Col, ListGroup } from 'react-bootstrap';
// import * as postApi from '../../../services/postApi';
// import "../admin.scss"; 

// const PostManagement = () => {
//     const [posts, setPosts] = useState([]);
//     const [filteredPosts, setFilteredPosts] = useState([]);
//     const [loading, setLoading] = useState(true);
    
//     // State Modal & Filter
//     const [showDetail, setShowDetail] = useState(false);
//     const [selectedPost, setSelectedPost] = useState(null);
//     const [statusFilter, setStatusFilter] = useState('all');

//     // State Form Duyệt bài
//     const [approveForm, setApproveForm] = useState({ 
//         commission: 30, 
//         support: 0,
//         reason: '' 
//     });

//     const IMG_URL = "http://localhost:3300/uploads/avatars/";

//     useEffect(() => { loadPosts(); }, []);

//     // L?c d? li?u khi statusFilter ho?c danh s�ch posts thay d?i
//     useEffect(() => {
//         if (statusFilter === 'all') {
//             setFilteredPosts(posts);
//         } else {
//             setFilteredPosts(posts.filter(p => p.status === statusFilter));
//         }
//     }, [statusFilter, posts]);

//     const loadPosts = async () => {
//         try {
//             setLoading(true);
//             const res = await postApi.getAllPostsAdmin();
//             const data = res.data ? res.data : res;
//             setPosts(Array.isArray(data) ? data : []);
//         } catch (err) {
//             console.error("Lỗi load bài đăng:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleViewDetail = (post) => {
//         setSelectedPost(post);
//         setApproveForm({
//             commission: 30,
//             support: post.support || 0,
//             reason: post.cancel_reason || ''
//         });
//         setShowDetail(true);
//     };

//     const handleUpdateStatus = async (status) => {
//         try {
//             // Gọi API Duyệt bài + Tính phí
//             await postApi.approvePostWithFee(selectedPost.post_id, {
//                 status: status,
//                 commissionPercent: approveForm.commission,
//                 supportPercent: approveForm.support,
//                 reason: approveForm.reason
//             });
            
//             alert(status === 'approved' ? "�� duy?t b�i dang!" : "�� t? ch?i b�i dang!");
//             setShowDetail(false);
//             loadPosts();
//         } catch (err) {
//             alert("L?i: " + (err.response?.data?.message || "Thao t�c th?t b?i"));
//         }
//     };

//     const renderStatusBadge = (status) => {
//         const map = {
//             approved: { bg: 'success', text: '�� DUY?T' },
//             pending: { bg: 'warning', text: 'CHỜ DUYỆT' },
//             rejected: { bg: 'danger', text: 'TỪ CHỐI' },
//             success: { bg: 'primary', text: '�� K?T N?I' }
//         };
//         const item = map[status] || { bg: 'secondary', text: status };
//         return <Badge bg={item.bg}>{item.text}</Badge>;
//     };

//     if (loading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>;

//     return (
//         <div className="admin-management-wrapper">
//             <div className="d-flex justify-content-between align-items-center mb-4">
//                 <h3 className="page-title mb-0">Quản lý bài đăng tìm Gia sư</h3>
                
//                 {/* B? L?C TR?NG TH�I */}
//                 <div className="d-flex align-items-center gap-2">
//                     <span className="fw-bold small text-muted">L?c tr?ng th�i:</span>
//                     <Form.Select 
//                         size="sm" 
//                         style={{ width: '180px' }}
//                         value={statusFilter}
//                         onChange={(e) => setStatusFilter(e.target.value)}
//                     >
//                         <option value="all">Tất cả bài đăng</option>
//                         <option value="pending">Chờ phê duyệt</option>
//                         <option value="approved">�� ph� duy?t</option>
//                         <option value="rejected">�� t? ch?i</option>
//                         <option value="success">�� k?t n?i l?p</option>
//                     </Form.Select>
//                 </div>
//             </div>

//             <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
//                 <Table striped bordered hover className="custom-table align-middle mb-0">
//                     <thead>
//                         <tr>
//                             <th>Học viên</th>
//                             <th>Môn học / Lớp</th>
//                             <th className="text-center">Học phí</th>
//                             <th className="text-center">Tr?ng th�i</th>
//                             <th className="text-center">Phí nhận lớp</th>
//                             <th className="text-center">Thao t�c</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filteredPosts.length > 0 ? filteredPosts.map((p) => (
//                             <tr key={p.post_id}>
//                                 <td>
//                                     <div className="fw-bold">{p.full_name}</div>
//                                     <div className="text-muted small" style={{fontSize: '11px'}}>{p.address}</div>
//                                 </td>
//                                 <td>{p.subject_name} - {p.grade}</td>
//                                 <td className="text-center text-danger fw-bold">
//                                     {Number(p.tuition_fee_per_session).toLocaleString()}đ
//                                 </td>
//                                 <td className="text-center">{renderStatusBadge(p.status)}</td>
//                                 <td className="text-center text-primary fw-bold">
//                                     {p.fee_receive ? Number(p.fee_receive).toLocaleString() + 'đ' : '---'}
//                                 </td>
//                                 <td className="text-center">
//                                     <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleViewDetail(p)}>
//                                         <i className="bi bi-eye"></i>
//                                     </Button>
//                                     <Button variant="outline-danger" size="sm" onClick={() => {if(window.confirm("Bạn chắc chắn muốn xóa bài đăng?")) postApi.deletePost(p.post_id).then(()=>loadPosts())}}>
//                                         <i className="bi bi-trash"></i>
//                                     </Button>
//                                 </td>
//                             </tr>
//                         )) : (
//                             <tr><td colSpan="6" className="text-center py-4 text-muted">Không có bài đăng nào trong mục này.</td></tr>
//                         )}
//                     </tbody>
//                 </Table>
//             </div>

//             {/* MODAL CHI TIẾT & DUYỆT BÀI */}
//             <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
//                 <Modal.Header closeButton className="bg-light">
//                     <Modal.Title className="fw-bold text-primary fs-5">Chi tiết bài đăng tìm Gia sư</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body className="p-4">
//                     {selectedPost && (
//                         <>
//                             <Row className="mb-4">
//                                 <Col md={6}>
//                                     <h6 className="detail-section-title"><i className="bi bi-person-circle"></i> Thông tin liên hệ</h6>
//                                     <ListGroup variant="flush" className="small border rounded">
//                                         <ListGroup.Item><b>Học viên:</b> {selectedPost.full_name}</ListGroup.Item>
//                                         <ListGroup.Item><b>Số điện thoại:</b> <span className="text-primary fw-bold">{selectedPost.contact_phone}</span></ListGroup.Item>
//                                         <ListGroup.Item><b>Địa chỉ:</b> {selectedPost.address}</ListGroup.Item>
//                                         <ListGroup.Item><b>Ngày đăng:</b> {new Date(selectedPost.created_at).toLocaleString('vi-VN')}</ListGroup.Item>
//                                     </ListGroup>
//                                 </Col>
//                                 <Col md={6}>
//                                     <h6 className="detail-section-title"><i className="bi bi-book"></i> Yêu cầu lớp học</h6>
//                                     <ListGroup variant="flush" className="small border rounded">
//                                         <ListGroup.Item><b>Môn học:</b> {selectedPost.subject_name} ({selectedPost.grade}) - <b>Học phí:</b> {Number(selectedPost.tuition_fee_per_session).toLocaleString()}đ</ListGroup.Item>
//                                         <ListGroup.Item><b>Thời gian:</b> {selectedPost.sessions_per_week} buổi/tuần ({Number(selectedPost.hours_per_session)}h/buổi)</ListGroup.Item>
//                                         <ListGroup.Item><b>Hình thức:</b> {selectedPost.teaching_mode} - <b>Số lượng:</b> {selectedPost.student_quantity} HS</ListGroup.Item>
//                                         <ListGroup.Item><b>Yêu cầu gia sư:</b> {
//                                             selectedPost.tutor_type === 'teacher' ? 'Gi�o vi�n' : 
//                                             selectedPost.tutor_type === 'student' ? 'Sinh vi�n' : 'Sinh vi�n, Gi�o vi�n'
//                                         } ({
//                                             selectedPost.preferred_gender === 'male' ? 'Nam' : 
//                                             selectedPost.preferred_gender === 'female' ? 'Nữ' : 'Không yêu cầu'
//                                         })</ListGroup.Item>
//                                     </ListGroup>
//                                 </Col>
//                             </Row>

//                             <div className="mb-4">
//                                 <h6 className="detail-section-title"><i className="bi bi-chat-left-text"></i> Ghi chú phụ huynh</h6>
//                                 <div className="p-3 bg-light rounded border small italic">
//                                     "{selectedPost.note || "Không có ghi chú."}"
//                                 </div>
//                             </div>

//                             {/* PHẦN XỬ LÝ CỦA ADMIN */}
//                             <div className="p-3 border rounded shadow-sm" style={{ backgroundColor: '#f8faff' }}>
//                                 <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Xử lý Phê duyệt & Phí</h6>
//                                 {selectedPost.status === 'pending' ? (
//                                     <Row className="g-3">
//                                         <Col md={4}>
//                                             <Form.Label className="small fw-bold">Phí hoa hồng (%)</Form.Label>
//                                             <Form.Control type="number" value={approveForm.commission} onChange={e => setApproveForm({...approveForm, commission: e.target.value})} />
//                                         </Col>
//                                         <Col md={4}>
//                                             <Form.Label className="small fw-bold">Hỗ trợ nợ phí (%)</Form.Label>
//                                             <Form.Select value={approveForm.support} onChange={e => setApproveForm({...approveForm, support: e.target.value})}>
//                                                 <option value="0">0%</option><option value="25">25%</option><option value="50">50%</option><option value="100">100%</option>
//                                             </Form.Select>
//                                         </Col>
//                                         <Col md={4} className="d-flex align-items-end">
//                                             <div className="small bg-white p-2 border rounded w-100">
//                                                 Phí dự tính: <b className="text-danger">
//                                                     {(selectedPost.tuition_fee_per_session * selectedPost.sessions_per_week * 4 * (approveForm.commission / 100)).toLocaleString()}đ
//                                                 </b>
//                                             </div>
//                                         </Col>
//                                         <Col md={12}>
//                                             <Form.Label className="small fw-bold">Lý do (nếu từ chối)</Form.Label>
//                                             <Form.Control size="sm" placeholder="Nhập lý do từ chối..." value={approveForm.reason} onChange={e => setApproveForm({...approveForm, reason: e.target.value})} />
//                                         </Col>
//                                         <Col md={12} className="text-end mt-3">
//                                             <Button variant="danger" className="me-2 fw-bold" onClick={() => handleUpdateStatus('rejected')}>TỪ CHỐI BÀI</Button>
//                                             <Button variant="success" className="px-5 fw-bold" onClick={() => handleUpdateStatus('approved')}>DUYỆT BÀI NGAY</Button>
//                                         </Col>
//                                     </Row>
//                                 ) : (
//                                     <div className="d-flex justify-content-between">
//                                         <span>Tr?ng th�i hi?n t?i: {renderStatusBadge(selectedPost.status)}</span>
//                                         <span>Phí thu: <b>{Number(selectedPost.fee_receive).toLocaleString()}đ</b></span>
//                                     </div>
//                                 )}
//                             </div>
//                         </>
//                     )}
//                 </Modal.Body>
//             </Modal>
//         </div>
//     );
// };

// export default PostManagement;

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Badge, Row, Col, ListGroup, Spinner } from 'react-bootstrap';
import * as postApi from '../../../services/postApi';
import { useAuth } from "../../../contexts/AuthContext";
import { appConfirm } from '../../../components/AppDialogProvider';
import "../admin.scss"; 

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
    postId: null,
    provider: 'payos',
    toBin: '',
    toAccountNumber: '',
    description: ''
});

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { refreshAdminCounts } = useAuth(); 
    
    // State Modal Chi tiết bài đăng
    const [showDetail, setShowDetail] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    // --- BỔ SUNG: State Modal danh sách gia sư ứng tuyển ---
    const [showTutorApps, setShowTutorApps] = useState(false);
    const [tutorAppsList, setTutorAppsList] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundForm, setRefundForm] = useState(createRefundForm());
    const [submittingRefund, setSubmittingRefund] = useState(false);

    // State Form Duyệt bài
    const [approveForm, setApproveForm] = useState({ 
        commission: 30, 
        support: 0,
        reason: '' 
    });

    const IMG_URL = "http://localhost:3300/uploads/avatars/";

    useEffect(() => { loadPosts(); }, []);

    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredPosts(posts);
        } else if (statusFilter === 'need_payment') {
            // Lọc những bài có ít nhất 1 yêu cầu duyệt tiền
            setFilteredPosts(posts.filter(p => p.pending_payments > 0));
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

    // Mở danh sách gia sư ứng tuyển
    const handleOpenTutorApps = async (postId) => {
        try {
            setShowTutorApps(true);
            setLoadingApps(true);
            const res = await postApi.getApplicationsByPostId(postId);
            const data = res.data ? res.data : res;
            setTutorAppsList(Array.isArray(data) ? data : (data ? [data] : []));
        } catch (error) {
            console.error("Lỗi lấy danh sách gia sư:", error);
            setTutorAppsList([]);
        } finally {
            setLoadingApps(false);
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
            await postApi.approvePostWithFee(selectedPost.post_id, {
                status: status,
                commissionPercent: approveForm.commission,
                supportPercent: approveForm.support,
                reason: approveForm.reason
            });
            
            alert(status === 'approved' ? "Đã duyệt bài đăng!" : "Đã từ chối bài đăng!");
            setShowDetail(false);
            loadPosts();
            refreshAdminCounts();
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || "Thao tác thất bại"));
        }
    };

    const openRefundModal = (app) => {
        setRefundForm({
            paymentId: app.payment_id,
            postId: app.post_id,
            provider: getPaymentProvider(app.transaction_code),
            toBin: '',
            toAccountNumber: '',
            description: `Hoàn phí post #${app.post_id}`
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
            const response = await postApi.refundPayment(refundForm.paymentId, {
                toBin: refundForm.toBin.trim(),
                toAccountNumber: refundForm.toAccountNumber.trim(),
                description: refundForm.description.trim()
            });
            alert(response?.message || response?.data?.message || 'Đã tạo lệnh hoàn tiền thành công!');
            closeRefundModal();
            await handleOpenTutorApps(refundForm.postId);
            loadPosts();
        } catch (error) {
            alert('Lỗi khi hoàn tiền: ' + (error.response?.data?.error || error.message));
        } finally {
            setSubmittingRefund(false);
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
                            <th className="text-center">GS ứng tuyển</th>
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
                                {/* CỘT GS ỨNG TUYỂN CÓ THỂ CLICK */}
                                <td className="text-center">
                                    <Badge 
                                        bg="info" 
                                        className="p-2 cursor-pointer" 
                                        style={{ cursor: 'pointer', minWidth: '35px' }}
                                        onClick={() => handleOpenTutorApps(p.post_id)}
                                        title="Bấm để xem danh sách gia sư"
                                    >
                                        {p.total_applications || 0}
                                    </Badge>
                                </td>
                                <td className="text-center">{renderStatusBadge(p.status)}
                                    {/* Cảnh báo duyệt tiền */}
                                    {p.pending_payments > 0 && (
                                        <Badge 
                                            pill 
                                            bg="danger" 
                                            className="position-absolute pulse-danger" 
                                            style={{ top: '-5px', right: '-5px', fontSize: '10px' }}
                                        >
                                            {p.pending_payments} đơn tiền
                                        </Badge>
                                    )}
                                </td>
                                <td className="text-center text-primary fw-bold">
                                    {p.fee_receive ? Number(p.fee_receive).toLocaleString() + 'đ' : '---'}
                                </td>
                                <td className="text-center">
                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleViewDetail(p)}>
                                        <i className="bi bi-eye"></i>
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={async () => { if (await appConfirm("Bạn chắc chắn muốn xóa bài đăng?")) postApi.deletePost(p.post_id).then(()=>loadPosts()); }}>
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="7" className="text-center py-4 text-muted">Không có bài đăng nào.</td></tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* MODAL 1: CHI TIẾT BÀI ĐĂNG */}
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
                                            selectedPost.preferred_gender === 'female' ? 'Nữ' : 'Không yêu cầu giới tính'
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
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Trạng thái hiện tại: {renderStatusBadge(selectedPost.status)}</span>
                                        <div className="d-flex gap-4">
                                            <span>Số GS ứng tuyển: <b className="text-primary" style={{cursor:'pointer', textDecoration:'underline'}} onClick={() => {setShowDetail(false); handleOpenTutorApps(selectedPost.post_id)}}>{selectedPost.total_applications || 0}</b></span>
                                            <span>Phí thu: <b>{Number(selectedPost.fee_receive).toLocaleString()}đ</b></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            {/* MODAL 2: DANH SÁCH GIA SƯ ỨNG TUYỂN */}
            <Modal show={showTutorApps} onHide={() => setShowTutorApps(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title className="fw-bold fs-5">Gia sư đã ứng tuyển</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {loadingApps ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : tutorAppsList.length > 0 ? (
                        <ListGroup variant="flush">
                            {tutorAppsList.map((app) => (
                                <ListGroup.Item key={app.post_application_id} className="p-3">
                                    <Row className="align-items-center">
                                        <Col xs={2} className="text-center">
                                            <img 
                                                src={app.avatar ? `${IMG_URL}${app.avatar}` : "/image/avatar.jpg"} 
                                                className="rounded-circle border" style={{width: '70px', height: '70px', objectFit: 'cover'}}
                                                alt="avt"
                                            />
                                        </Col>
                                        <Col xs={6}>
                                            <div className="fw-bold text-primary fs-5">{app.full_name}</div>
                                            <div className="small mb-1">
                                                <i className="bi bi-telephone-fill text-success me-2"></i><b>{app.tutor_phone}</b>
                                            </div>
                                            <div className="small text-muted mb-1">
                                                <i className="bi bi-geo-alt-fill text-danger me-2"></i>{app.tutor_address}
                                            </div>
                                            <div className="small text-dark mt-2"><b>Trình độ:</b> {app.education}</div>
                                        </Col>
                                        <Col xs={4} className="text-end border-start">
                                            {/* Trạng thái phản hồi của học viên */}
                                            <div className="mb-2">
                                                <small className="text-muted d-block mb-1">Học viên phản hồi:</small>
                                                <Badge bg={app.apply_status === 'pending' ? 'warning' : app.apply_status === 'agreed' ? 'success' : 'danger'}>
                                                    {app.apply_status === 'pending' ? 'ĐANG CHỜ' : app.apply_status === 'agreed' ? 'CHẤP NHẬN' : 'TỪ CHỐI'}
                                                </Badge>
                                            </div>

                                            {/* Trạng thái thanh toán */}
                                            {app.apply_status === 'agreed' && (
                                                <div className="mt-3 pt-2 border-top">
                                                    <small className="text-muted d-block mb-1">Trạng thái thanh toán:</small>
                                                    <small className="text-muted d-block mb-2">
                                                        Cổng: <b>{getPaymentProviderLabel(getPaymentProvider(app.transaction_code))}</b>
                                                        {app.transaction_code ? ` - Mã GD: ${app.transaction_code}` : ''}
                                                    </small>
                                                    {!app.payment_status ? (
                                                        <Badge bg="secondary">CHƯA NỘP PHÍ</Badge>
                                                    ) : app.payment_status === 'pending' ? (
                                                        <Badge bg="warning" text="dark">ĐANG CHỜ CỔNG THANH TOÁN XÁC NHẬN</Badge>
                                                    ) : app.payment_status === 'refunded' ? (
                                                        <Badge bg="dark">ĐÃ HOÀN TIỀN</Badge>
                                                    ) : (
                                                        <>
                                                            <Badge bg="success">ĐÃ HOÀN TẤT PHÍ</Badge>
                                                            {selectedPost?.status === 'cancelled' && (
                                                                app.refund_eligible ? (
                                                                    <Button 
                                                                        variant="warning" 
                                                                        size="sm" 
                                                                        className="w-100 fw-bold mt-2"
                                                                        onClick={() => openRefundModal(app)}
                                                                    >
                                                                        XỬ LÝ HOÀN TIỀN
                                                                    </Button>
                                                                ) : (
                                                                    <small className="d-block text-muted mt-2">Đã quá 5 ngày hoặc giao dịch không còn đủ điều kiện hoàn tiền.</small>
                                                                )
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <div className="text-center py-5 text-muted">Chưa có gia sư nào ứng tuyển.</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTutorApps(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showRefundModal} onHide={closeRefundModal} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold">Hoàn tiền giao dịch nhận lớp</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {refundForm.provider !== 'payos' ? (
                        <div className="small text-muted d-flex flex-column gap-2">
                            <div><b>{getPaymentProviderLabel(refundForm.provider)} hiện chưa có luồng auto-refund trong codebase này.</b></div>
                            <div>Admin cần nhận mã QR hoặc thông tin tài khoản từ gia sư rồi hoàn thủ công ngoài hệ thống.</div>
                        </div>
                    ) : (
                        <Form className="d-flex flex-column gap-3">
                            <div className="small text-muted">
                                Hệ thống sẽ tạo lệnh chi qua PayOS payout để trả lại phí nhận lớp cho gia sư.
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

export default PostManagement;






