// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { getPublicTutors } from "../services/tutorApi"; 

// function CardTutor() {
//   const [tutors, setTutors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const BASE_URL = "http://localhost:3300"; // Đảm bảo URL này khớp với backend của bạn

//   useEffect(() => {
//     const fetchTutors = async () => {
//       try {
//         setLoading(true);
//         const response = await getPublicTutors();
        
//         /**
//          * LƯU Ý: Nếu axiosClient của bạn chưa có interceptor .data
//          * thì dữ liệu nằm trong response.data. Nếu đã có thì là response.
//          */
//         const data = response.data ? response.data : response;
        
//         console.log("Dữ liệu nhận được:", data);
//         setTutors(Array.isArray(data) ? data : []);
//       } catch (error) {
//         console.error("Lỗi khi gọi API lấy danh sách gia sư:", error);
//         setTutors([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTutors();
//   }, []);

//   if (loading) {
//     return <div className="text-center py-5">Đang tải danh sách gia sư...</div>;
//   }

//   return (
//     <div className="container my-5">
//       <h2 className="text-center mb-5 fw-bold">Danh sách gia sư nổi bật</h2>
      
//       <div className="row">
//         {tutors.length > 0 ? (
//           tutors.slice(0, 4).map((tutor) => {
//             // 1. Xử lý lấy danh sách môn học từ subject_details (JSON trả về mảng này)
//             // Ví dụ: "Toán, Lý, Hóa"
//             const subjectsDisplay = tutor.subject_details && tutor.subject_details.length > 0
//               ? [...new Set(tutor.subject_details.map(s => s.subject_name))].join(", ")
//               : "Đang cập nhật";

//             return (
//               <div key={tutor.tutor_id} className="col-md-3 col-sm-6 col-12 mb-4">
//                 <div className="card h-100 shadow-sm border-0 overflow-hidden" style={{ transition: "transform 0.3s" }}>
//                   {/* Hiển thị ảnh đại diện */}
//                   <div style={{ height: "250px", overflow: "hidden" }}>
//                     <img
//                       className="card-img-top w-100 h-100"
//                       style={{ objectFit: "cover" }}
//                       src={
//                         tutor.avatar
//                           ? `${BASE_URL}/uploads/avatars/${tutor.avatar}`
//                           : "/image/avatar.jpg"
//                       }
//                       alt={tutor.full_name}
//                       onError={(e) => {
//                         e.target.src = "/image/avatar.jpg";
//                       }}
//                     />
//                   </div>

//                   <div className="card-body d-flex flex-column">
//                     <h5 className="card-title fw-bold text-primary mb-2">
//                       {tutor.full_name} 
//                       {/* Sửa lỗi hiển thị icon: Phải render trực tiếp JSX */}
//                       {tutor.is_verified === 1 && (
//                         <i className="bi bi-patch-check-fill text-info ms-2" title="Đã xác minh"></i>
//                       )}
//                     </h5>

//                     <p className="card-text text-muted mb-2" style={{ fontSize: "0.9rem" }}>
//                       <i className="bi bi-geo-alt-fill text-danger me-1"></i>
//                       {/* Sửa: API trả về home_address */}
//                       {tutor.home_address || "Chưa cập nhật địa chỉ"}
//                     </p>

//                     <p className="card-text mb-2 fw-bold text-success" style={{ fontSize: "0.95rem" }}>
//                        Môn dạy: {subjectsDisplay}
//                     </p>

//                     <p className="card-text text-secondary mb-3" style={{ fontSize: "0.85rem", flex: 1 }}>
//                       {tutor.experience 
//                         ? (tutor.experience.length > 80 ? tutor.experience.substring(0, 80) + "..." : tutor.experience)
//                         : "Chưa cập nhật kinh nghiệm giảng dạy."}
//                     </p>

//                     <div className="mt-auto">
//                       <Link
//                         to={`/tutor/${tutor.tutor_id}`}
//                         className="btn btn-outline-primary rounded-pill w-100 fw-bold"
//                       >
//                         Xem chi tiết
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className="text-center w-100 py-4 text-muted">
//             Hiện chưa có gia sư tiêu biểu nào được hiển thị.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default CardTutor;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Row, Col } from "react-bootstrap";
import { getPublicTutors } from "../services/tutorApi"; // Đảm bảo đúng đường dẫn service

