import React from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';

function StudentProfile() {
  return (
    <div className="p-4">
      <h4 className="mb-4">THÔNG TIN CÁ NHÂN</h4>
      <Card className="p-4 border-0 shadow-sm">
        <Form>
          <Row>
            <Col md={4} className="text-center mb-4">
              <img src="/image/avatar.jpg" alt="avatar" className="rounded-circle img-thumbnail mb-2" style={{width: '150px'}} />
              <Form.Control type="file" size="sm" />
            </Col>
            <Col md={8}>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control type="text" defaultValue="Nguyễn Học Viên" />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>Email (Không thể đổi)</Form.Label>
                  <Form.Control type="email" defaultValue="hocvien@gmail.com" disabled />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control type="text" defaultValue="0987654321" />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>Giới tính</Form.Label>
                  <Form.Select>
                    <option>Nam</option>
                    <option>Nữ</option>
                  </Form.Select>
                </Col>
                <Col md={12} className="mb-3">
                  <Form.Label>Địa chỉ mặc định</Form.Label>
                  <Form.Control type="text" defaultValue="Hà Nội, Việt Nam" />
                </Col>
              </Row>
              <Button variant="primary" className="px-4">Lưu thay đổi</Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

export default StudentProfile;