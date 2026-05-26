import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const RatingModal = ({ show, onHide, onSubmit, onDelete, initialData, targetName }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (show) {
            setRating(initialData?.rating || 5);
            setComment(initialData?.comment || '');
        }
    }, [show, initialData]);

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold fs-5 text-primary">
                    {initialData?.review_id ? 'Chỉnh sửa đánh giá' : `Đánh giá ${targetName}`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center mb-4">
                    <div className="text-warning fs-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i key={star} className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'} mx-1`}
                               onClick={() => setRating(star)} style={{ cursor: 'pointer' }}></i>
                        ))}
                    </div>
                    <p className="text-muted small">Vui lòng chọn số sao để đánh giá</p>
                </div>
                <Form.Group>
                    <Form.Label className="fw-bold small">Nhận xét của bạn</Form.Label>
                    <Form.Control as="textarea" rows={3} value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Nhập cảm nhận của bạn về lớp học..."
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer className="justify-content-between">
                <div>
                    {initialData?.review_id && (
                        <Button variant="outline-danger" size="sm" onClick={() => onDelete(initialData.review_id)}>
                            Xóa đánh giá
                        </Button>
                    )}
                </div>
                <div className="d-flex gap-2">
                    <Button variant="secondary" size="sm" onClick={onHide}>Hủy</Button>
                    <Button variant="primary" size="sm" className="px-4" onClick={() => onSubmit({ rating, comment })}>
                        {initialData?.review_id ? 'Cập nhật' : 'Gửi đánh giá'}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default RatingModal;


