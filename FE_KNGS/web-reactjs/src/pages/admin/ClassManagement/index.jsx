import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Modal, Form, Row, Col, Card, Spinner, ListGroup } from 'react-bootstrap';
import * as classApi from '../../../services/classSessionApi';
import "../admin.scss"; 

const ClassManagement = () => {
    const [sessions, setSessions] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await classApi.adminGetAllClassSessions();
            setSessions(res || []);
            setFilteredData(res || []);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        setFilteredData(statusFilter === 'all' ? sessions : sessions.filter(s => s.status === statusFilter));
    }, [statusFilter, sessions]);

    const renderStars = (rating) => {
        if (!rating) return <span className="text-muted small">Chưa đánh giá</span>;
        return (
            <div className="text-warning small">
                {[...Array(5)].map((_, i) => (
                    <i key={i} className={`bi ${i < rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                ))}
            </div>
        );
    };

    const getStatusBadge = (status) => {
        const map = {
            ongoing: { bg: 'primary', text: 'ĐANG DẠY' },
            completed: { bg: 'warning', text: 'CHỜ XÁC NHẬN' },
            success: { bg: 'success', text: 'HOÀN THÀNH' },
            cancelled: { bg: 'danger', text: 'ĐÃ HỦY' }
        };
        const item = map[status] || { bg: 'secondary', text: status?.toUpperCase() };
        return <Badge bg={item.bg}>{item.text}</Badge>;
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <div className="admin-management-wrapper">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="page-title mb-0">Quản lý Lớp học & Đánh giá</h3>
                <Form.Select size="sm" style={{ width: '200px' }} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">Tất cả trạng thái</option>
                    <option value="ongoing">Đang giảng dạy</option>
                    <option value="success">Đã hoàn thành</option>
                    <option value="cancelled">Đã hủy lớp</option>
                </Form.Select>
            </div>

            <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
                <Table striped bordered hover className="custom-table align-middle text-center mb-0">
                    <thead>
                        <tr>
                            <th>Mã lớp</th>
                            <th>Môn học / Lớp</th>
                            <th>Học viên</th>
                            <th>Gia sư</th>
                            <th>Học phí</th>
                            <th>Trạng thái</th>
                            <th>Đánh giá</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => (
                            <tr key={item.class_session_id}>
                                <td className="fw-bold">#{item.class_session_id}</td>
                                <td>
                                    <div className="fw-bold text-primary">{item.subject_name}</div>
                                    <small className="text-muted">{item.grade}</small>
                                </td>
                                <td className="text-start">{item.student_name}</td>
                                <td className="text-start">{item.tutor_name}</td>
                                <td className="fw-bold text-danger">
                                    {/* Giữ fallback 0 để tránh lỗi format khi dữ liệu rỗng */}
                                    {item.tuition ? Number(item.tuition).toLocaleString() : '0'}đ
                                </td>
                                <td>{getStatusBadge(item.status)}</td>
                                <td>{renderStars(item.student_rating)}</td>
                                <td>
                                    <Button variant="light" size="sm" className="border shadow-sm" onClick={() => { setSelected(item); setShowModal(true); }}>
                                        <i className="bi bi-eye"></i> Chi tiết
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* MODAL CHI TIẾT ĐẦY ĐỦ NHƯ YÊU CẦU */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold" style={{color: '#0c024c'}}>Chi tiết lớp học #{selected?.class_session_id}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selected && (
                        <>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h6 className="modal-section-title"><i className="bi bi-person-fill"></i> Thông tin Học viên</h6>
                                    <ListGroup variant="flush" className="border rounded small">
                                        <ListGroup.Item><b>Họ tên:</b> {selected.student_name}</ListGroup.Item>
                                        <ListGroup.Item><b>SĐT:</b> <span className="text-primary fw-bold">{selected.student_phone || 'Chưa cập nhật'}</span></ListGroup.Item>
                                        <ListGroup.Item><b>Email:</b> {selected.student_email || 'Chưa cập nhật'}</ListGroup.Item>
                                        <ListGroup.Item><b>Địa chỉ:</b> {selected.student_address || 'Chưa cập nhật'}</ListGroup.Item>
                                    </ListGroup>
                                </Col>
                                <Col md={6}>
                                    <h6 className="modal-section-title"><i className="bi bi-mortarboard-fill"></i> Thông tin Gia sư</h6>
                                    <ListGroup variant="flush" className="border rounded small">
                                        <ListGroup.Item><b>Họ tên:</b> {selected.tutor_name}</ListGroup.Item>
                                        <ListGroup.Item><b>SĐT:</b> <span className="text-primary fw-bold">{selected.tutor_phone || 'Chưa cập nhật'}</span></ListGroup.Item>
                                        <ListGroup.Item><b>Email:</b> {selected.tutor_email || 'Chưa cập nhật'}</ListGroup.Item>
                                        <ListGroup.Item><b>Học phí:</b> <span className="text-danger fw-bold">{Number(selected.tuition).toLocaleString()}đ/buổi</span></ListGroup.Item>
                                    </ListGroup>
                                </Col>
                            </Row>

                            <h6 className="modal-section-title"><i className="bi bi-geo-alt-fill"></i> Địa điểm dạy & Môn học</h6>
                            <div className="p-3 bg-light rounded border small mb-4">
                                <p className="mb-1"><b>Môn học:</b> {selected.subject_name} ({selected.grade})</p>
                                <p className="mb-0"><b>Địa chỉ lớp:</b> {selected.teaching_address}</p>
                            </div>

                            {/* Phần đánh giá 2 chiều */}
                            <h6 className="modal-section-title"><i className="bi bi-chat-square-quote-fill"></i> Đánh giá từ hai phía</h6>
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Card className="h-100 border-0 bg-light shadow-sm">
                                        <Card.Body>
                                            <div className="fw-bold mb-1 small">Học viên → Gia sư</div>
                                            {renderStars(selected.student_rating)}
                                            <p className="mt-2 small italic text-secondary">
                                                {selected.student_comment ? `"${selected.student_comment}"` : "Chưa có bình luận."}
                                            </p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Card className="h-100 border-0 bg-light shadow-sm">
                                        <Card.Body>
                                            <div className="fw-bold mb-1 small">Gia sư → Học viên</div>
                                            {renderStars(selected.tutor_rating)}
                                            <p className="mt-2 small italic text-secondary">
                                                {selected.tutor_comment ? `"${selected.tutor_comment}"` : "Chưa có bình luận."}
                                            </p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ClassManagement;






