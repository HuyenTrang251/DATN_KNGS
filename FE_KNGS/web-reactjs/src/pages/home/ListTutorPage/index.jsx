// import { useEffect, useState } from "react";
// import "./listTutor.scss";
// // import { getTutorsApproved } from "../../services/TutorService";
// // import { getStudentId } from "../../services/StudentService"; 
// // import { getUserLogined } from "../../services/UserService";
// // import { createBooking } from "../../services/BookingService";
// import Modal from "react-bootstrap/Modal";
// import Button from "react-bootstrap/Button";
// import Form from "react-bootstrap/Form";
// // import Cookies from 'js-cookie';

// function ListTutorPage() {
//   // const [tutors, setTutors] = useState([]);
//   // const [showBookingModal, setShowBookingModal] = useState(false);
//   // const [showLoginModal, setShowLoginModal] = useState(false);
//   // const [selectedTutor, setSelectedTutor] = useState(null);
//   // const [currentStudentId, setCurrentStudentId] = useState(null);
//   // const [bookingData, setBookingData] = useState({
//   //   subject: "",
//   //   class: "",
//   //   address: "",
//   //   start_date: new Date().toISOString().split("T")[0], // Default to 2025-06-20, 05:04 PM +07
//   //   sessions_per_week: 1,
//   //   hours_per_session: 1,
//   //   method: "online",
//   //   tuition: 0,
//   // });
//   // const [tinh, setTinh] = useState([]);
//   // const [huyen, setHuyen] = useState([]);
//   // const [selectedTinh, setSelectedTinh] = useState("");
//   // const [selectedHuyen, setSelectedHuyen] = useState("");

//   // const isLoggedIn = !!Cookies.get('token');

//   // // Fetch danh sách gia sư
//   // useEffect(() => {
//   //   const fetchTutors = async () => {
//   //     try {
//   //       const data = await getTutorsApproved();
//   //       setTutors(Array.isArray(data[0]) ? data[0] : []);
//   //     } catch (error) {
//   //       console.error("Lỗi khi lấy danh sách gia sư:", error);
//   //       setTutors([]);
//   //     }
//   //   };
//   //   fetchTutors();
//   // }, []);

//   // // Fetch danh sách tỉnh/thành
//   // useEffect(() => {
//   //   fetch("https://provinces.open-api.vn/api/?depth=1")
//   //     .then((res) => res.json())
//   //     .then((data) => setTinh(data))
//   //     .catch((error) => console.error("Lỗi gọi tỉnh:", error));
//   // }, []);

//   // // Fetch danh sách quận/huyện
//   // useEffect(() => {
//   //   if (selectedTinh) {
//   //     fetch(`https://provinces.open-api.vn/api/p/${selectedTinh}?depth=2`)
//   //       .then((res) => res.json())
//   //       .then((data) => setHuyen(data.districts))
//   //       .catch((error) => console.error("Lỗi gọi huyện:", error));
//   //   } else {
//   //     setHuyen([]);
//   //   }
//   // }, [selectedTinh]);

//   // // Fetch user data and id_student
//   // useEffect(() => {
//   //   const fetchUserData = async () => {
//   //     if (!isLoggedIn) {
//   //       setCurrentStudentId(null);
//   //       return;
//   //     }
//   //     try {
//   //       const data = await getUserLogined(); // Decode token to get user data
//   //       if (data && data.id) {
//   //         // Fetch id_student using id_user
//   //         const studentData = await getStudentId(data.id);
//   //         setCurrentStudentId(studentData.id_student || null);
//   //       } else {
//   //         setCurrentStudentId(null);
//   //       }
//   //     } catch (error) {
//   //       console.error("Lỗi khi lấy thông tin người dùng hoặc học viên:", error);
//   //       setCurrentStudentId(null);
//   //     }
//   //   };
//   //   fetchUserData();
//   // }, [isLoggedIn]);

//   // const handleInviteClick = (tutor) => {
//   //   if (!tutor.id_tutor) {
//   //     alert("Không thể mời gia sư này do thiếu id_tutor.");
//   //     return;
//   //   }
//   //   if (!isLoggedIn) {
//   //     setShowLoginModal(true);
//   //     return;
//   //   }
//   //   setSelectedTutor(tutor);
//   //   setBookingData({
//   //     ...bookingData,
//   //     subject: tutor.subjects_list || "",
//   //     tuition: tutor.tuition || 0,
//   //   });
//   //   setShowBookingModal(true);
//   // };

//   // const handleBookingModalClose = () => {
//   //   setShowBookingModal(false);
//   //   setSelectedTutor(null);
//   //   setBookingData({
//   //     subject: "",
//   //     class: "",
//   //     address: "",
//   //     start_date: new Date().toISOString().split("T")[0], // Reset to 2025-06-20
//   //     sessions_per_week: 1,
//   //     hours_per_session: 1,
//   //     method: "online",
//   //     tuition: 0,
//   //   });
//   //   setSelectedTinh("");
//   //   setSelectedHuyen("");
//   // };

//   // const handleLoginModalClose = () => {
//   //   setShowLoginModal(false);
//   // };

