import React, { useEffect, useState } from "react";
import { Button, Badge, Row, Col, Card, Modal, Spinner, ListGroup } from "react-bootstrap";
import * as postApi from "../../../services/postApi";
import "./manageApplications.scss";

const ManageApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await postApi.getTutorApplications();
      const data = res.data ? res.data : res;
      const activeApps = Array.isArray(data)
        ? data.filter((item) => item.status !== "success" && item.status !== "cancelled")
        : [];
      setApps(activeApps);
    } catch (error) {
      console.error("Fetch applications error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = (job) => {
    setSelectedJob(job);
    setShowQR(true);
  };

  const handleViewDetail = (job) => {
    setSelectedJob(job);
    setShowDetail(true);
  };

  const handleCheckout = async (provider) => {
    try {
      setLoading(true);
      const desc = `Nop phi lop ${selectedJob.post_id}`.substring(0, 25);
      const res = await postApi.createPaymentLink({
        tutor_id: selectedJob.tutor_id,
        post_id: selectedJob.post_id,
        booking_id: null,
        payment_type: "receive_job",
        amount: Math.round(selectedJob.fee_receive),
        description: desc,
        provider,
      });

      const isMobile = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
      const paymentProvider = res?.provider || provider;
      const checkoutUrl = paymentProvider === "momo" && isMobile ? res?.deeplink || res?.checkoutUrl : res?.checkoutUrl;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        alert(`Loi: Khong the lay link thanh toan cho ma giao dich ${res?.transactionCode || "cu"}.`);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Khong the gui yeu cau thanh toan";
      alert("Loi: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizePost = async (item, action) => {
    const confirmMsg =
      action === "success"
        ? "Xác nhận kết nối thành công và chốt lớp dạy?"
        : "Xác nhận không liên hệ được học viên?";

    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      const result = await postApi.finalizePost(item.post_id, { action });
      alert(
        result?.message ||
        (action === "success"
          ? "Chúc mừng! Lớp học đã chính thức bắt đầu."
          : "Đã ghi nhận liên hệ thất bại.")
      );
      fetchApps();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Không thể thực hiện thao tác"));
    } finally {
      setLoading(false);
    }
  };

  const translateGender = (gender) => {
    if (gender === "male") return "Nam";
    if (gender === "female") return "Nữ";
    return "Không yêu cầu";
  };

  const getStatusInfo = (item) => {
    if (item.apply_status === "pending") return { text: "Chờ phản hồi", bg: "warning" };
    if (item.apply_status === "rejected") return { text: "Bị từ chối", bg: "danger" };

    if (item.apply_status === "agreed") {
      if (!item.payment_status) return { text: "Đã đồng ý - Cần đóng phí", bg: "info" };
      if (item.payment_status === "pending") return { text: "Tiếp tục thanh toán mã cũ", bg: "warning" };
      if (item.payment_status === "success") return { text: "Thanh toán thành công", bg: "success" };
      if (item.payment_status === "refunded") return { text: "Đã hoàn phí", bg: "dark" };
    }

    return { text: item.apply_status?.toUpperCase(), bg: "secondary" };
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container mt-4 pb-5 manage-apps-page">
      <h4 className="fw-bold text-primary mb-4 text-uppercase">Lớp học đã nhận</h4>
      <Row>
        {apps.length > 0 ? (
          apps.map((item) => {
            const statusInfo = getStatusInfo(item);
            const isSuccessPayment = item.payment_status === "success";
            const showPayButton = item.apply_status === "agreed" && item.payment_status !== "success";
            const itemKey = item.post_application_id || `${item.post_id}-${item.tutor_id}`;

            return (
              <Col md={6} key={itemKey} className="mb-4">
                <Card className="p-3 border-start border-4 border-primary shadow-sm h-100">
                  <div className="row align-items-center h-100">
                    <Col md={7}>
                      <h6 className="fw-bold text-dark">
                        {item.subject_name} - {item.grade}
                      </h6>
                      <div className="small mb-2">
                        <p className="mb-1">
                          Học phí:{" "}
                          <b className="text-success">
                            {Number(item.tuition_fee_per_session).toLocaleString()}đ/buổi
                          </b>
                        </p>
                        <p className="mb-1">
                          Phí nhận lớp:{" "}
                          <b className="text-danger">{Number(item.fee_receive).toLocaleString()}đ</b>
                        </p>
                        <p className="mb-1 text-dark">Học viên: {item.full_name}</p>
                        <p className="mb-1 text-muted">
                          <i className="bi bi-geo-alt-fill text-danger me-1"></i> {item.address}
                        </p>
                      </div>

                      {isSuccessPayment ? (
                        <div className="mt-2 p-2 bg-light rounded border border-success small">
                          <p className="mb-1 text-success fw-bold">
                            <i className="bi bi-person-check-fill me-1"></i> Đã mở khóa liên hệ:
                          </p>
                          <p className="mb-0">
                            <b>SĐT Phụ huynh:</b>{" "}
                            <span className="fs-6 fw-bold text-primary">{item.phone}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted fst-italic small mt-2">
                          <i className="bi bi-lock-fill me-1"></i>
                          {item.apply_status === "pending"
                            ? "Thông tin SĐT sẽ hiện sau khi học viên đồng ý."
                            : "SĐT bị ẩn cho đến khi hệ thống xác nhận thanh toán thành công."}
                        </p>
                      )}
                    </Col>

                    <Col md={5} className="text-md-end text-start mt-1 mt-md-0 d-flex flex-column justify-content-between h-100">
                      <div>
                        <Badge bg={statusInfo.bg} className="mb-2 p-2 px-2">
                          {statusInfo.text}
                        </Badge>
                      </div>

                      <div className="application-card-actions d-flex flex-column gap-2 mt-4 align-items-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="fw-bold px-3 rounded-pill w-75 application-action-button"
                          onClick={() => handleViewDetail(item)}
                        >
                          <i className="bi bi-eye"></i> Chi tiết
                        </Button>

                        {showPayButton && (
                          <Button
                            variant={item.payment_status === "pending" ? "warning" : "success"}
                            size="sm"
                            className="fw-bold rounded-pill px-3 w-75 application-action-button"
                            onClick={() => handlePay(item)}
                          >
                            {item.payment_status === "pending" ? "Tiếp tục thanh toán" : "Thanh toán phí"}
                          </Button>
                        )}

                        {isSuccessPayment && (
                          <div className="d-flex flex-column gap-2 mt-4 align-items-end application-result-actions">
                            <Button
                              variant="primary"
                              size="sm"
                              className="fw-bold rounded-pill px-3 w-100"
                              onClick={() => handleFinalizePost(item, "success")}
                            >
                              Xác nhận kết nối
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="fw-bold rounded-pill px-3 w-100"
                              onClick={() => handleFinalizePost(item, "cancel")}
                            >
                              Liên hệ thất bại  
                            </Button>
                          </div>
                        )}
                      </div>
                    </Col>
                  </div>
                </Card>
              </Col>
            );
          })
        ) : (
          <div className="text-center py-5 text-muted bg-light rounded border w-100 mx-3">
            Bạn chưa nhận lớp nào.
          </div>
        )}
      </Row>

      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold fs-5 text-primary">Thông tin chi tiết lớp học</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedJob && (
            <Row>
              <Col md={6}>
                <h6 className="fw-bold border-bottom pb-2 mb-3 text-dark">Yêu cầu lớp học</h6>
                <ListGroup variant="flush" className="small">
                  <ListGroup.Item><b>Môn học:</b> {selectedJob.subject_name}</ListGroup.Item>
                  <ListGroup.Item><b>Trình độ:</b> {selectedJob.grade}</ListGroup.Item>
                  <ListGroup.Item><b>Số lượng học sinh:</b> {selectedJob.student_quantity} học sinh</ListGroup.Item>
                  <ListGroup.Item><b>Thời lượng:</b> {Number(selectedJob.hours_per_session)} giờ/buổi</ListGroup.Item>
                  <ListGroup.Item><b>Số buổi:</b> {selectedJob.sessions_per_week} buổi/tuần</ListGroup.Item>
                  <ListGroup.Item><b>Hình thức:</b> {selectedJob.teaching_mode === "offline" ? "Tại nhà" : "Online"}</ListGroup.Item>
                </ListGroup>
              </Col>
              <Col md={6}>
                <h6 className="fw-bold border-bottom pb-2 mb-3 text-dark">Tiêu chí và địa điểm</h6>
                <ListGroup variant="flush" className="small">
                  <ListGroup.Item><b>Yêu cầu gia sư:</b> {selectedJob.tutor_type === "teacher" ? "Giáo viên" : "Sinh viên"}</ListGroup.Item>
                  <ListGroup.Item><b>Giới tính ưu tiên:</b> {translateGender(selectedJob.preferred_gender)}</ListGroup.Item>
                  <ListGroup.Item><b>Địa chỉ:</b> {selectedJob.address}</ListGroup.Item>
                  <ListGroup.Item><b>Học phí/buổi:</b> <span className="text-success fw-bold">{Number(selectedJob.tuition_fee_per_session).toLocaleString()}d</span></ListGroup.Item>
                  <ListGroup.Item><b>Phí nhận lớp:</b> <span className="text-danger fw-bold">{Number(selectedJob.fee_receive).toLocaleString()}d</span></ListGroup.Item>
                  <ListGroup.Item><b>Hỗ trợ nợ phí:</b> {selectedJob.support}%</ListGroup.Item>
                </ListGroup>
              </Col>
              <Col md={12} className="mt-3">
                <h6 className="fw-bold border-bottom pb-2 mb-2 text-dark">Ghi chú từ học viên</h6>
                <div className="p-3 bg-light rounded border small fst-italic">
                  "{selectedJob.note || "Không có ghi chú thêm."}"
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetail(false)}>Đóng</Button>
          {selectedJob?.apply_status === "agreed" && !selectedJob?.payment_status && (
            <Button
              variant="success"
              onClick={() => {
                setShowDetail(false);
                handlePay(selectedJob);
              }}
            >
              Đi tới thanh toán
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={showQR} onHide={() => setShowQR(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thanh toán phí</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <p className="mb-2">Bạn đang thực hiện thanh toán phí nhận lớp:</p>
          <h4 className="text-danger fw-bold">{Number(selectedJob?.fee_receive).toLocaleString()}d</h4>

          <div className="alert alert-warning small">
            Chọn một hình thức thanh toán bên dưới. Sau khi thanh toán thành công,
            số điện thoại học viên sẽ tự động hiển thị.
          </div>

          <div className="d-grid gap-2">
            <Button variant="primary" className="w-100 fw-bold py-3" onClick={() => handleCheckout("payos")}>
              THANH TOÁN QUA PAYOS
            </Button>
            <Button variant="success" className="w-100 fw-bold py-3" onClick={() => handleCheckout("zalopay")}>
              THANH TOÁN QUA ZALOPAY
            </Button>
            <Button variant="outline-dark" className="w-100 fw-bold py-3" onClick={() => handleCheckout("momo")}>
              THANH TOÁN QUA VÍ MOMO
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageApplications;
