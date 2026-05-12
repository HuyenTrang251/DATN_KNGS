import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Button, Modal, ListGroup, Spinner } from "react-bootstrap";
import * as bookingApi from "../../../services/bookingApi";
import * as postApi from "../../../services/postApi";
import "./manageBookings.scss";

const TutorBookingManagement = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getReceivedInvitations();
      const activeData = Array.isArray(res)
        ? res.filter((item) => item.status !== "success" && item.status !== "cancelled")
        : [];
      setInvitations(activeData);
    } catch (error) {
      console.error("Load invitations error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id, status) => {
    const msg =
      status === "agreed"
        ? "Bạn đồng ý nhận lớp này và sẽ tiến hành nộp phí?"
        : "Bạn muốn từ chối lời mời này?";
    if (!window.confirm(msg)) return;

    try {
      await bookingApi.respondToInvitation(id, { status });
      alert("Đã gửi phản hồi thành công!");
      loadData();
    } catch (error) {
      alert("Thao tác thất bại");
    }
  };

  const openPayment = (item) => {
    setSelected(item);
    setShowQR(true);
  };

  const handleCheckout = async (provider) => {
    try {
      setLoading(true);
      const desc = `Phí đặt lịch BK${selected.booking_id}`.substring(0, 25);
      const res = await postApi.createPaymentLink({
        tutor_id: Number(selected.tutor_id),
        booking_id: Number(selected.booking_id),
        post_id: null,
        payment_type: "receive_booking",
        amount: Math.round(selected.tuition * 0.3),
        description: desc,
        provider,
      });

      const isMobile = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
      const paymentProvider = res?.provider || provider;
      const checkoutUrl = paymentProvider === "momo" && isMobile ? res?.deeplink || res?.checkoutUrl : res?.checkoutUrl;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        alert(`Lỗi: Không nhận được link thanh toán cho mã giao dịch ${res?.transactionCode || "cũ"}.`);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Lỗi hệ thống";
      alert("Lỗi thanh toán: " + errorMsg);
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeBooking = async (id, action) => {
    const confirmMsg =
      action === "success"
        ? "Xác nhận bạn đã liên hệ thành công và chốt lớp dạy?"
        : "Xác nhận bạn không thể liên hệ được học viên này?";

    if (!window.confirm(confirmMsg)) return;

    try {
      const result = await bookingApi.confirmConnectionSuccess(id, { action });
      alert(
        result?.message ||
        (action === "success"
          ? "Chúc mừng! Lớp học đã được tạo thành công."
          : "Đã ghi nhận liên hệ thất bại.")
      );
      loadData();
    } catch (error) {
      alert("Lỗi thao tác: " + (error.response?.data?.message || error.message));
    }
  };

  const renderStatusBadge = (item) => {
    if (item.status === "approved") return <Badge bg="info">CHỜ BẠN PHẢN HỒI</Badge>;
    if (item.status === "rejected") return <Badge bg="danger">BẠN ĐÃ TỪ CHỐI</Badge>;

    if (item.status === "connecting") {
      if (!item.payment_status) {
        return <Badge bg="primary">ĐÃ ĐỒNG Ý - HÃY THANH TOÁN</Badge>;
      }
      if (item.payment_status === "pending") {
        return <Badge bg="warning" text="dark">CHƯA HOÀN TẤT - TIẾP TỤC THANH TOÁN MÃ CŨ</Badge>;
      }
      if (item.payment_status === "success") {
        return <Badge bg="success">THANH TOÁN THÀNH CÔNG - HÃY GỌI ĐIỆN</Badge>;
      }
    }

    if (item.status === "success") return <Badge bg="primary">KẾT NỐI THÀNH CÔNG</Badge>;
    return <Badge bg="secondary">{item.status?.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="mt-4 pb-5 manage-bookings-page">
      <h4 className="fw-bold text-primary mb-4 text-uppercase">Danh sách lời mời dạy</h4>
      <Row>
        {invitations.length > 0 ? (
          invitations.map((item) => {
            const isSuccessPayment = item.payment_status === "success";
            const showPayButton = item.status === "connecting" && item.payment_status !== "success";

            return (
              <Col md={6} key={item.booking_id} className="mb-4">
                <Card className="h-100 border-0 shadow-sm border-start border-4 border-info">
                  <Card.Body>
                    <div className="booking-card-header mb-3">
                      <h6 className="fw-bold text-dark mb-0">
                        {item.subject_name} - {item.level}
                      </h6>
                      {renderStatusBadge(item)}
                    </div>

                    <div className="small mb-3">
                      <p className="mb-1">
                        <b>Học viên:</b> {item.student_name}
                      </p>
                      <p className="mb-1">
                        <b>Khu vực:</b> {item.student_address}
                      </p>
                      <p className="mb-1">
                        <b>Học phí:</b>{" "}
                        <span className="text-danger fw-bold">
                          {Number(item.tuition).toLocaleString()}đ/buổi
                        </span>
                      </p>
                    </div>

                    <div className="alert alert-light border py-2 mb-3 shadow-sm">
                      {isSuccessPayment ? (
                        <div className="text-success fw-bold">
                          <i className="bi bi-telephone-outbound-fill me-2"></i>
                          SDT liên hệ: {item.student_phone}
                        </div>
                      ) : (
                        <div className="text-muted small italic text-center">
                          <i className="bi bi-lock-fill me-1"></i>
                          SDT học viên sẽ hiển thị ngay sau khi hệ thống xác nhận thanh toán thành công.
                        </div>
                      )}
                    </div>

                    <div className="booking-card-actions">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="px-3 rounded-pill"
                        onClick={() => {
                          setSelected(item);
                          setShowDetail(true);
                        }}
                      >
                        Chi tiết
                      </Button>

                      {item.status === "approved" && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            className="px-3 rounded-pill"
                            onClick={() => handleRespond(item.booking_id, "agreed")}
                          >
                            Đồng ý
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="px-3 rounded-pill"
                            onClick={() => handleRespond(item.booking_id, "rejected")}
                          >
                            Từ chối
                          </Button>
                        </>
                      )}

                      {showPayButton && (
                        <Button
                          variant={item.payment_status === "pending" ? "outline-warning" : "warning"}
                          size="sm"
                          className="fw-bold flex-grow-1 rounded-pill"
                          onClick={() => openPayment(item)}
                        >
                          {item.payment_status === "pending" ? "Thanh toán lại" : "Thanh toán phí"}
                        </Button>
                      )}

                      {isSuccessPayment && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            className="fw-bold flex-grow-1 rounded-pill"
                            onClick={() => handleFinalizeBooking(item.booking_id, "success")}
                          >
                            <i className="bi bi-check-lg me-1"></i> Liên hệ thành công
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="fw-bold rounded-pill"
                            onClick={() => handleFinalizeBooking(item.booking_id, "cancel")}
                          >
                            <i className="bi bi-x-lg"></i> Thất bại
                          </Button>
                        </>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        ) : (
          <div className="text-center py-5 text-muted bg-white rounded border">
            Hiện bạn chưa có lời mời dạy nào từ học viên.
          </div>
        )}
      </Row>

      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-5">Thông tin đặt lịch</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selected && (
            <Row>
              <Col md={6}>
                <h6 className="fw-bold border-bottom pb-2 mb-3">Yêu cầu học tập</h6>
                <ListGroup variant="flush" className="small">
                  <ListGroup.Item><b>Học viên:</b> {selected.student_name}</ListGroup.Item>
                  <ListGroup.Item><b>Môn học:</b> {selected.subject_name}</ListGroup.Item>
                  <ListGroup.Item><b>Thời lượng:</b> {Number(selected.hours_per_session)}h/buổi</ListGroup.Item>
                  <ListGroup.Item><b>Số buổi:</b> {selected.sessions_per_week} buổi/tuần</ListGroup.Item>
                </ListGroup>
              </Col>
              <Col md={6}>
                <h6 className="fw-bold border-bottom pb-2 mb-3">Thông tin chi phí</h6>
                <ListGroup variant="flush" className="small">
                  <ListGroup.Item><b>Học phí:</b> {Number(selected.tuition).toLocaleString()}đ/buổi</ListGroup.Item>
                  <ListGroup.Item><b>Hình thức:</b> {selected.teaching_mode?.toUpperCase()}</ListGroup.Item>
                  <ListGroup.Item>
                    <b>Phí kết nối (30%):</b>{" "}
                    <span className="text-danger fw-bold">
                      {Number(selected.tuition * 0.3).toLocaleString()}đ
                    </span>
                  </ListGroup.Item>
                </ListGroup>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showQR} onHide={() => setShowQR(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-5">Thanh toán phí kết nối</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <h6 className="fw-bold mb-3 text-uppercase">Nộp phí kết nối đặt lịch</h6>
          <h3 className="text-danger fw-bold">
            {Number(selected?.tuition * 0.3).toLocaleString()}d
          </h3>
          <div className="alert alert-info small mt-3 mb-4">
            Chọn một hình thức thanh toán. Sau khi giao dịch thành công, số điện thoại học viên sẽ tự động được mở khóa.
          </div>
          <div className="d-grid gap-2">
            <Button variant="primary" className="w-100 fw-bold py-3 shadow-sm" onClick={() => handleCheckout("payos")}>
              THANH TOÁN QUA PAYOS
            </Button>
            <Button variant="success" className="w-100 fw-bold py-3 shadow-sm" onClick={() => handleCheckout("zalopay")}>
              THANH TOÁN QUA ZALOPAY
            </Button>
            <Button variant="outline-dark" className="w-100 fw-bold py-3 shadow-sm" onClick={() => handleCheckout("momo")}>
              THANH TOÁN QUA VI MOMO
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default TutorBookingManagement;
