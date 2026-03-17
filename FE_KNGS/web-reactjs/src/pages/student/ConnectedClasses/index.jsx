import React, { useState } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

function ConnectedClasses() {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });

  const classes = [
    { id: 50, tutor: "Nguyễn Văn A", subject: "Toán 10", status: "completed", reviewed: true },
    { id: 51, tutor: "Lê Thị D", subject: "Lý 11", status: "ongoing", reviewed: false },
  ];

  const handleOpenReview = (cls) => {
    setCurrentClass(cls);
    setShowReviewModal(true);
  };

  return (
    <div className="p-4">
      <h4 className="mb-4">LỚP HỌC ĐÃ KẾT NỐI</h4>
      <Table responsive hover className="bg-white shadow-sm">
        <thead>
          <tr>
            <th>Gia sư</th>
            <th>Môn dạy</th>
            <th>Trạng thái</th>
            <th>Đánh giá</th>
          </tr>
        </thead>
        <tbody>
          {classes.map(c => (
            <tr key={c.id}>
              <td>{c.tutor}</td>
              <td>{c.subject}</td>
              <td>{c.status === 'completed' ? 'Đã hoàn thành' : 'Đang học'}</td>
              <td>
                {c.status === 'completed' ? (
                  c.reviewed ? (
                    <div>
                      <Button variant="outline-primary" size="sm" className="me-2">Sửa đánh giá</Button>
                      <Button variant="outline-danger" size="sm">Xóa</Button>
                    </div>
                  ) : (
                    <Button variant="warning" size="sm" onClick={() => handleOpenReview(c)}>Viết đánh giá</Button>
                  )
                ) : (
                  <span className="text-muted small">Chưa thể đánh giá</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton><Modal.Title>Đánh giá gia sư: {currentClass?.tutor}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Số sao (1-5)</Form.Label>
            <Form.Control type="number" min="1" max="5" defaultValue={5} onChange={e => setReviewData({...reviewData, rating: e.target.value})}/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nhận xét</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Gia sư dạy nhiệt tình, dễ hiểu..." onChange={e => setReviewData({...reviewData, comment: e.target.value})} />
          </Form.Group>
          <Button variant="primary" className="w-100">Gửi đánh giá</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ConnectedClasses;