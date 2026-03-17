import React, { useState } from 'react';
import { Table, Badge, Button, Modal } from 'react-bootstrap';

function ManagePosts() {
  const [showApplyModal, setShowApplyModal] = useState(false);
  
  // Dữ liệu mẫu
  const myPosts = [
    { id: 101, subject: "Toán 10", date: "2024-03-10", status: "approved", applies: 3 },
    { id: 102, subject: "Văn 12", date: "2024-03-12", status: "pending", applies: 0 },
  ];

  const statusMap = {
    pending: { text: "Chờ duyệt", color: "warning" },
    approved: { text: "Đang hiển thị", color: "success" },
    connecting: { text: "Đang kết nối", color: "info" },
  };

  return (
    <div className="p-4">
      <h4 className="mb-4">BÀI ĐĂNG CỦA TÔI</h4>
      <Table hover responsive className="bg-white shadow-sm">
        <thead className="table-light">
          <tr>
            <th>Mã bài</th>
            <th>Nội dung</th>
            <th>Ngày đăng</th>
            <th>Trạng thái</th>
            <th>Ứng tuyển</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {myPosts.map(post => (
            <tr key={post.id}>
              <td>#{post.id}</td>
              <td>{post.subject}</td>
              <td>{post.date}</td>
              <td>
                <Badge bg={statusMap[post.status].color}>{statusMap[post.status].text}</Badge>
              </td>
              <td>
                <Button variant="link" onClick={() => setShowApplyModal(true)}>
                  {post.applies} gia sư ứng tuyển
                </Button>
              </td>
              <td>
                <Button variant="outline-danger" size="sm">Hủy bài</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal xem danh sách gia sư ứng tuyển để chọn */}
      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Gia sư ứng tuyển</Modal.Title></Modal.Header>
        <Modal.Body>
          <Table>
            <thead><tr><th>Gia sư</th><th>Kinh nghiệm</th><th>Thao tác</th></tr></thead>
            <tbody>
              <tr>
                <td>Nguyễn Văn A</td>
                <td>Sinh viên ĐH Sư Phạm</td>
                <td><Button variant="success" size="sm">Chấp nhận & Lấy thông tin</Button></td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ManagePosts;