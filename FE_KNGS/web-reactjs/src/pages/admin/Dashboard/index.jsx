import React from "react";
import "./dashboard.scss";

function Dashboard() {
  // Dữ liệu mẫu (Sau này bạn sẽ fetch từ API dựa trên Database)
  const stats = [
    { label: "Doanh thu tháng", value: "15.200.000đ", icon: "bi-currency-dollar" },
    { label: "Gia sư chờ duyệt", value: "12", icon: "bi-person-check" },
    { label: "Bài đăng mới", value: "08", icon: "bi-file-earmark-plus" },
    { label: "Đặt lịch cần xử lý", value: "05", icon: "bi-calendar-event" },
  ];

  return (
    <div className="dashboard-admin">
      <h2 className="mb-4">Tổng quan hệ thống</h2>
      
      {/* 4 Thẻ thống kê nhanh */}
      <div className="stats-grid">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="icon-box">
              <i className={`bi ${item.icon}`}></i>
            </div>
            <div className="info">
              <h3>{item.value}</h3>
              <p>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-section">
        {/* Danh sách duyệt nhanh */}
        <div className="content-box">
          <h4>Bài đăng/Đặt lịch mới nhất</h4>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Người gửi</th>
                <th>Môn học</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nguyễn Văn A</td>
                <td>Toán 12</td>
                <td>10 phút trước</td>
                <td><span className="badge bg-warning text-dark">Chờ duyệt</span></td>
              </tr>
              <tr>
                <td>Trần Thị B</td>
                <td>Tiếng Anh</td>
                <td>1 giờ trước</td>
                <td><span className="badge bg-warning text-dark">Chờ duyệt</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cảnh báo Logs nguy hiểm theo nghiệp vụ */}
        <div className="content-box">
          <h4>Thông báo & Logs nguy hiểm</h4>
          <div className="log-list">
            <div className="log-item danger">
              <strong>[DANGER]</strong> Admin_01 vừa xóa tài khoản Gia sư ID: #102
            </div>
            <div className="log-item warning">
              <strong>[WARN]</strong> User_Student_05 bị báo cáo xấu lần 2.
            </div>
            <div className="log-item">
              <strong>[INFO]</strong> Gia sư Nguyễn Văn C đã nộp phí tích xanh.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;