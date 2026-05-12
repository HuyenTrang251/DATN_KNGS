const { randomUUID } = require('crypto');
const { PayOS } = require('@payos/node');

const Model = require('../models/payments.model');
const BookingModel = require('../models/bookings.model');
const PostModel = require('../models/posts.model');

const PAYMENT_PROVIDERS = {
  PAYOS: 'payos',
  MOMO: 'momo',
  ZALOPAY: 'zalopay',
};

const payos =
  process.env.PAYOS_CLIENT_ID &&
  process.env.PAYOS_API_KEY &&
  process.env.PAYOS_CHECKSUM_KEY &&
  process.env.PAYOS_PARTNER_CODE
    ? new PayOS({
        clientId: process.env.PAYOS_CLIENT_ID,
        apiKey: process.env.PAYOS_API_KEY,
        checksumKey: process.env.PAYOS_CHECKSUM_KEY,
        partnerCode: process.env.PAYOS_PARTNER_CODE,
      })
    : null;

const REFUND_WINDOW_DAYS = 5;

const isWithinRefundWindow = (payment) => {
  if (!payment?.updated_at) return false;

  const paymentTime = new Date(payment.updated_at).getTime();
  const deadline = paymentTime + REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() <= deadline;
};

const getPaymentProvider = (payment) => {
  const normalizedCode = String(payment?.transaction_code || '').toUpperCase();

  if (normalizedCode.startsWith('MOMO_')) {
    return PAYMENT_PROVIDERS.MOMO;
  }

  if (/^\d{6}_ZLP/.test(normalizedCode)) {
    return PAYMENT_PROVIDERS.ZALOPAY;
  }

  return PAYMENT_PROVIDERS.PAYOS;
};

const ensureRefundablePayment = async (payment) => {
  if (!payment) {
    throw new Error('Không tìm thấy giao dịch cần hoàn tiền');
  }

  if (payment.status !== 'success') {
    throw new Error('Chỉ có thể hoàn tiền cho giao dịch đã thanh toán thành công');
  }

  if (!['receive_job', 'receive_booking'].includes(payment.payment_type)) {
    throw new Error('Chỉ hỗ trợ hoàn tiền cho phí nhận lớp hoặc phí đặt lịch');
  }

  if (!isWithinRefundWindow(payment)) {
    throw new Error('Giao dịch đã quá 5 ngày kể từ lúc mở số điện thoại, không thể hoàn tiền');
  }

  if (payment.payment_type === 'receive_booking') {
    const booking = await BookingModel.getDetailById(payment.booking_id);
    if (!booking || booking.status !== 'cancelled') {
      throw new Error('Chỉ có thể hoàn tiền khi lời mời dạy đã bị hủy');
    }
  }

  if (payment.payment_type === 'receive_job') {
    const post = await PostModel.getById(payment.post_id);
    if (!post || post.status !== 'cancelled') {
      throw new Error('Chỉ có thể hoàn tiền khi yêu cầu nhận lớp đã bị hủy');
    }
  }
};

const Service = {
  create: async (req, res) => {
    try {
      const { tutor_id, post_id, booking_id, payment_type, amount, transaction_code } = req.body;

      // Chuẩn bị dữ liệu sạch
      const paymentData = {
        tutor_id: Number(tutor_id),
        post_id: post_id ? Number(post_id) : null,
        booking_id: booking_id ? Number(booking_id) : null,
        payment_type: payment_type, // 'verify_profile', 'receive_job', 'receive_booking'
        amount: parseFloat(amount),
        transaction_code: transaction_code,
        status: 'pending'
      };

      const result = await Service.add(paymentData);
      res.status(201).json({ message: "Gửi thông tin thanh toán thành công", result });
      
    } catch (e) {
      // IN LỖI RA TERMINAL ĐỂ KIỂM TRA (Ví dụ: trùng transaction_code hoặc sai ENUM)
      console.error("🔥 Lỗi tạo Payment:", e.sqlMessage || e.message);
      
      res.status(500).json({ 
        message: "Lỗi hệ thống database", 
        error: e.sqlMessage || e.message 
      });
    }
  },

  // Hàm xử lý duyệt
  approvePayment: async (id, status, adminId) => {
    const payment = await Model.getById(id);
    if (!payment) {
      throw new Error('Không tìm thấy giao dịch cần cập nhật');
    }

    if (status === 'refunded') {
      await ensureRefundablePayment(payment);
    }

    return await Model.updateStatus(id, status, adminId);
  },

  refundPayment: async (id, adminId, refundData = {}) => {
    const payment = await Model.getById(id);
    await ensureRefundablePayment(payment);

    const provider = getPaymentProvider(payment);
    if (provider === PAYMENT_PROVIDERS.MOMO) {
      throw new Error('Giao dịch MoMo hiện chưa hỗ trợ hoàn tiền tự động trong hệ thống này. Hãy yêu cầu gia sư gửi tài khoản hoặc QR để admin hoàn thủ công ngoài cổng.');
    }

    if (provider === PAYMENT_PROVIDERS.ZALOPAY) {
      throw new Error('Giao dịch ZaloPay hiện chưa hỗ trợ hoàn tiền tự động trong hệ thống này. Hãy yêu cầu gia sư gửi tài khoản hoặc QR để admin hoàn thủ công ngoài cổng.');
    }

    if (!payos) {
      throw new Error('PayOS payout chưa được cấu hình đầy đủ. Cần PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY và PAYOS_PARTNER_CODE.');
    }

    const toBin = String(refundData.toBin || '').trim();
    const toAccountNumber = String(refundData.toAccountNumber || '').trim();
    const description = String(refundData.description || `Hoan phi #${payment.id}`).trim().slice(0, 50) || `Hoan phi #${payment.id}`;

    if (!toBin || !toAccountNumber) {
      throw new Error('Thiếu thông tin tài khoản nhận hoàn: mã ngân hàng và số tài khoản');
    }

    const payout = await payos.payouts.create(
      {
        referenceId: `refund_payment_${payment.id}_${Date.now()}`,
        amount: Number(payment.amount),
        description,
        toBin,
        toAccountNumber,
        category: ['refund'],
      },
      randomUUID()
    );

    await Model.updateStatus(id, 'refunded', adminId);

    return {
      provider,
      payoutId: payout?.id || null,
      approvalState: payout?.approvalState || null,
      transactionState: payout?.transactions?.[0]?.state || null,
      toBin,
      toAccountNumber,
    };
  },
  
  findAll: async () => await Model.getAll(),
  findOne: async (id) => await Model.getById(id),
  add: async (data) => await Model.create(data),
  edit: async (id, data) => await Model.update(id, data),
  remove: async (id) => await Model.delete(id)
};

module.exports = Service;