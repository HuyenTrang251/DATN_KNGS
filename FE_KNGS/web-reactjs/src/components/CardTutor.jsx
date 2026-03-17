// import { Link } from "react-router-dom";
// // import {useEffect, useState} from "react";
// // import { getTutorsApproved } from "../services/TutorService";
// function CardTutor(){
//     // const [tutors, setTutors] = useState([]);
    
//     // useEffect(() => {
//     //     const fetchTutors = async () => {
//     //     try {
//     //         const data = await getTutorsApproved();
//     //         // Truy cập vào phần tử đầu tiên của mảng kết quả (danh sách gia sư)
//     //         if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
//     //             setTutors(data[0]);
//     //         } else {
//     //             console.error("Dữ liệu trả về từ API không đúng định dạng:", data);
//     //             setTutors([]); // Đặt state tutors về mảng rỗng để tránh lỗi render
//     //         }
//     //     } catch (error) {
//     //         console.error("Lỗi khi gọi API lấy danh sách gia sư:", error);
//     //     }
//     //     };
//     //     fetchTutors();
//     // }, []);
//     return (
//     <>
//         <div className="row">
//         {tutors.filter((tutor) => tutor.img).slice(0,4).map((tutor) => (
//             <div key={tutor.id_tutor} className="col-md-3 col-sm-6 col-12 mb-4">
//             <div className="card">
//                 <img className="card-img-top" style={{maxHeight: '300px'}} src={tutor.img ? `http://localhost:3300/uploads/${tutor.img}` : "/image/gs.jpg"} alt={tutor.full_name} />
//                 <div className="card-body">
//                 <h4 className="card-title">{tutor.full_name}</h4>
//                 <p className="card-text">{tutor.address || "Chưa cập nhật"} | {tutor.subjects_list || "Chưa cập nhật"}</p> 
//                 <p className="card-text">{tutor.tuition ? `${Number(tutor.tuition).toLocaleString('vi-VN')}đ/ buổi` : "Chưa cập nhật học phí"}</p>
//                 <p className="card-text">{tutor.experience ? tutor.experience.substring(0, 150) + "..." : "Chưa có kinh nghiệm"}</p> 
//                 <div className="d-flex justify-content-center">
//                     <Link to={`/tutor/${tutor.id_tutor}`} className="btn btn-primary" style={{ margin: '0px auto' }}>Xem chi tiết</Link> 
//                 </div>
//                 </div>
//             </div>
//             </div>
//         ))}
//         </div>
//     </>
//     )
// }
// export default CardTutor

import { Link } from "react-router-dom";

function CardTutor() {
  // Dữ liệu fix cứng 4–5 tutor
  const tutors = [
    {
      id_tutor: 1,
      full_name: "Nguyễn Văn A",
      img: "/image/giaovien.jpg",
      address: "Hà Nội",
      subjects_list: "Toán, Lý",
      tuition: 120000,
      experience: "5 năm kinh nghiệm giảng dạy tại các trung tâm lớn."
    },
    {
      id_tutor: 2,
      full_name: "Trần Thị B",
      img: "/image/sinhvien.jpg",
      address: "Hồ Chí Minh",
      subjects_list: "Tiếng Anh",
      tuition: 100000,
      experience: "Sinh viên ĐH Ngoại Thương, điểm IELTS 8.0."
    },
    {
      id_tutor: 3,
      full_name: "Phạm Văn C",
      img: "/image/gs.webp",
      address: "Đà Nẵng",
      subjects_list: "Hóa, Sinh",
      tuition: 90000,
      experience: "3 năm kinh nghiệm gia sư cho học sinh cấp 3."
    },
    {
      id_tutor: 4,
      full_name: "Lê Thị D",
      img: "/image/gioithieu.png",
      address: "Hải Phòng",
      subjects_list: "Toán",
      tuition: 150000,
      experience: "Giáo viên trường THPT chuyên, học sinh đạt nhiều giải."
    }
  ];

  return (
    <div className="row">
      {tutors.slice(0, 4).map((tutor) => (
        <div key={tutor.id_tutor} className="col-md-3 col-sm-6 col-12 mb-4">
          <div className="card">
            <img
              className="card-img-top"
              style={{ maxHeight: "300px" }}
              src={tutor.img}
              alt={tutor.full_name}
            />

            <div className="card-body">
              <h4 className="card-title">{tutor.full_name}</h4>

              <p className="card-text">
                {tutor.address} | {tutor.subjects_list}
              </p>

              <p className="card-text">
                {tutor.tuition.toLocaleString("vi-VN")}đ / buổi
              </p>

              <p className="card-text">
                {tutor.experience.substring(0, 150)}...
              </p>

              <div className="d-flex justify-content-center">
                <Link
                  to={`/tutor/${tutor.id_tutor}`}
                  className="btn btn-primary"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardTutor;