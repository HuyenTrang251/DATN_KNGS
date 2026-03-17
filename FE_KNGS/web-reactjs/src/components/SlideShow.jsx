import React from "react";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../pages/TrangChu/trangChu.scss"
function SlideShow() {
  const banners = [
    "/image/bg1.jpg",
    "/image/bg2.jpg",
    "/image/bg3.jpg",
  ];

  return (
    <div className="container-fluid banner-ne">
      <div className="row">
        <div className="m-0 p0 banner-left">
          <Carousel>
            {banners.map((image, index) => (
              <Carousel.Item key={index}>
                <img
                  className="d-block w-100"
                  src={image}
                  alt={`Banner ${index + 1}`}
                  style={{height: "400px", objectFit:"cover"}}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
}

export default SlideShow;