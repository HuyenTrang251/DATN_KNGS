const https = require("https");
const crypto = require("crypto");
const { PayOS } = require("@payos/node");

const PaymentModel = require("../models/payments.model");
const BookingModel = require("../models/bookings.model");
const TutorModel = require("../models/tutors.model");
const PostAppModel = require("../models/post_applications.model");

const PAYMENT_PROVIDERS = {
  PAYOS: "payos",
  MOMO: "momo",
};

const payos =
  process.env.PAYOS_CLIENT_ID &&
  process.env.PAYOS_API_KEY &&
  process.env.PAYOS_CHECKSUM_KEY
    ? new PayOS({
        clientId: process.env.PAYOS_CLIENT_ID,
        apiKey: process.env.PAYOS_API_KEY,
        checksumKey: process.env.PAYOS_CHECKSUM_KEY,
      })
    : null;

const buildRedirectPath = (paymentType) => {
  switch (paymentType) {
    case "receive_booking":
      return "/tutor/thong-tin-dat-lich";
    case "receive_job":
      return "/tutor/quan-ly-nhan-lop";
    case "verify_profile":
      return "/tutor/thong-tin-ca-nhan";
    default:
      return "/";
  }
};

const normalizeProvider = (provider) => {
  return String(provider || PAYMENT_PROVIDERS.PAYOS).toLowerCase() === PAYMENT_PROVIDERS.MOMO
    ? PAYMENT_PROVIDERS.MOMO
    : PAYMENT_PROVIDERS.PAYOS;
};

const requireFrontendUrl = () => {
  if (!process.env.FRONTEND_URL) {
    throw new Error("Thieu cau hinh FRONTEND_URL");
  }

  return process.env.FRONTEND_URL;
};

const getBackendBaseUrl = (req) => {
  return process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
};

const buildUrl = (baseUrl, pathname, query = {}) => {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  const url = new URL(normalizedPath, normalizedBaseUrl);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

const sendJsonRequest = ({ endpoint, path, payload }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const requestBody = JSON.stringify(payload);

    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
        },
      },
      (res) => {
        let rawData = "";

        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          rawData += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : {};

            if (res.statusCode >= 400) {
              return reject(new Error(parsed.message || `Gateway request failed with status ${res.statusCode}`));
            }

            return resolve(parsed);
          } catch (error) {
            return reject(error);
          }
        });
      }
    );

    req.on("error", reject);
    req.write(requestBody);
    req.end();
  });
};

const createPayOSPaymentLink = async ({ normalizedAmount, normalizedDescription, paymentType, frontendUrl }) => {
  if (!payos) {
    throw new Error("PayOS chua duoc cau hinh day du");
  }

  const orderCode = Number(String(Date.now()).slice(-9));
  const redirectPath = buildRedirectPath(paymentType);
  const returnUrl = buildUrl(frontendUrl, "/payment-success", {
    provider: PAYMENT_PROVIDERS.PAYOS,
    orderCode,
    redirect: redirectPath,
  });
  const cancelUrl = buildUrl(frontendUrl, "/payment-cancel", {
    provider: PAYMENT_PROVIDERS.PAYOS,
    redirect: redirectPath,
  });

  const paymentLink = await payos.paymentRequests.create({
    orderCode,
    amount: normalizedAmount,
    description: normalizedDescription,
    cancelUrl,
    returnUrl,
  });

  return {
    provider: PAYMENT_PROVIDERS.PAYOS,
    transactionCode: String(orderCode),
    checkoutUrl: paymentLink.checkoutUrl,
  };
};

const getMomoConfig = () => {
  const config = {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    accessKey: process.env.MOMO_ACCESS_KEY,
    secretKey: process.env.MOMO_SECRET_KEY,
    endpoint: process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn",
  };

  if (!config.partnerCode || !config.accessKey || !config.secretKey) {
    throw new Error("MoMo chua duoc cau hinh day du");
  }

  return config;
};

