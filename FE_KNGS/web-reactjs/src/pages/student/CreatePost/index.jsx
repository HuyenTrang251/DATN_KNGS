import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Container } from 'react-bootstrap';

function CreatePost() {
  const [formData, setFormData] = useState({
    subject_id: '', grade: '', student_quantity: 1, hours_per_session: 2,
    sessions_per_week: 2, tutor_type: 'all', teaching_mode: 'offline',
    tuition_fee_per_session: '', contact_phone: '', preferred_gender: 'none',
    address: '', note: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu đăng bài:", formData);
    alert("Gửi bài đăng thành công! Vui lòng chờ Admin duyệt.");
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-primary text-white py-3">
          <h5 className="mb-0">ĐĂNG BÀI TÌM GIA SƯ</h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Môn học</Form.Label>
                <Form.Select required onChange={(e) => setFormData({...formData, subject_id: e.target.value})}>
                  <option value="">-- Chọn môn học --</option>
                  <option value="1">Toán học</option>
                  <option value="2">Tiếng Anh</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Lớp học / Trình độ</Form.Label>
                <Form.Control type="text" placeholder="Ví dụ: Lớp 10, Luyện thi Ielts..." required />
              </Col>
            </Row>

            <Row>
              <Col md={3} className="mb-3">
                <Form.Label>Học phí / Buổi (VNĐ)</Form.Label>
                <Form.Control type="number" placeholder="200000" required />
              </Col>
              <Col md={3} className="mb-3">
                <Form.Label>Số buổi / Tuần</Form.Label>
                <Form.Control type="number" defaultValue={2} />
              </Col>
              <Col md={3} className="mb-3">
                <Form.Label>Hình thức</Form.Label>
                <Form.Select>
                  <option value="offline">Offline (Tại nhà)</option>
                  <option value="online">Online</option>
                </Form.Select>
              </Col>
              <Col md={3} className="mb-3">
                <Form.Label>Yêu cầu gia sư</Form.Label>
                <Form.Select>
                  <option value="all">Tất cả</option>
                  <option value="student">Sinh viên</option>
                  <option value="teacher">Giáo viên</option>
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ cụ thể</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="Số nhà, tên đường, quận/huyện..." required />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Ghi chú thêm</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Mô tả học lực học sinh, thời gian có thể học..." />
            </Form.Group>

            <div className="d-flex justify-content-center">
              <Button variant="primary" type="submit" size="lg" className="px-5">
                ĐĂNG BÀI NGAY
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CreatePost;