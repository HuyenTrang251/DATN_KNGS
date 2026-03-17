import React from 'react';
import './manageBookings.scss';

const ManageBookings = () => {
  return (
    <div className="manage-bookings-container">
      <h1>Danh sách học viên đặt lịch</h1>
      <table className="tutor-table">
        <thead>
          <tr>
            <th>Học viên</th>
            <th>Môn học</th>
            <th>Hình thức</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {/* Map data từ bảng bookings ở đây */}
          <tr>
            <td>Nguyễn Văn A</td>
            <td>Toán - Lớp 10</td>
            <td>Offline</td>
            <td><span className="status pending">Chờ phản hồi</span></td>
            <td>
              <button className="btn-approve">Đồng ý</button>
              <button className="btn-reject">Từ chối</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ManageBookings;