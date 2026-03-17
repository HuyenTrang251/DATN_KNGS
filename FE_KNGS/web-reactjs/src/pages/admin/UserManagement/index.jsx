import React from 'react';

const UserManagement = () => {
  return (
    <div className="admin-container">
      <h1>Quản lý người dùng</h1>
      <div className="tabs">
        <button>Gia sư chờ duyệt</button>
        <button>Tất cả học viên</button>
        <button>Nhân viên & Phân quyền</button>
      </div>
      {/* Table hiển thị thông tin kèm nút Duyệt/Khóa */}
      <table>
         <thead>
           <tr>
             <th>Tên</th>
             <th>Email</th>
             <th>Loại</th>
             <th>Trạng thái</th>
             <th>Thao tác</th>
           </tr>
         </thead>
         {/* Dữ liệu mẫu */}
         <tbody>
           <tr>
             <td>Trần Văn B</td>
             <td>b@gmail.com</td>
             <td>Gia sư</td>
             <td>Pending</td>
             <td>
                <button>Xem chi tiết & Duyệt</button>
                <button className="btn-danger">Khóa</button>
             </td>
           </tr>
         </tbody>
      </table>
    </div>
  );
};

export default UserManagement;