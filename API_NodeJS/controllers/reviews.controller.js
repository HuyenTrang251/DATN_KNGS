const db = require('../common/db');
const Model = require('../models/reviews.model');

module.exports = {
  create: async (req, res) => {
    try {
      const { class_session_id, rating, comment } = req.body;
      const reviewer_id = req.user.id;

      const existingRows = await db.query(
        'SELECT review_id, deleted_at FROM reviews WHERE class_session_id = ? AND reviewer_id = ? LIMIT 1',
        [class_session_id, reviewer_id]
      );
      const existingRecord = existingRows[0];

      if (existingRecord) {
        if (existingRecord.deleted_at) {
          return res.status(403).json({ message: "Bạn đã xóa đánh giá trước đó và không thể thực hiện lại." });
        }

        return res.status(400).json({ message: "Bạn đã đánh giá lớp học này rồi. Vui lòng dùng chức năng sửa." });
      }

      const sessionParties = await Model.getSessionParties(class_session_id);
      if (!sessionParties) {
        return res.status(404).json({ message: 'Không tìm thấy lớp học để đánh giá' });
      }

      let reviewed_user_id = null;
      if (Number(reviewer_id) === Number(sessionParties.student_user_id)) {
        reviewed_user_id = sessionParties.tutor_user_id;
      } else if (Number(reviewer_id) === Number(sessionParties.tutor_user_id)) {
        reviewed_user_id = sessionParties.student_user_id;
      }

      if (!reviewed_user_id) {
        return res.status(403).json({ message: 'Bạn không thuộc lớp học này nên không thể đánh giá' });
      }

      await Model.create({
        class_session_id,
        reviewer_id,
        reviewed_user_id,
        rating,
        comment,
      });

      res.status(201).json({ success: true, message: 'Đăng đánh giá thành công' });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  update: async (req, res) => {
    try {
      const review = await Model.getById(req.params.id);
      if (!review || review.reviewer_id !== req.user.id) {
        return res.status(403).send("Bạn không có quyền sửa đánh giá này");
      }
      await Model.update(req.params.id, req.body);
      res.send('Cập nhật thành công');
    } catch (e) { res.status(500).send(e.message); }
  },

  delete: async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id; // ID người đang đăng nhập từ token

        // 1. Lấy thông tin đánh giá từ database
        const review = await Model.getById(reviewId);

        if (!review) {
            return res.status(404).json({ message: "Không tìm thấy đánh giá này" });
        }

        // 2. Kiểm tra quyền xóa: 
        // Phải dùng Number() để tránh lỗi so sánh kiểu String vs Number
        const isOwner = Number(review.reviewer_id) === Number(userId);
        const isAdmin = Number(req.user.role_id) === 1;

        console.log("--- [DEBUG DELETE REVIEW] ---");
        console.log("Reviewer ID trong DB:", review.reviewer_id);
        console.log("User ID từ Token:", userId);
        console.log("Quyền sở hữu:", isOwner);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Bạn không có quyền xóa đánh giá của người khác" });
        }

        // 3. Thực hiện xóa
        await Model.delete(reviewId);
        res.json({ success: true, message: 'Xóa thành công' });

    } catch (e) {
        console.error("🔥 Lỗi xóa đánh giá:", e.message);
        res.status(500).json({ error: e.message });
    }
  },

  // Admin lấy danh sách
  adminGetAll: async (req, res) => {
    try {
      const data = await Model.getAllForAdmin();
      res.json(data);
    } catch (e) { res.status(500).send(e.message); }
  }
};