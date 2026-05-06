// const { PayOS} = require("@payos/node");
// const payos = new PayOS(process.env.PAYOS_CLIENT_ID, process.env.PAYOS_API_KEY, process.env.PAYOS_CHECKSUM_KEY);

// const PaymentModel = require('../models/payments.model');
// const BookingModel = require('../models/bookings.model');
// const TutorModel = require('../models/tutors.model');

// module.exports = {
//   // 1. Hàm tạo Link thanh toán
//   createLink: async (req, res) => {
//     try {
//       const { tutor_id, post_id, booking_id, amount, payment_type, description } = req.body;
//       const orderCode = Number(String(Date.now()).slice(-9)); // PayOS yêu cầu orderCode là số

//       // Gửi yêu cầu sang PayOS
//       const paymentLink = await payos.createPaymentLink({
//         orderCode,
//         amount: Number(amount),
//         description: description.substring(0, 25),
//         cancelUrl: `${process.env.FRONTEND_URL}/payment-cancel`,
//         returnUrl: `${process.env.FRONTEND_URL}/payment-success`,
//       });

//       // Lưu vào DB qua Model
//       await PaymentModel.create({
//         tutor_id, post_id, booking_id, payment_type, amount,
//         transaction_code: orderCode
//       });

//       res.json({ checkoutUrl: paymentLink.checkoutUrl });
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//     }
//   },

//   // 2. Webhook - PayOS tự động gọi đến đây khi có tiền
//   handleWebhook: async (req, res) => {
//     try {
//       const { code, data } = req.body;

//       if (code === "00") {
//         const orderCode = data.orderCode;
        
//         // Tìm đơn hàng qua Model
//         const payment = await PaymentModel.findByTransactionCode(orderCode);

//         if (payment) {
//           // A. Duyệt tiền tự động
//           await PaymentModel.updateToSuccess(payment.id);

//           // B. Tự động xử lý nghiệp vụ theo loại thanh toán
//           if (payment.payment_type === 'receive_booking') {
//             // Nếu nộp phí đặt lịch -> Mở khóa SĐT cho Gia sư
//             await BookingModel.update(payment.booking_id, { status: 'connecting' });
//           } 
//           else if (payment.payment_type === 'verify_profile') {
//             // Nếu nộp phí Tích xanh -> Admin vẫn duyệt hồ sơ sau, nhưng tiền đã ghi nhận Success
//             console.log("Tiền Tích xanh đã về, chờ Admin duyệt bằng cấp.");
//           }
//         }
//       }
//       return res.json({ success: true });
//     } catch (e) {
//       console.error("Webhook Error:", e.message);
//       return res.status(500).json({ error: e.message });
//     }
//   }
// };

const { PayOS } = require("@payos/node"); 

// 2. PHẢI truyền vào 1 Object có đúng 3 tên biến: clientId, apiKey, checksumKey
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

// 3. KIỂM TRA LẠI (Log này phải ra 'function')
console.log("-----------------------------------------");
console.log("KIỂM TRA CHỐT HẠ:");
console.log("- Hàm createPaymentLink:", typeof payos.createPaymentLink);
console.log("-----------------------------------------");

const PaymentModel = require('../models/payments.model');
const BookingModel = require('../models/bookings.model');
const TutorModel = require('../models/tutors.model');
const PostAppModel = require('../models/post_applications.model'); // Bạn cần tạo/import model này

module.exports = {
  createLink: async (req, res) => {
    try {
      const { tutor_id, post_id, booking_id, amount, payment_type, description } = req.body;
      
      // Tạo orderCode duy nhất (không trùng)
      const orderCode = Number(String(Date.now()).slice(-9));

      try {
        const body = {
          orderCode: Number(Date.now()), // Phải là số
          amount: Number(amount),        // Phải là số
          description: description.substring(0, 25), // Không quá 25 ký tự
          cancelUrl: `${process.env.FRONTEND_URL}/payment-cancel`,
          returnUrl: `${process.env.FRONTEND_URL}/payment-success`,
        };

        // Lúc này payos.createPaymentLink chắc chắn đã tồn tại
        const paymentLinkRes = await payos.createPaymentLink(body);
        
        res.json({ checkoutUrl: paymentLinkRes.checkoutUrl });
      } catch (error) {
        console.error("PayOS Error:", error);
        res.status(500).json({ error: error.message });
      }

      // Lưu vào database với trạng thái pending
      await PaymentModel.create({
        tutor_id, 
        post_id: post_id || null, 
        booking_id: booking_id || null, 
        payment_type, 
        amount,
        transaction_code: orderCode,
        status: 'pending'
      });

      res.json({ checkoutUrl: paymentLink.checkoutUrl });
    } catch (e) {
      console.error("PayOS Create Link Error:", e);
      res.status(500).json({ error: e.message });
    }
  },

  handleWebhook: async (req, res) => {
    try {
      const { code, data } = req.body;
      // Lưu ý: Trong thực tế nên check checksum của PayOS tại đây để bảo mật

      if (code === "00") { // Thanh toán thành công
        const orderCode = data.orderCode;
        const payment = await PaymentModel.findByTransactionCode(orderCode);

        if (payment && payment.status === 'pending') {
          // 1. Cập nhật trạng thái thanh toán thành công
          await PaymentModel.updateToSuccess(payment.id);

          // 2. Tự động xử lý nghiệp vụ theo loại thanh toán
          switch (payment.payment_type) {
            case 'receive_booking':
              // Nếu là đặt lịch gia sư: Cập nhật status booking để hiện SĐT
              // Model bookings của bạn đã có logic che SĐT nếu status != success
              await BookingModel.update(payment.booking_id, { status: 'connecting' });
              // Bạn có thể update thẳng lên success nếu muốn hiện SĐT luôn mà không cần gọi điện
              break;

            case 'receive_job':
              // Nếu là nhận lớp từ bài đăng: Cập nhật trạng thái ứng tuyển
              if (payment.post_id && payment.tutor_id) {
                await PostAppModel.updateStatusByTutor(payment.post_id, payment.tutor_id, 'agreed');
              }
              break;

            case 'verify_profile':
              // Nếu là nộp phí Tích xanh: Tự động cấp tích xanh cho Gia sư
              await TutorModel.updateVerifyStatus(payment.tutor_id, 1);
              break;
          }
          console.log(`>>> Tự động xử lý thành công cho giao dịch: ${orderCode}`);
        }
      }
      return res.json({ success: true });
    } catch (e) {
      console.error("Webhook Error:", e.message);
      return res.status(500).json({ error: "Webhook handler failed" });
    }
  }
};