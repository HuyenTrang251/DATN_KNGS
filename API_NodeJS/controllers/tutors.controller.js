const Service = require('../services/tutors.service');
const Model = require('../models/tutors.model');
const { validate } = require('../validations/tutors.validation');

module.exports = {  
  getById: async (req, res) => {
    try {
        const data = await Service.findOne(req.params.id);
        
        if (data) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            
            // Tự nối đường dẫn cố định nếu trong DB có tên file
            if (data.cv_url) {
                data.cv_url = `${baseUrl}/uploads/cvs/${data.cv_url}`;
            }
            if (data.intro_video_url) {
                data.intro_video_url = `${baseUrl}/uploads/videos/${data.intro_video_url}`;
            }
            // Tương tự cho avatar nếu có
            if (data.avatar) {
                data.avatar = `${baseUrl}/uploads/avatars/${data.avatar}`;
            }
        }
        
        res.json(data);
    } catch (e) { res.status(500).send(e.message); }
  },

  // Admin lấy tất cả gia sư (Quản trị)
  getAllAdmin: async (req, res) => {
    try { res.json(await Model.getAllDetailed()); } 
    catch (e) { res.status(500).send(e.message); }
  },

  // Lấy danh sách gia sư (Trang chủ)
  getPublicList: async (req, res) => {
    try {
        const rows = await Model.getApprovedList();
        
        if (!rows || rows.length === 0) {
            return res.json([]);
        }

        const formattedData = rows.map(item => {
            return {
                ...item,
                // Kiểm tra nếu có dữ liệu mới split, nếu không trả về mảng rỗng
                locations: item.locations ? item.locations.split('||') : [],
                
                subject_details: item.subject_details ? item.subject_details.split('||').map(s => {
                    const parts = s.split('|');
                    return { 
                        subject_name: parts[0] || '', 
                        level: parts[1] || '', 
                        tuition: parts[2] || 0,
                        tutor_subject_level_id: parts[3] || null 
                    };
                }) : [],
                
                schedules: item.schedules ? item.schedules.split('||').map(sc => {
                    const parts = sc.split('|');
                    const day = parts[0] || '';
                    const time = parts[1] || '-';
                    const [start, end] = time.split('-');
                    return { day, start: start || '', end: end || '' };
                }) : []
            };
        });

        res.json(formattedData);
    } catch (e) {
        console.error("🔥 Lỗi Backend Controller:", e);
        res.status(500).json({ message: "Lỗi xử lý dữ liệu gia sư", error: e.message });
    }
  },

  // Cập nhật Profile (Dùng chung cho lần đầu và sửa đổi)
  updateProfile: async (req, res) => {
    try {
      await Service.updateFullProfile(req.user.id, req.body);
      res.json({ message: "Cập nhật hồ sơ thành công" });
    } catch (e) { res.status(500).send(e.message); }
  },

  // Admin duyệt tích xanh
  verifyTutor: async (req, res) => {
    try {
      await Service.verifyBlueTick(req.params.id);
      res.json({ message: "Đã cấp tích xanh cho gia sư" });
    } catch (e) { res.status(400).send(e.message); }
  },

  // Admin khóa tài khoản
  lockAccount: async (req, res) => {
    try {
      await db.query('UPDATE users SET status = "locked" WHERE user_id = ?', [req.params.userId]);
      res.json({ message: "Đã khóa tài khoản" });
    } catch (e) { res.status(500).send(e.message); }
  },

  updateMedia: async (req, res) => {
    try {
        const mediaData = {};
        
        // Chỉ lưu tên file vào database
        if (req.files && req.files['cv']) {
            mediaData.cv_url = req.files['cv'][0].filename; 
        }
        if (req.files && req.files['video']) {
            mediaData.intro_video_url = req.files['video'][0].filename;
        }

        if (Object.keys(mediaData).length === 0) {
            return res.status(400).send("Không có file nào được tải lên!");
        }

        // Lưu vào DB (lúc này chỉ có tên file: ví dụ "cv-12345.pdf")
        await Service.updateMedia(req.userId, mediaData);

        // Khâu trả về: API tự nối đường dẫn để Frontend dùng luôn
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const responseData = {
            cv_full_url: mediaData.cv_url ? `${baseUrl}/uploads/cvs/${mediaData.cv_url}` : null,
            video_full_url: mediaData.intro_video_url ? `${baseUrl}/uploads/videos/${mediaData.intro_video_url}` : null
        };

        res.json({ 
            message: "Tải tài liệu gia sư thành công", 
            data: responseData 
        });
    } catch (e) { res.status(500).send(e.message); }
  },
};
