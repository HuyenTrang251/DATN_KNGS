// import React, { useEffect, useState, useRef, useCallback} from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "../pages/home/HomePage/home.scss";
// import { getAllSubjects } from "../services/subjectApi";
// // import instance from './../../utils/request';

// const SlideShowHome = () => {
//   const imageList = [
//     { id: 1, src: "/image/Toán.jpg", alt: "Môn Hoá" },
//     { id: 2, src: "/image/lý.jpg", alt: "Tiếng anh" },
//     { id: 3, src: "/image/hoahoc.jpg", alt: "Môn Toán" },
//     { id: 4, src: "/image/hoahoc.jpg", alt: "Môn Văn" },
//     { id: 5, src: "/image/hoahoc.jpg", alt: "Môn Lý" },
//     { id: 6, src: "/image/tienganh.jpg", alt: "Môn Sinh" },
//   ];

//   const [subjects, setSubjects] = useState([]);
//   const [index, setIndex] = useState(0);
//   const intervalId = useRef(null); // Sử dụng useRef để lưu trữ ID của interval (TỰ ĐỘNG CHẠY)
//   const [isAutoPlay, setIsAutoPlay] = useState(true); // Trạng thái tự động chạy
//   const autoPlayInterval = useRef(null);
//   const interactionTimeout = useRef(null);
//   const autoPlayDelay = 1000; // Thời gian tự động chuyển slide (5 giây)
//   const interactionDelay = 500; // Thời gian chờ sau tương tác để tự động chạy lại (3 giây)

//   const handlePrev = () => {
//     setIndex(index === 0 ? Math.max(0, subjects.length - 4) : index - 1);
//   };

//   const handleNext = useCallback(() => {
//     setIndex(index === Math.max(0, subjects.length - 4) ? 0 : index + 1); //USER TỰ TƯƠNG TÁC
//     setIndex((prevIndex) => (prevIndex === Math.max(0, subjects.length - 4) ? 0 : prevIndex + 1));
//   }, [subjects.length]); // Thêm các dependencies mà handleNext sử dụng

//   useEffect(() => {
//     const fetchSubjects = async () => {
//       try {
//         const data = await getAllSubjects();
//         setSubjects(data);
//       }
//       catch (error)
//       {
//         console.error("Lỗi lấy danh sách môn học", error);
//       }
//     };
//     fetchSubjects();

//     // Thiết lập interval để tự động chuyển slide sau mỗi 5 giây, TỰ ĐỘNG CHẠY LIÊN TỤC
//     intervalId.current = setInterval(() => {
//       handleNext();
//     }, 5000); 

//     // Cleanup function để xóa interval khi component unmount hoặc dependencies thay đổi
//     return () => {
//       clearInterval(intervalId.current);
//     };
//   }, [subjects.length, handleNext]);
  
//   return (
//     <div className="slide-container">
//       <button className="text-white slide-btn left-btn d-flex align-items-center" onClick={handlePrev}>
//         &#10094;
//       </button>
//       <div className="container image-slide">
//         <div className="row image-row">
//           {subjects.slice(index, index + 4).map((item) => (
//             <div key={item.subject_id} className="col-md-3 col-sm-12">
//               <div className="image-item">
//                 <img src={`/image/${item.name}.jpg`} alt={item.name} className="img-fluid"/>
//                 <div className="image-alt">{item.name}</div>
//               </div>
//               <div className="text-center fs-5 my-2 fw-medium">{item.name}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <button className="text-white slide-btn right-btn" onClick={handleNext}>
//         &#10095;
//       </button>
//     </div>
//   );
// };

// export default SlideShowHome;

import React, { useEffect, useState, useRef, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../pages/home/HomePage/home.scss";
import { getAllSubjects } from "../services/subjectApi";

const SlideShowHome = () => {
  const [subjects, setSubjects] = useState([]);
  const [index, setIndex] = useState(0);
  const intervalId = useRef(null);

  /**
   * Hàm chuẩn hóa tên môn học từ API để khớp với file ảnh trong public/image
   * Dựa trên danh sách file bạn gửi: lý.jpg, hoá.jpg, văn.jpg, toán.jpg...
   */
  const getSubjectImage = (name) => {
    if (!name) return "gs.jpg";
    const n = name.toLowerCase();
    
    if (n.includes("vật lý")) return "lý.jpg";
    if (n.includes("hóa học")) return "hoá.jpg";
    if (n.includes("ngữ văn")) return "văn.jpg";
    if (n.includes("toán")) return "toán.jpg";
    if (n.includes("tiếng anh")) return "tiếng anh.jpg";
    if (n.includes("tin học")) return "tin học.jpg";
    
    // Mặc định nếu không khớp các điều kiện trên
    return `${n}.jpg`;
  };

  const handleNext = useCallback(() => {
    setIndex((prevIndex) => {
      const maxIndex = Math.max(0, subjects.length - 4);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  }, [subjects.length]);

  const handlePrev = () => {
    setIndex((prevIndex) => {
      const maxIndex = Math.max(0, subjects.length - 4);
      return prevIndex === 0 ? maxIndex : prevIndex - 1;
    });
  };

  // Gọi API lấy danh sách môn học
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getAllSubjects();
        // Đảm bảo data là mảng (tùy cấu trúc axiosClient của bạn)
        const result = Array.isArray(data) ? data : (data.data || []);
        setSubjects(result);
      } catch (error) {
        console.error("Lỗi lấy danh sách môn học", error);
      }
    };
    fetchSubjects();
  }, []);

  // Thiết lập tự động chạy slide
  useEffect(() => {
    if (subjects.length > 0) {
      intervalId.current = setInterval(() => {
        handleNext();
      }, 5000);
    }
    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [subjects.length, handleNext]);

  return (
    <div className="container-fluid py-5 bg-light">
        <h2 className="text-center mb-5 fw-bold">Tìm gia sư theo môn học</h2>
        
        <div className="slide-container position-relative px-md-5">
            {/* Nút Previous */}
            <button 
                className="slide-btn left-btn d-flex align-items-center justify-content-center" 
                onClick={handlePrev}
                style={{ zIndex: 10 }}
            >
                &#10094;
            </button>

            <div className="container overflow-hidden">
                <div className="row flex-nowrap">
                    {subjects.length > 0 ? (
                        subjects.slice(index, index + 4).map((item) => (
                            <div key={item.subject_id} className="col-md-3 col-6 mb-3">
                                <div className="image-item text-center p-3 bg-white rounded shadow-sm h-100">
                                    <div className="img-wrapper mb-3" style={{ height: "150px", overflow: "hidden" }}>
                                        <img 
                                            src={`/image/${getSubjectImage(item.name)}`} 
                                            alt={item.name} 
                                            className="img-fluid rounded w-100 h-100"
                                            style={{ objectFit: "cover" }}
                                            onError={(e) => {
                                                e.target.src = "/image/gs.jpg"; // Ảnh mặc định nếu file không tồn tại
                                            }}
                                        />
                                    </div>
                                    <div className="text-center fs-5 fw-bold text-dark text-truncate">
                                        {item.name}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center w-100 py-3 text-muted">Đang tải môn học...</div>
                    )}
                </div>
            </div>

            {/* Nút Next */}
            <button 
                className="slide-btn right-btn d-flex align-items-center justify-content-center" 
                onClick={handleNext}
                style={{ zIndex: 10 }}
            >
                &#10095;
            </button>
        </div>
    </div>
  );
};

export default SlideShowHome;