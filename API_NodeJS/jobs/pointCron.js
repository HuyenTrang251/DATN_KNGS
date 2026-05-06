const cron = require('node-cron');
const db = require('../common/db');
const TutorsService = require('../services/tutors.service');

// Chạy 00:00 mỗi ngày
cron.schedule('0 0 * * *', async () => {
  console.log("--- Checking for 7-day stable classes ---");
  try {
    const sql = `
      SELECT class_session_id, tutor_id FROM class_sessions 
      WHERE status = 'ongoing' 
      AND is_point_added = 0 
      AND created_at <= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    
    const eligibleClasses = await db.query(sql);

    for (let item of eligibleClasses) {
      await TutorsService.adjustPoints(item.tutor_id, 10, `Lớp #${item.class_session_id} hoạt động ổn định sau 1 tuần`);
      await db.query('UPDATE class_sessions SET is_point_added = 1 WHERE class_session_id = ?', [item.class_session_id]);
    }
  } catch (e) { console.error("Cron Job Error:", e.message); }
});