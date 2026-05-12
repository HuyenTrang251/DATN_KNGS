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
      return `Thanh toan ${providerLabel} thanh cong. Ban da mo khoa thong tin lien he va co the tiep tuc xu ly lop hoc.`;
    case "verify_profile":
      return `Thanh toan ${providerLabel} thanh cong. Yeu cau xac minh ho so da duoc ghi nhan.`;
    default:
      return `Thanh toan ${providerLabel} thanh cong.`;
  }
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [message, setMessage] = useState("Dang xac nhan thanh toan voi he thong...");

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
        setMessage(`Khong tim thay ma giao dich ${providerLabel}.`);
        setLoading(false);
        return;
      }

      if (provider === "momo" && momoResultCode && Number(momoResultCode) !== 0) {
        setMessage(searchParams.get("message") || "Giao dich MoMo chua thanh cong.");
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
        setMessage(error.response?.data?.message || `Khong the xac nhan giao dich ${providerLabel}.`);
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
              {loading ? "Dang xac nhan giao dich" : isSuccess ? "Thanh toan thanh cong" : "Xac nhan thanh toan that bai"}
            </h1>
            <p className="payment-success-subtitle">
              {loading
                ? "He thong dang doi soat ket qua tu cong thanh toan. Vui long khong dong trinh duyet."
                : isSuccess
                  ? "Giao dich da hoan tat va he thong da cap nhat trang thai thanh cong."
                  : "Khong the xac nhan giao dich tu cong thanh toan. Ban co the quay lai trang truoc de kiem tra lai."}
            </p>

            {!loading && (
              <Alert variant={isSuccess ? "success" : "danger"} className="payment-success-alert">
                {message}
              </Alert>
            )}

            {isSuccess && !loading && (
              <div className="payment-success-countdown">
                Tu dong quay lai trong <strong>{countdown}s</strong>
              </div>
            )}

            <div className="payment-success-actions">
              <Button variant={isSuccess ? "success" : "primary"} size="lg" onClick={() => navigate(redirectPath)}>
                {isSuccess ? "Quay lai ngay" : "Quay lai trang truoc"}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PaymentSuccess;