const BASE_URL = "http://localhost:3300";

function CardTutor({ tutor, onViewDetail, onInvite, showInviteBtn = false }) {
  // --- LOGIC TỰ ĐỘNG LẤY DỮ LIỆU (Dùng cho Trang Chủ) ---
  const [listTutors, setListTutors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Chỉ tự gọi API khi KHÔNG có prop "tutor" truyền vào (tức là đang ở Trang chủ)
    if (!tutor) {
      const fetchTutors = async () => {
        try {
          setLoading(true);
          const res = await getPublicTutors();
          const data = res.data ? res.data : res;
          setListTutors(Array.isArray(data) ? data.slice(0, 4) : []);
        } catch (error) {
          console.error("Lỗi lấy gia sư:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTutors();
    }
  }, [tutor]);

  // --- HÀM RENDER MỘT CHIẾC THẺ GIA SƯ (Dùng chung) ---
  const renderSingleCard = (item) => {
    const subjectDetails = item?.subject_details || [];
    const uniqueSubjects = subjectDetails.length > 0
      ? [...new Set(subjectDetails.map(s => s.subject_name))].join(", ")
      : "Đang cập nhật";
    const minTuition = subjectDetails[0]?.tuition;

    return (
      <Card className="tutor-card h-100 border-0 shadow-sm overflow-hidden">
        <div style={{ height: "240px", overflow: "hidden" }}>
          <Card.Img
            variant="top"
            src={item?.avatar ? `${BASE_URL}/uploads/avatars/${item.avatar}` : "/image/avatar.jpg"}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            onError={(e) => { e.target.src = "/image/avatar.jpg"; }}
          />
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title className="fw-bold mb-1 d-flex align-items-center gap-1 text-primary">
            {item?.full_name}
            {item?.is_verified === 1 && <i className="bi bi-patch-check-fill text-info"></i>}
          </Card.Title>
          <div className="text-muted small mb-2 text-truncate">
            <i className="bi bi-geo-alt-fill text-danger me-1"></i> {item?.home_address}
          </div>
          <div className="mb-1 fw-bold text-success" style={{ fontSize: "0.9rem" }}>{uniqueSubjects}</div>
          <div className="text-danger fw-bold mb-2">
            {minTuition ? `${Number(minTuition).toLocaleString()} vnđ/buổi` : "Liên hệ"}
          </div>
          <p className="small text-secondary mb-3" style={{ flex: 1 }}>
            <b>{item?.education}</b> - {item?.experience?.substring(0, 50)}...
          </p>
          <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
            {onViewDetail ? (
              <div className="view-detail-btn cursor-pointer" onClick={() => onViewDetail(item)} style={{cursor: 'pointer', color: '#0d6efd'}}>
                <i className="bi bi-eye me-1"></i> <span className="small fw-bold">Chi tiết</span>
              </div>
            ) : (
              <Link to={`/tutor/${item?.tutor_id}`} className="text-decoration-none small fw-bold">Xem chi tiết</Link>
            )}
            {showInviteBtn && (
              <Button variant="warning" size="sm" className="text-white fw-bold px-3 rounded-pill" onClick={() => onInvite(item)}>Mời dạy</Button>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };

  // ================== TRƯỜNG HỢP 1: TRUYỀN TUTOR (DÙNG TRONG LIST PAGE) ==================
  if (tutor) {
    return renderSingleCard(tutor);
  }

  // ================== TRƯỜNG HỢP 2: GỌI KHÔNG TRUYỀN GÌ (DÙNG TRONG TRANG CHỦ) ==================
  if (loading) return <div className="text-center py-4">Đang tải gia sư...</div>;

  return (
    <div className="row">
      {listTutors.length > 0 ? (
        listTutors.map((item) => (
          <div key={item.tutor_id} className="col-md-3 col-sm-6 mb-4">
            {renderSingleCard(item)}
          </div>
        ))
      ) : (
        <div className="text-center w-100 py-4 text-muted">Không có dữ liệu hiển thị.</div>
      )}
    </div>
  );
}

export default CardTutor;