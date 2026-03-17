const Service = require('../services/tutors.service');
const { validate } = require('../validations/tutors.validation');

module.exports = {
  getAll: async (req, res) => {
    try { const data = await Service.findAll(); res.json(data); } catch (e) { res.status(500).send(e.message); }
  },
  
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

  create: async (req, res) => {
    try {
      const { error } = validate(req.body);
      if (error) return res.status(400).send(error.details[0].message);
      const result = await Service.add(req.body);
      res.status(201).json(result);
    } catch (e) { res.status(500).send(e.message); }
  },
  update: async (req, res) => {
    try { await Service.edit(req.params.id, req.body); res.send('Updated successfully'); } catch (e) { res.status(500).send(e.message); }
  },
  delete: async (req, res) => {
    try { await Service.remove(req.params.id); res.send('Deleted successfully'); } catch (e) { res.status(500).send(e.message); }
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