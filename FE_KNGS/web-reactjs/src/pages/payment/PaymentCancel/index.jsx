import { Alert, Button, Container } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";

const getProviderLabel = (provider) => {
  if (provider === "momo") return "MoMo";
  if (provider === "zalopay") return "ZaloPay";
  return "PayOS";
};

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const provider = (searchParams.get("provider") || "payos").toLowerCase();
  const providerLabel = getProviderLabel(provider);

  return (
    <Container className="py-5 text-center" style={{ maxWidth: "720px" }}>
      <h3 className="fw-bold text-warning mb-3">Thanh toan chua hoan tat</h3>
      <Alert variant="warning">
        Giao dich {providerLabel} da bi huy hoac chua thanh toan xong.
      </Alert>
      <Button variant="primary" onClick={() => navigate(redirectPath)}>
        Quay lai trang truoc
      </Button>
    </Container>
  );
};

export default PaymentCancel;
