import React, { useEffect, useState, useRef, useCallback} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../pages/home/HomePage/home.scss";
// import { getAllSubjects } from "../../services/SubjectService";
// import instance from './../../utils/request';

const SlideShowHome = () => {
  // const imageList = [
  //   { id: 1, src: "/image/hoahoc.jpg", alt: "Môn Hoá" },
  //   { id: 2, src: "/image/tienganh.jpg", alt: "Tiếng anh" },
  //   { id: 3, src: "/image/hoahoc.jpg", alt: "Môn Toán" },
  //   { id: 4, src: "/image/hoahoc.jpg", alt: "Môn Văn" },
  //   { id: 5, src: "/image/hoahoc.jpg", alt: "Môn Lý" },
  //   { id: 6, src: "/image/tienganh.jpg", alt: "Môn Sinh" },
  // ];

  const [subjects, setSubjects] = useState([]);
  const [index, setIndex] = useState(0);
  const intervalId = useRef(null); // Sử dụng useRef để lưu trữ ID của interval (TỰ ĐỘNG CHẠY)
  // const [isAutoPlay, setIsAutoPlay] = useState(true); // Trạng thái tự động chạy
  // const autoPlayInterval = useRef(null);
  // const interactionTimeout = useRef(null);
  // const autoPlayDelay = 1000; // Thời gian tự động chuyển slide (5 giây)
  // const interactionDelay = 500; // Thời gian chờ sau tương tác để tự động chạy lại (3 giây)

  const handlePrev = () => {
    setIndex(index === 0 ? Math.max(0, subjects.length - 4) : index - 1);
  };

  const handleNext = useCallback(() => {
    // setIndex(index === Math.max(0, subjects.length - 4) ? 0 : index + 1); //USER TỰ TƯƠNG TÁC
    setIndex((prevIndex) => (prevIndex === Math.max(0, subjects.length - 4) ? 0 : prevIndex + 1));
  }, [subjects.length]); // Thêm các dependencies mà handleNext sử dụng

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
  
  return (
    <div className="slide-container">
      <button className="text-white slide-btn left-btn d-flex align-items-center" onClick={handlePrev}>
        &#10094;
      </button>
      <div className="container image-slide">
        <div className="row image-row">
          {subjects.slice(index, index + 4).map((item) => (
            <div key={item.id_subject} className="col-md-3 col-sm-12">
              <div className="image-item">
                <img src={`/image/${item.name}.jpg`} alt={item.name} className="img-fluid"/>
                {/* <div className="image-alt">{item.name}</div> */}
              </div>
              <div className="text-center fs-5 my-2 fw-medium">{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="text-white slide-btn right-btn" onClick={handleNext}>
        &#10095;
      </button>
    </div>
  );
};

export default SlideShowHome;