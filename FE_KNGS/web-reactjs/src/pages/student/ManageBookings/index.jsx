import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';

function ManageBookings() {
  const bookings = [
    { id: 1, tutor: "Trần Thị B", subject: "Tiếng Anh", status: "pending", time: "2024-03-15" },
    { id: 2, tutor: "Lê Văn C", subject: "Hóa học", status: "approved", time: "2024-03-14" },
  ];

  return (
    <div className="p-4">
      <h4 className="mb-4">YÊU CẦU ĐẶT LỊCH GIA SƯ</h4>
      <Table hover className="bg-white shadow-sm">
        <thead>
          <tr>
            <th>Gia sư</th>
            <th>Môn học</th>
            <th>Ngày gửi</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td>{b.tutor}</td>
              <td>{b.subject}</td>
              <td>{b.time}</td>
              <td>
                <Badge bg={b.status === 'pending' ? 'warning' : 'success'}>
                  {b.status === 'pending' ? 'Chờ gia sư phản hồi' : 'Gia sư đã đồng ý'}
                </Badge>
              </td>
              <td>
                <Button variant="outline-secondary" size="sm">Xem chi tiết</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default ManageBookings;