const createMomoPaymentLink = async ({ normalizedAmount, normalizedDescription, paymentType, frontendUrl, backendUrl }) => {
  const { partnerCode, accessKey, secretKey, endpoint } = getMomoConfig();
  const orderId = `MOMO_${Date.now()}`;
  const requestId = `${orderId}_${Math.floor(Math.random() * 1000)}`;
  const redirectPath = buildRedirectPath(paymentType);
  const redirectUrl = buildUrl(frontendUrl, "/payment-success", {
    provider: PAYMENT_PROVIDERS.MOMO,
    redirect: redirectPath,
  });
  const ipnUrl = buildUrl(backendUrl, "/api/payments/momo-ipn");
  const extraData = "";
  const requestType = "captureWallet";
  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${normalizedAmount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${normalizedDescription}` +
    `&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const paymentLink = await sendJsonRequest({
    endpoint,
    path: "/v2/gateway/api/create",
    payload: {
      partnerCode,
      accessKey,
      requestId,
      amount: String(normalizedAmount),
      orderId,
      orderInfo: normalizedDescription,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    },
  });

  if (Number(paymentLink.resultCode) !== 0) {
    throw new Error(paymentLink.message || "MoMo khong tao duoc lien ket thanh toan");
  }

  return {
    provider: PAYMENT_PROVIDERS.MOMO,
    transactionCode: orderId,
    checkoutUrl: paymentLink.payUrl,
    deeplink: paymentLink.deeplink || paymentLink.deeplinkMiniApp || null,
    qrCodeUrl: paymentLink.qrCodeUrl || null,
  };
};

const queryMomoPayment = async (orderId) => {
  const { partnerCode, accessKey, secretKey, endpoint } = getMomoConfig();
  const requestId = `QUERY_${Date.now()}`;
  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  return sendJsonRequest({
    endpoint,
    path: "/v2/gateway/api/query",
    payload: {
      partnerCode,
      requestId,
      orderId,
      signature,
      lang: "vi",
    },
  });
};

const applySuccessfulPayment = async (payment) => {
  if (!payment) {
    return { updated: false, reason: "PAYMENT_NOT_FOUND" };
  }

  if (payment.status !== "success") {
    await PaymentModel.updateToSuccess(payment.id);
  }

  switch (payment.payment_type) {
    case "receive_booking":
      await BookingModel.update(payment.booking_id, { status: "connecting" });
      break;
    case "receive_job":
      if (payment.post_id && payment.tutor_id) {
        await PostAppModel.updateStatusByTutor(payment.post_id, payment.tutor_id, "agreed");
      }
      break;
    case "verify_profile":
      await TutorModel.updateVerifyStatus(payment.tutor_id, 1);
      break;
  }

  return { updated: true, payment };
};

const finalizeSuccessfulPayment = async (transactionCode) => {
  const payment = await PaymentModel.findByTransactionCode(transactionCode);
  return applySuccessfulPayment(payment);
};

module.exports = {
  createLink: async (req, res) => {
    try {
      const { tutor_id, post_id, booking_id, amount, payment_type, description, provider } = req.body;
      const normalizedAmount = Number(amount);
      const normalizedDescription = String(description || "Thanh toan hoc phi").substring(0, 25);
      const selectedProvider = normalizeProvider(provider);

      if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
        return res.status(400).json({ message: "So tien thanh toan khong hop le" });
      }

      const frontendUrl = requireFrontendUrl();
      const backendUrl = getBackendBaseUrl(req);
      const paymentLink =
        selectedProvider === PAYMENT_PROVIDERS.MOMO
          ? await createMomoPaymentLink({
              normalizedAmount,
              normalizedDescription,
              paymentType: payment_type,
              frontendUrl,
              backendUrl,
            })
          : await createPayOSPaymentLink({
              normalizedAmount,
              normalizedDescription,
              paymentType: payment_type,
              frontendUrl,
            });

      await PaymentModel.create({
        tutor_id,
        post_id: post_id || null,
        booking_id: booking_id || null,
        payment_type,
        amount: normalizedAmount,
        transaction_code: paymentLink.transactionCode,
        status: "pending",
      });

      return res.json({
        provider: paymentLink.provider,
        checkoutUrl: paymentLink.checkoutUrl,
        deeplink: paymentLink.deeplink || null,
        qrCodeUrl: paymentLink.qrCodeUrl || null,
        transactionCode: paymentLink.transactionCode,
      });
    } catch (error) {
      console.error("Payment Create Link Error:", error);
      return res.status(500).json({
        message: error.message || "Khong the tao link thanh toan",
      });
    }
  },

  confirmReturn: async (req, res) => {
    try {
      const orderCode = Number(req.query.orderCode);

      if (!Number.isFinite(orderCode)) {
        return res.status(400).json({ message: "orderCode khong hop le" });
      }

      if (!payos) {
        return res.status(500).json({ message: "PayOS chua duoc cau hinh day du" });
      }

      const paymentInfo = await payos.paymentRequests.get(orderCode);

      if (paymentInfo.status !== "PAID") {
        return res.status(400).json({
          message: "Giao dich chua thanh cong tren PayOS",
          status: paymentInfo.status,
        });
      }

      const result = await finalizeSuccessfulPayment(String(orderCode));

      if (!result.updated) {
        return res.status(404).json({ message: "Khong tim thay giao dich trong he thong" });
      }

      return res.json({
        success: true,
        status: "PAID",
        provider: PAYMENT_PROVIDERS.PAYOS,
        payment_type: result.payment.payment_type,
      });
    } catch (error) {
      console.error("PayOS Confirm Return Error:", error);
      return res.status(500).json({
        message: error.message || "Khong the xac nhan thanh toan",
      });
    }
  },

  confirmMomoReturn: async (req, res) => {
    try {
      const orderId = String(req.query.orderId || "").trim();

      if (!orderId) {
        return res.status(400).json({ message: "orderId khong hop le" });
      }

      const paymentInfo = await queryMomoPayment(orderId);

      if (Number(paymentInfo.resultCode) !== 0) {
        return res.status(400).json({
          message: paymentInfo.message || "Giao dich chua thanh cong tren MoMo",
          status: paymentInfo.resultCode,
        });
      }

      const result = await finalizeSuccessfulPayment(orderId);

      if (!result.updated) {
        return res.status(404).json({ message: "Khong tim thay giao dich trong he thong" });
      }

      return res.json({
        success: true,
        status: "PAID",
        provider: PAYMENT_PROVIDERS.MOMO,
        payment_type: result.payment.payment_type,
      });
    } catch (error) {
      console.error("MoMo Confirm Return Error:", error);
      return res.status(500).json({
        message: error.message || "Khong the xac nhan thanh toan MoMo",
      });
    }
  },

  handleWebhook: async (req, res) => {
    try {
      const { code, data } = req.body;

      if (code === "00" && data?.orderCode) {
        await finalizeSuccessfulPayment(String(data.orderCode));
        console.log(`>>> Xu ly thanh cong giao dich: ${data.orderCode}`);
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("Webhook Error:", error.message);
      return res.status(500).json({ error: "Webhook handler failed" });
    }
  },

  handleMomoIpn: async (req, res) => {
    try {
      const { resultCode, orderId } = req.body;

      if (Number(resultCode) === 0 && orderId) {
        await finalizeSuccessfulPayment(String(orderId));
        console.log(`>>> Xu ly thanh cong giao dich MoMo: ${orderId}`);
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("MoMo IPN Error:", error.message);
      return res.status(500).json({ error: "MoMo IPN handler failed" });
    }
  },
};
