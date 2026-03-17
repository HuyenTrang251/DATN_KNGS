import React from 'react';
import './manageApplications.scss';

const ManageApplications = () => {
  return (
    <div className="manage-apps-container">
      <h1>Lớp đã đăng ký nhận</h1>
      <div className="app-list">
        {/* Logic: Nếu status = 'agreed' (Học viên đồng ý) -> Hiện nút Thanh toán */}
        <div className="app-card">
          <h3>Lớp Lý - 12 (Mã: #P102)</h3>
          <p>Trạng thái: <b className="text-success">Học viên đã đồng ý</b></p>
          <button className="btn-payment">Thanh toán phí nhận lớp (QR)</button>
        </div>
      </div>
    </div>
  );
};

export default ManageApplications;