//   // const handleLoginRedirect = () => {
//   //   setShowLoginModal(false);
//   //   window.location.href = "/dang-nhap";
//   // };

//   // const handleInputChange = (e) => {
//   //   const { name, value } = e.target;
//   //   setBookingData((prev) => ({
//   //     ...prev,
//   //     [name]: value,
//   //   }));
//   // };

//   // const handleSubmitBooking = async (e) => {
//   //   e.preventDefault();
//   //   if (!isLoggedIn || !selectedTutor?.id_tutor) {
//   //     setShowLoginModal(true);
//   //     return;
//   //   }

//   //   // Validate booking data
//   //   const requiredFields = ["subject", "class", "address", "start_date", "sessions_per_week", "hours_per_session", "tuition"];
//   //   const missingFields = requiredFields.filter((field) => !bookingData[field]);
//   //   if (missingFields.length > 0) {
//   //     alert(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(", ")}`);
//   //     return;
//   //   }

//   //   const bookingPayload = {
//   //     id_student: currentStudentId || null, // Use fetched id_student or null
//   //     id_tutor: parseInt(selectedTutor.id_tutor, 10),
//   //     subject: bookingData.subject || null,
//   //     class: bookingData.class || null,
//   //     address: bookingData.address || null,
//   //     start_date: bookingData.start_date || null,
//   //     sessions_per_week: parseInt(bookingData.sessions_per_week, 10) || 1,
//   //     hours_per_session: parseFloat(bookingData.hours_per_session) || 1,
//   //     method: bookingData.method || "online",
//   //     tuition: parseFloat(bookingData.tuition) || 0,
//   //     status: "chờ duyệt",
//   //   };

//   //   if (isNaN(bookingPayload.id_tutor)) {
//   //     alert("ID gia sư không hợp lệ.");
//   //     return;
//   //   }

//   //   try {
//   //     await createBooking(bookingPayload);
//   //     alert("Đặt lịch thành công! Đang chờ gia sư xác nhận.");
//   //     handleBookingModalClose();
//   //   } catch (error) {
//   //     console.error("Lỗi khi đặt lịch:", error);
//   //     alert(`Lỗi khi đặt lịch: ${error.response?.data?.message || error.message || "Lỗi không xác định"}`);
//   //   }
//   // };

//   return (
//     <div className="container list-tutor">
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h5 className="fw-bold">DANH SÁCH GIA SƯ</h5>
//         <span className="text-muted">Có {tutors.length} kết quả</span>
//       </div>
//       <div className="mb-3">
//         <div className="class-content d-flex gap-3">
//           <select
//             className="form-class form-select form-select-sm"
//             value={selectedTinh}
//             onChange={(e) => setSelectedTinh(e.target.value)}
//           >
//             <option value="">-- Chọn tỉnh/thành --</option>
//             {tinh.map((t) => (
//               <option key={t.code} value={t.code}>{t.name}</option>
//             ))}
//           </select>
//           <select
//             className="form-class form-select form-select-sm"
//             value={selectedHuyen}
//             onChange={(e) => setSelectedHuyen(e.target.value)}
//           >
//             <option value="">-- Quận/Huyện --</option>
//             {huyen.map((h) => (
//               <option key={h.code} value={h.code}>{h.name}</option>
//             ))}
//           </select>
//           <select className="form-class form-select form-select-sm">
//             <option>-- Chọn môn học --</option>
//           </select>
//           <select className="form-class form-select form-select-sm">
//             <option>-- Chọn chủ đề --</option>
//           </select>
//           <select className="form-class form-select form-select-sm">
//             <option>-- Hình thức dạy --</option>
//           </select>
//           <button className="btn btn-primary">Áp dụng</button>
//         </div>
//       </div>
//       <div className="row">
//         {tutors.map((tutor) => (
//           <div key={tutor.id_tutor} className="col-md-3 col-sm-6 col-12 mb-4">
//             <div className="card">
//               <img
//                 className="card-img-top"
//                 style={{ maxHeight: "300px", objectFit: "cover" }}
//                 src={tutor.img ? `http://localhost:3300/uploads/${tutor.img}` : "/image/avatar.jpg"}
//                 alt={tutor.full_name}
//               />
//               <div className="card-body">
//                 <h4 className="card-title">{tutor.full_name}</h4>
//                 <p className="card-text">
//                   {tutor.address || "Chưa cập nhật"} | {tutor.subjects_list || "Chưa cập nhật"}
//                 </p>
//                 <p className="card-text">
//                   {tutor.tuition
//                     ? `${Number(tutor.tuition).toLocaleString("vi-VN")}đ/buổi`
//                     : "Chưa cập nhật học phí"}
//                 </p>
//                 <p className="card-text">
//                   {tutor.experience ? tutor.experience : "Chưa có kinh nghiệm"}
//                 </p>
//                 <div className="d-flex justify-content-center">
//                   <button
//                     className="btn btn-primary"
//                     style={{ margin: "0 auto" }}
//                     onClick={() => handleInviteClick(tutor)}
//                   >
//                     Mời dạy
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <Modal show={showBookingModal} onHide={handleBookingModalClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>Đặt lịch học với {selectedTutor?.full_name}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSubmitBooking}>
//             <Form.Group className="mb-3" controlId="form-subject">
//               <Form.Label>Môn học</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="subject"
//                 value={bookingData.subject}
//                 onChange={handleInputChange}
//                 maxLength={100}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3" controlId="form-class">
//               <Form.Label>Lớp học</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="class"
//                 value={bookingData.class}
//                 onChange={handleInputChange}
//                 maxLength={50}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3" controlId="form-address">
//               <Form.Label>Địa chỉ</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="address"
//                 value={bookingData.address}
//                 onChange={handleInputChange}
//                 maxLength={225}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3" controlId="form-start-date">
//               <Form.Label>Ngày bắt đầu</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="start_date"
//                 value={bookingData.start_date}
//                 onChange={handleInputChange}
//                 min={new Date().toISOString().split("T")[0]} // 2025-06-20
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3" controlId="form-sessions">
//               <Form.Label>Số buổi/tuần</Form.Label>
//               <Form.Control
//                 type="number"
//                 name="sessions_per_week"
//                 value={bookingData.sessions_per_week}
//                 onChange={handleInputChange}
//                 min="1"
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3" controlId="form-hours">
//               <Form.Label>Số giờ/buổi</Form.Label>
//               <Form.Control
//                 type="number"
//                 name="hours_per_session"
//                 value={bookingData.hours_per_session}
//                 onChange={handleInputChange}
//                 step="0.5"
//                 min="1"
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3" controlId="form-method">
//               <Form.Label>Hình thức học</Form.Label>
//               <Form.Select
//                 name="method"
//                 value={bookingData.method}
//                 onChange={handleInputChange}
//                 required
//               >
//                 <option value="online">Online</option>
//                 <option value="offline">Offline</option>
//               </Form.Select>
//             </Form.Group>
//             <Form.Group className="mb-3" controlId="form-tuition">
//               <Form.Label>Học phí (đ/buổi)</Form.Label>
//               <Form.Control
//                 type="number"
//                 name="tuition"
//                 value={bookingData.tuition}
//                 onChange={handleInputChange}
//                 min="0"
//                 step="0.01"
//                 required
//               />
//             </Form.Group>
//             <Button variant="primary" type="submit">
//               Gửi yêu cầu
//             </Button>
//           </Form>
//         </Modal.Body>
//       </Modal>

