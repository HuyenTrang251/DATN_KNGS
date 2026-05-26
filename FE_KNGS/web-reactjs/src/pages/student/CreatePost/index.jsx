import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as postApi from '../../../services/postApi';
import { getAllSubjects } from '../../../services/subjectApi';

function CreatePost() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Khởi tạo state khớp hoàn toàn với các cột trong Database
  const [formData, setFormData] = useState({
    subject_id: '',
    grade: '',
    student_quantity: 1,
    hours_per_session: 2,
    sessions_per_week: 2,
    tutor_type: 'all',
    teaching_mode: 'offline',
    tuition_fee_per_session: '',
    contact_phone: '',
    preferred_gender: 'none',
    address: '',
    note: ''
  });

  // 1. Lấy danh sách môn học khi load trang
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getAllSubjects();
        setSubjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi lấy môn học:", err);
      }
    };
    fetchSubjects();
  }, []);

  // 2. Hàm xử lý thay đổi input chung
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 3. Gửi dữ liệu về Server
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra đăng nhập (Role học viên mới được đăng bài)
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role_id !== 3) {
      alert("Vui lòng đăng nhập bằng tài khoản Học viên để đăng bài!");
      return;
    }

    try {
      setLoading(true);
      // Chuyển đổi các trường số về đúng định dạng trước khi gửi
      const payload = {
        ...formData,
        subject_id: Number(formData.subject_id),
        student_quantity: Number(formData.student_quantity),
        hours_per_session: parseFloat(formData.hours_per_session),
        sessions_per_week: Number(formData.sessions_per_week),
        tuition_fee_per_session: parseFloat(formData.tuition_fee_per_session)
      };

      await postApi.createPost(payload);
      
      alert("Đăng bài thành công! Bài viết đang chờ Admin phê duyệt.");
      navigate('/student/quan-ly-bai-dang'); 
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || "Lỗi không xác định";
      alert("Lỗi: " + errorMsg); 
      console.error("Chi tiết lỗi 400:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-3" style={{ marginTop: '0px' }}>
      <Card className="shadow-sm border-0">
        <Card.Header className="text-white py-3 text-center" style={{backgroundColor: "#0c024c", height: "50px"}}>
          <h5 className="mb-0 fw-bold">ĐĂNG BÀI TÌM GIA SƯ</h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-bold small">Môn học cần tìm</Form.Label>
                <Form.Select 
                  name="subject_id" 
                  required 
                  value={formData.subject_id} 
                  onChange={handleChange}
                >
                  <option value="">-- Chọn môn học --</option>
                  {subjects.map(s => (
                    <option key={s.subject_id} value={s.subject_id}>{s.name}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold small">Lớp học / Trình độ</Form.Label>
                <Form.Control 
                  type="text" 
                  name="grade"
                  placeholder="Ví dụ: Lớp 10, Luyện thi Ielts..." 
                  required 
                  value={formData.grade}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={3}>
                <Form.Label className="fw-bold small">Học phí / Buổi (VNĐ)</Form.Label>
                <Form.Control 
                  type="number" 
                  name="tuition_fee_per_session"
                  placeholder="200000" 
                  required 
                  value={formData.tuition_fee_per_session}
                  onChange={handleChange}
                />
              </Col>
              <Col md={3}>
                <Form.Label className="fw-bold small">Số buổi / Tuần</Form.Label>
                <Form.Control 
                  type="number" 
                  name="sessions_per_week"
                  value={formData.sessions_per_week}
                  onChange={handleChange}
                />
              </Col>
              <Col md={3}>
                <Form.Label className="fw-bold small">Thời lượng (Giờ/buổi)</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.5"
                  name="hours_per_session"
                  value={formData.hours_per_session}
                  onChange={handleChange}
                />
              </Col>
              <Col md={3}>
                <Form.Label className="fw-bold small">Số lượng học sinh</Form.Label>
                <Form.Control 
                  type="number" 
                  name="student_quantity"
                  value={formData.student_quantity}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={3}>
                <Form.Label className="fw-bold small">Hình thức dạy</Form.Label>
                <Form.Select name="teaching_mode" value={formData.teaching_mode} onChange={handleChange}>
                  <option value="offline">Tại nhà (Offline)</option>
                  <option value="online">Trực tuyến (Online)</option>
                  <option value="all">Cả hai</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="fw-bold small">Yêu cầu gia sư</Form.Label>
                <Form.Select name="tutor_type" value={formData.tutor_type} onChange={handleChange}>
                  <option value="all">Mọi đối tượng</option>
                  <option value="student">Sinh viên</option>
                  <option value="teacher">Giáo viên</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="fw-bold small">Giới tính gia sư</Form.Label>
                <Form.Select name="preferred_gender" value={formData.preferred_gender} onChange={handleChange}>
                  <option value="none">Tùy ý</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="fw-bold small">SĐT liên hệ</Form.Label>
                <Form.Control 
                  type="text" 
                  name="contact_phone"
                  placeholder="Nhập SĐT nhận tin" 
                  required 
                  value={formData.contact_phone}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">Địa điểm dạy (Địa chỉ chi tiết)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                name="address"
                placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện..." 
                required 
                value={formData.address}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold small">Ghi chú & Yêu cầu khác</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="note"
                placeholder="Mô tả học lực học sinh, lịch học cụ thể, các yêu cầu đặc biệt về gia sư..." 
                value={formData.note}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="text-center">
              <Button variant="primary" type="submit" size="lg" className="px-5 fw-bold rounded-pill shadow-sm" disabled={loading}>
                {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG BÀI NGAY"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CreatePost;


