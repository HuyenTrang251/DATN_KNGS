import { useEffect, useState } from "react";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmMomoReturn, confirmPayOSReturn } from "../../../services/postApi";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("Dang xac nhan thanh toan voi he thong...");
  const redirectPath = searchParams.get("redirect") || "/";
  const provider = (searchParams.get("provider") || "payos").toLowerCase();
  const orderCode = searchParams.get("orderCode");
  const orderId = searchParams.get("orderId");
  const momoResultCode = searchParams.get("resultCode");
  const providerLabel = provider === "momo" ? "MoMo" : "PayOS";

  useEffect(() => {
    let active = true;

    const confirmPayment = async () => {
      const transactionCode = provider === "momo" ? orderId : orderCode;

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
        if (provider === "momo") {
          await confirmMomoReturn(transactionCode);
        } else {
          await confirmPayOSReturn(transactionCode);
        }

        if (!active) return;
        setIsSuccess(true);
        setMessage(`Thanh toan ${providerLabel} thanh cong. So dien thoai hoc vien da duoc mo khoa.`);
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
  }, [momoResultCode, orderCode, orderId, provider, providerLabel, searchParams]);

  return (
    <Container className="py-5 text-center" style={{ maxWidth: "720px" }}>
      <h3 className="fw-bold text-success mb-3">Ket qua thanh toan</h3>
      {loading ? (
        <div className="py-4">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 mb-0">{message}</p>
        </div>
      ) : (
        <>
          <Alert variant={isSuccess ? "success" : "danger"}>
            {message}
          </Alert>
          <Button variant="primary" onClick={() => navigate(redirectPath)}>
            Quay lai trang truoc
          </Button>
        </>
      )}
    </Container>
  );
};

export default PaymentSuccess;