//       <Modal show={showLoginModal} onHide={handleLoginModalClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>Yêu cầu đăng nhập</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           Vui lòng đăng nhập bằng tài khoản học viên để mời dạy.
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleLoginModalClose}>
//             Đóng
//           </Button>
//           <Button variant="primary" onClick={handleLoginRedirect}>
//             Đăng nhập ngay
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// }

// export default ListTutorPage;

import "./listTutor.scss";

function ListTutorPage() {

  const tutors = [
    {
      id_tutor: 1,
      full_name: "Nguyễn Văn A",
      address: "Hà Nội",
      subjects_list: "Toán, Lý",
      tuition: 120000,
      experience: "5 năm kinh nghiệm dạy học sinh cấp 3.",
      img: "/image/avatar.jpg"
    },
    {
      id_tutor: 2,
      full_name: "Trần Thị B",
      address: "Hồ Chí Minh",
      subjects_list: "Tiếng Anh",
      tuition: 150000,
      experience: "IELTS 8.0, 4 năm kinh nghiệm gia sư.",
      img: "/image/avatar.jpg"
    },
    {
      id_tutor: 3,
      full_name: "Phạm Văn C",
      address: "Đà Nẵng",
      subjects_list: "Hóa học",
      tuition: 100000,
      experience: "3 năm kinh nghiệm luyện thi đại học.",
      img: "/image/avatar.jpg"
    },
    {
      id_tutor: 4,
      full_name: "Lê Thị D",
      address: "Cần Thơ",
      subjects_list: "Toán cấp 2",
      tuition: 90000,
      experience: "Sinh viên sư phạm Toán.",
      img: "/image/avatar.jpg"
    }
  ];

  return (
    <div className="container list-tutor">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">DANH SÁCH GIA SƯ</h5>
        <span className="text-muted">Có {tutors.length} kết quả</span>
      </div>

      <div className="row">
        {tutors.map((tutor) => (
          <div key={tutor.id_tutor} className="col-md-3 col-sm-6 col-12 mb-4">

            <div className="card">

              <img
                className="card-img-top"
                style={{ maxHeight: "300px", objectFit: "cover" }}
                src={tutor.img}
                alt={tutor.full_name}
              />

              <div className="card-body">

                <h4 className="card-title">
                  {tutor.full_name}
                </h4>

                <p className="card-text">
                  {tutor.address} | {tutor.subjects_list}
                </p>

                <p className="card-text">
                  {Number(tutor.tuition).toLocaleString("vi-VN")} đ/buổi
                </p>

                <p className="card-text">
                  {tutor.experience}
                </p>

                <div className="d-flex justify-content-center">
                  <button className="btn btn-primary">
                    Mời dạy
                  </button>
                </div>

              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default ListTutorPage;