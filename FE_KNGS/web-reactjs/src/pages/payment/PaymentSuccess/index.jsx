import { useEffect, useState } from "react";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmMomoReturn, confirmPayOSReturn, confirmZaloPayReturn } from "../../../services/postApi";
import "./paymentSuccess.scss";

const getProviderLabel = (provider) => {
  if (provider === "momo") return "MoMo";
  if (provider === "zalopay") return "ZaloPay";
  return "PayOS";
};

const getSuccessMessage = (providerLabel, paymentType) => {
  switch (paymentType) {
    case "receive_job":
    case "receive_booking":
      return `Thanh toán ${providerLabel} thành công. Bạn đã mở khóa thông tin liên hệ và có thể tiếp tục xử lý lớp học.`;
    case "verify_profile":
      return `Thanh toán ${providerLabel} thành công. Yêu cầu xác minh hồ sơ đã được ghi nhận.`;
    default:
      return `Thanh toán ${providerLabel} thành công.`;
  }
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [message, setMessage] = useState("Đang xác nhận thanh toán với hệ thống...");

  const redirectPath = searchParams.get("redirect") || "/";
  const provider = (searchParams.get("provider") || "payos").toLowerCase();
  const orderCode = searchParams.get("orderCode");
  const orderId = searchParams.get("orderId");
  const appTransId = searchParams.get("appTransId");
  const momoResultCode = searchParams.get("resultCode");
  const providerLabel = getProviderLabel(provider);

  useEffect(() => {
    let active = true;

    const confirmPayment = async () => {
      const transactionCode = provider === "momo"
        ? orderId
        : provider === "zalopay"
          ? appTransId
          : orderCode;

      if (!transactionCode) {
        setMessage(`Không tìm thấy mã giao dịch ${providerLabel}.`);
        setLoading(false);
        return;
      }

      if (provider === "momo" && momoResultCode && Number(momoResultCode) !== 0) {
        setMessage(searchParams.get("message") || "Giao dịch MoMo chưa thành công.");
        setLoading(false);
        return;
      }

      try {
        const response = provider === "momo"
          ? await confirmMomoReturn(transactionCode)
          : provider === "zalopay"
            ? await confirmZaloPayReturn(transactionCode)
            : await confirmPayOSReturn(transactionCode);

        if (!active) return;
        setIsSuccess(true);
        setMessage(getSuccessMessage(providerLabel, response?.payment_type));
      } catch (error) {
        if (!active) return;
        setIsSuccess(false);
        setMessage(error.response?.data?.message || `Không thể xác nhận giao dịch ${providerLabel}.`);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    confirmPayment();

    return () => {
      active = false;
    };
  }, [appTransId, momoResultCode, orderCode, orderId, provider, providerLabel, searchParams]);

  useEffect(() => {
    if (loading || !isSuccess) {
      return undefined;
    }

    setCountdown(5);

    const countdownTimer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(countdownTimer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    const redirectTimer = window.setTimeout(() => {
      navigate(redirectPath);
    }, 5000);

    return () => {
      window.clearInterval(countdownTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [isSuccess, loading, navigate, redirectPath]);

  return (
    <div className="payment-success-page">
      <Container className="payment-success-container">
        <div className={`payment-success-card ${isSuccess ? "is-success" : "is-error"}`}>
          <div className="payment-success-glow" aria-hidden="true" />
          <div className="payment-success-content">
            <div className={`payment-success-icon ${loading ? "is-loading" : isSuccess ? "is-success" : "is-error"}`}>
              {loading ? <Spinner animation="border" size="sm" /> : isSuccess ? "✓" : "!"}
            </div>

            <span className="payment-success-provider">{providerLabel}</span>
            <h1 className="payment-success-title">
              {loading ? "Đang xác nhận giao dịch" : isSuccess ? "Thanh toán thành công" : "Xác nhận thanh toán thất bại"}
            </h1>
            <p className="payment-success-subtitle">
              {loading
                ? "Hệ thống đang đối soát kết quả từ cổng thanh toán. Vui lòng không đóng trình duyệt."
                : isSuccess
                  ? "Giao dịch đã hoàn tất và hệ thống đã cập nhật trạng thái thành công."
                  : "Không thể xác nhận giao dịch từ cổng thanh toán. Bạn có thể quay lại trang trước để kiểm tra lại."}
            </p>

            {!loading && (
              <Alert variant={isSuccess ? "success" : "danger"} className="payment-success-alert">
                {message}
              </Alert>
            )}

            {isSuccess && !loading && (
              <div className="payment-success-countdown">
                Tự động quay lại trong <strong>{countdown}s</strong>
              </div>
            )}

            <div className="payment-success-actions">
              <Button variant={isSuccess ? "success" : "primary"} size="lg" onClick={() => navigate(redirectPath)}>
                {isSuccess ? "Quay lại ngay" : "Quay lại trang trước"}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PaymentSuccess;



