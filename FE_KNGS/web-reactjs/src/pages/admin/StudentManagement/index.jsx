import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Modal, Row, Col } from 'react-bootstrap';
import { getAllStudents } from '../../../services/studentApi';
import axiosClient from '../../../api/axiosClient'; // Dùng chung để gọi API status

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const AVATAR_BASE_URL = "http://localhost:3300/uploads/avatars";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await getAllStudents();
            setStudents(data);
        } catch (error) {
            console.error("Lỗi:", error);
        }
    };

    // Hàm cập nhật trạng thái linh hoạt
const handleUpdateStatus = async (userId, newStatus) => {
    const statusMap = {
        active: "Kích hoạt",
        warning: "Cảnh cáo",
        locked: "Khóa"
    };

    if (window.confirm(`Xác nhận chuyển trạng thái sang: ${statusMap[newStatus]}?`)) {
        try {
            // Gọi api update status đã viết ở bước trước
            await axiosClient.put(`/users/status/${userId}`, { status: newStatus });
            fetchData(); // Load lại danh sách
        } catch (error) {
            alert("Cập nhật thất bại: " + error.message);
        }
    }
  };

    const handleViewDetail = (student) => {
        setSelectedStudent(student);
        setShowDetail(true);
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-4 fw-bold">Quản lý học viên</h3>
            <Table striped bordered hover responsive className="align-middle shadow-sm">
                <thead className="table-dark">
                    <tr>
                        <th className="text-center">Ảnh</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Lớp</th>
                        <th className="text-center">Trạng thái</th>
                        <th className="text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((s) => (
                        <tr key={s.user_id}>
                            <td className="text-center">
                                <img 
                                    src={s.avatar ? `${AVATAR_BASE_URL}/${s.avatar}` : '/image/avatar.jpg'} 
                                    alt="avatar" 
                                    className="rounded-circle border"
                                    style={{width: '45px', height: '45px', objectFit: 'cover'}}
                                    onError={(e) => e.target.src = '/image/avatar.jpg'}
                                />
                            </td>
                            <td className="fw-medium">{s.full_name}</td>
                            <td>{s.email}</td>
                            <td>{s.grade || 'N/A'}</td>
                            <td className="text-center">
                                <Badge bg={s.status === 'active' ? 'success' : s.status === 'locked' ? 'danger' : 'warning'}>
                                    {s.status.toUpperCase()}
                                </Badge>
                            </td>
                            <td className="text-center">
                            {/* Nút Xem chi tiết */}
                            <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleViewDetail(s)}>
                                <i className="bi bi-eye"></i>
                            </Button>

                            {/* Logic hiển thị nút theo trạng thái hiện tại */}
                            {s.status === 'active' && (
                                <>
                                    <Button variant="outline-warning" size="sm" className="me-1" onClick={() => handleUpdateStatus(s.user_id, 'warning')} title="Cảnh cáo">
                                        <i className="bi bi-exclamation-triangle"></i>
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleUpdateStatus(s.user_id, 'locked')} title="Khóa">
                                        <i className="bi bi-lock"></i>
                                    </Button>
                                </>
                            )}

                            {s.status === 'warning' && (
                                <>
                                    <Button variant="outline-success" size="sm" className="me-1" onClick={() => handleUpdateStatus(s.user_id, 'active')} title="Bỏ cảnh cáo">
                                        <i className="bi bi-check-circle"></i>
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleUpdateStatus(s.user_id, 'locked')} title="Khóa">
                                        <i className="bi bi-lock"></i>
                                    </Button>
                                </>
                            )}

                            {s.status === 'locked' && (
                                <Button variant="outline-success" size="sm" onClick={() => handleUpdateStatus(s.user_id, 'active')} title="Mở khóa">
                                    <i className="bi bi-unlock"></i> Mở khóa
                                </Button>
                            )}
                        </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal Chi tiết Học viên */}
            <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Thông tin chi tiết học viên</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedStudent && (
                        <Row>
                            <Col md={4} className="text-center border-end">
                                <img 
                                    src={selectedStudent.avatar ? `${AVATAR_BASE_URL}/${selectedStudent.avatar}` : '/image/avatar.jpg'} 
                                    className="img-fluid rounded border mb-3" 
                                    style={{maxHeight: '200px'}}
                                    alt="profile"
                                />
                                <h5 className="fw-bold">{selectedStudent.full_name}</h5>
                                <Badge bg="secondary">ID: {selectedStudent.user_id}</Badge>
                            </Col>
                            <Col md={8} className="ps-4">
                                <Row className="mb-2">
                                    <Col sm={4} className="text-muted">Email:</Col>
                                    <Col sm={8} className="fw-bold">{selectedStudent.email}</Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col sm={4} className="text-muted">Số điện thoại:</Col>
                                    <Col sm={8}>{selectedStudent.phone || 'Chưa cập nhật'}</Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col sm={4} className="text-muted">Giới tính:</Col>
                                    <Col sm={8}>{selectedStudent.gender === 'male' ? 'Nam' : 'Nữ'}</Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col sm={4} className="text-muted">Ngày sinh:</Col>
                                    <Col sm={8}>{new Date(selectedStudent.date_of_birth).toLocaleDateString('vi-VN')}</Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col sm={4} className="text-muted">Địa chỉ:</Col>
                                    <Col sm={8}>{selectedStudent.address}</Col>
                                </Row>
                                <hr/>
                                <Row className="mb-2">
                                    <Col sm={4} className="text-muted">Khối lớp:</Col>
                                    <Col sm={8} className="text-primary fw-bold">{selectedStudent.grade}</Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col sm={4} className="text-muted">Số lần vi phạm:</Col>
                                    <Col sm={8} className="text-danger">{selectedStudent.violation_count}</Col>
                                </Row>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetail(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default StudentManagement;