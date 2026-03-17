import React from 'react';
import './profile.scss';

const TutorProfile = () => {
  return (
    <div className="profile-container">
      <h2>Thiết lập thông tin cá nhân Gia sư</h2>
      
      <form className="profile-form">
        {/* Nhóm thông tin cơ bản từ bảng users */}
        <div className="row-group">
          <div className="form-group">
            <label>Họ và tên</label>
            <input type="text" placeholder="Nguyễn Văn A" />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="text" placeholder="090xxxxxxx" />
          </div>
        </div>

        <div className="row-group">
          <div className="form-group">
            <label>Ngày sinh</label>
            <input type="date" />
          </div>
          <div className="form-group">
            <label>Giới tính</label>
            <select>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Địa chỉ hiện tại</label>
          <input type="text" placeholder="Số nhà, Tên đường, Quận/Huyện..." />
        </div>

        {/* Thông tin chuyên môn từ bảng tutors */}
        <div className="form-group">
          <label>Kinh nghiệm & Trình độ học vấn</label>
          <textarea placeholder="Mô tả quá trình học tập và đi dạy của bạn..."></textarea>
        </div>

        <div className="row-group">
          <div className="form-group">
            <label>Hình thức dạy</label>
            <select>
              <option value="online">Online</option>
              <option value="offline">Offline (Tận nơi)</option>
              <option value="all">Cả hai</option>
            </select>
          </div>
          <div className="form-group">
            <label>Link Video giới thiệu (Youtube/Drive)</label>
            <input type="text" placeholder="https://youtube.com/watch?v=..." />
          </div>
        </div>

        <div className="form-group">
          <label>Upload CV / Bằng cấp (Định dạng PDF)</label>
          <input type="file" accept=".pdf" />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save">
            Cập nhật thông tin
          </button>
          
          <button type="button" className="btn-verify" onClick={() => alert('Chức năng thanh toán 200k đang được kết nối...')}>
            Đăng ký Tích Xanh (200.000đ)
          </button>
        </div>
      </form>
    </div>
  );
};

export default TutorProfile;