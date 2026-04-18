import React, { useEffect, useState } from 'react';
import './profile.scss';
import * as tutorApi from '../../../services/tutorApi';
import { getAllSubjects } from '../../../services/subjectApi';

const TutorProfile = () => {
  // --- STATE CHÍNH ---
  const [userInfo, setUserInfo] = useState({
    full_name: '', email: '', phone: '', gender: 'male', date_of_birth: '', home_address: '', avatar: ''
  });
  const [tutorInfo, setTutorInfo] = useState({
    experience: '', education: '', teaching_mode: 'all', intro_video_url: '', 
    approval_status: '', is_verified: 0, accumulated_points: 0, cv_url: ''
  });

  // --- STATE MẢNG ĐỘNG ---
  const [locations, setLocations] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);

  // --- STATE FILE UPLOAD ---
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [allSubjectsList, setAllSubjectsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isInitialBirthdaySet, setIsInitialBirthdaySet] = useState(false);
  const [isInitialGenderSet, setIsInitialGenderSet] = useState(false);

  const AVATAR_BASE = "http://localhost:3300/uploads/avatars/";

  // --- 1. LOAD DỮ LIỆU ---
  const fetchAllData = async () => {
    try {
      const [resSubjects, resProfile] = await Promise.all([
        getAllSubjects(),
        tutorApi.getOwnTutorProfile()
      ]);
      
      setAllSubjectsList(resSubjects || []);
      const data = resProfile.data ? resProfile.data : resProfile;

      if (data) {
        setUserInfo({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          gender: data.gender || 'male',
          date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
          home_address: data.home_address || '',
          avatar: data.avatar || ''
        });
        if (data.avatar) setAvatarPreview(AVATAR_BASE + data.avatar);
        // Đánh dấu để khóa trường nếu đã có dữ liệu trong DB
        if (data.date_of_birth) setIsInitialBirthdaySet(true); 
        if (data.gender) setIsInitialGenderSet(true);

        setTutorInfo({
          experience: data.experience || '',
          education: data.education || '',
          teaching_mode: data.teaching_mode || 'all',
          intro_video_url: data.intro_video_url || '',
          approval_status: data.approval_status || '',
          is_verified: data.is_verified || 0,
          accumulated_points: data.accumulated_points || 0,
          cv_url: data.cv_url || ''
        });

        setLocations(data.locations ? data.locations.split('||') : [""]);

        if (data.subjects) {
          const parsedSubs = data.subjects.split('||').map(item => {
            const [id, lvl, fee] = item.split('#');
            return { subject_id: id, level: lvl, tuition: Math.round(fee) };
          });
          setSubjects(parsedSubs);
        } else {
          setSubjects([{ subject_id: "", level: "THCS", tuition: "" }]);
        }

        if (data.schedules) {
          const parsedTimes = data.schedules.split('||').map(item => {
            const [day, start, end] = item.split('#');
            return { day_of_week: day, start_time: start, end_time: end };
          });
          setAvailabilities(parsedTimes);
        } else {
          setAvailabilities([{ day_of_week: "Monday", start_time: "", end_time: "" }]);
        }
      }
    } catch (err) {
      console.error("Lỗi load dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- 2. LOGIC UPLOAD FILE TỪNG PHẦN ---
  // Upload Media (CV & Video - Tutor Route)
  const uploadMediaFiles = async () => {
    if (!cvFile && !videoFile) {
        alert("Vui lòng chọn file trước!");
        return;
    }

    const formData = new FormData();
    // Tên này PHẢI khớp với .fields() ở Backend
    if (cvFile) formData.append('cv', cvFile); 
    if (videoFile) formData.append('video', videoFile);

    try {
        setLoading(true);
        // Gọi API từ tutorApi.jsx
        await tutorApi.uploadTutorMedia(formData);
        
        alert("Tải lên CV/Video thành công!");
        setCvFile(null);
        setVideoFile(null);
        // Gọi hàm fetch để cập nhật lại giao diện nếu cần
        if (typeof fetchAllData === 'function') fetchAllData(); 
    } catch (err) {
        console.error("Lỗi upload:", err);
        alert("Lỗi: " + (err.response?.data || "Không thể upload tài liệu"));
    } finally {
        setLoading(false);
    }
  };

  // --- 3. XỬ LÝ MẢNG ĐỘNG ---
  const handleAddRow = (type) => {
    if (type === 'loc') setLocations([...locations, ""]);
    if (type === 'sub') setSubjects([...subjects, { subject_id: "", level: "THCS", tuition: "" }]);
    if (type === 'time') setAvailabilities([...availabilities, { day_of_week: "Monday", start_time: "", end_time: "" }]);
  };

  const removeRow = (type, index) => {
    if (type === 'loc') setLocations(locations.filter((_, i) => i !== index));
    if (type === 'sub') setSubjects(subjects.filter((_, i) => i !== index));
    if (type === 'time') setAvailabilities(availabilities.filter((_, i) => i !== index));
  };

  // --- 4. SUBMIT THÔNG TIN TỔNG QUÁT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanAvailabilities = availabilities.map(a => ({
        ...a,
        start_time: a.start_time?.substring(0, 5),
        end_time: a.end_time?.substring(0, 5)
      })).filter(a => a.start_time && a.end_time);

      const payload = {
        user_info: {
          phone: userInfo.phone,
          gender: userInfo.gender,
          date_of_birth: userInfo.date_of_birth,
          home_address: userInfo.home_address
        },
        tutor_info: {
            experience: tutorInfo.experience,
            education: tutorInfo.education,
            teaching_mode: tutorInfo.teaching_mode,
            intro_video_url: tutorInfo.intro_video_url
        },
        locations: locations.filter(l => l.trim() !== ""),
        subjects: subjects.filter(s => s.subject_id !== ""),
        availabilities: cleanAvailabilities
      };

      await tutorApi.updateTutorProfile(payload);
      alert("Cập nhật thông tin hồ sơ thành công!");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h3 className="fw-bold text-primary">Thông tin cá nhân Gia sư</h3>
        <div className="status-group">
            <span className={`status-badge ${tutorInfo.approval_status}`}>Duyệt: {tutorInfo.approval_status}</span>
            {tutorInfo.is_verified === 1 && <span className="status-badge verified">Tích xanh <i className="bi bi-patch-check-fill"></i></span>}
        </div>
      </div>
      
      <form className="profile-form" onSubmit={handleSubmit}>
        {/* SECTION 1: USER INFO */}
        <div className="section-card">
          <div className="section-title">Thông tin cơ bản</div>
          <div className="row-layout">
            <div className="form-group col-3">
              <label>Họ và tên</label>
              <input type="text" value={userInfo.full_name} readOnly className="readonly" />
            </div>
            <div className="form-group col-3">
              <label>Email</label>
              <input type="text" value={userInfo.email} readOnly className="readonly" />
            </div>
            <div className="form-group col-3">
              <label>Số điện thoại</label>
              <input type="text" value={userInfo.phone} onChange={e => setUserInfo({...userInfo, phone: e.target.value})} />
            </div>
            <div className="form-group col-3">
                <label>Ngày sinh</label>
                <input type="date" value={userInfo.date_of_birth} onChange={e => setUserInfo({...userInfo, date_of_birth: e.target.value})}
                  readOnly={isInitialBirthdaySet} // Khóa nếu đã có dữ liệu gốc
                  className={isInitialBirthdaySet ? "bg-light" : ""}
                />
            </div>
          </div>

          <div className="row-layout mt-3">
            <div className="form-group col-3">
              <label>Giới tính</label>
              <select value={userInfo.gender} onChange={e => setUserInfo({...userInfo, gender: e.target.value})}
                disabled={isInitialGenderSet} // Khóa nếu đã có dữ liệu gốc
                className={isInitialGenderSet ? "bg-light" : ""}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div className="form-group col-3">
                <label>Hình thức dạy</label>
                <select value={tutorInfo.teaching_mode} onChange={e => setTutorInfo({...tutorInfo, teaching_mode: e.target.value})}>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="all">Cả hai</option>
                </select>
            </div>
            <div className="form-group col-6">
                <label>Địa chỉ liên hệ</label>
                <input type="text" value={userInfo.home_address} onChange={e => setUserInfo({...userInfo, home_address: e.target.value})} placeholder="Số nhà, Tên đường..." />
            </div>
          </div>
        </div>

        {/* SECTION 2: EDUCATION */}
        <div className="section-card">
          <div className="section-title">Hồ sơ chuyên môn</div>
          <div className="form-group mb-3">
            <label>Trình độ học vấn & Bằng cấp</label>
            <input type="text" value={tutorInfo.education} onChange={e => setTutorInfo({...tutorInfo, education: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Kinh nghiệm giảng dạy</label>
            <textarea rows="3" value={tutorInfo.experience} onChange={e => setTutorInfo({...tutorInfo, experience: e.target.value})}></textarea>
          </div>
        </div>

        {/* SECTION 3 & 4: LOCATIONS & SUBJECTS */}
        <div className="row-layout align-start gap-4">
            <div className="section-card flex-1">
                <div className="section-title">Khu vực dạy</div>
                {locations.map((loc, idx) => (
                    <div key={idx} className="dynamic-input-row mb-2">
                        <input type="text" value={loc} onChange={e => {
                            const n = [...locations]; n[idx] = e.target.value; setLocations(n);
                        }} />
                        <button type="button" className="btn-x" onClick={() => removeRow('loc', idx)}>&times;</button>
                    </div>
                ))}
                <button type="button" className="btn-add-line" onClick={() => handleAddRow('loc')}>+ Thêm nơi dạy</button>
            </div>

            <div className="section-card flex-2">
                <div className="section-title">Môn dạy & Học phí</div>
                {subjects.map((sub, idx) => (
                    <div key={idx} className="dynamic-input-row mb-2">
                        <select className="w-40" value={sub.subject_id} onChange={e => {
                            const n = [...subjects]; n[idx].subject_id = e.target.value; setSubjects(n);
                        }}>
                            <option value="">Chọn môn</option>
                            {allSubjectsList.map(s => <option key={s.subject_id} value={s.subject_id}>{s.name}</option>)}
                        </select>
                        <select className="w-30" value={sub.level} onChange={e => {
                            const n = [...subjects]; n[idx].level = e.target.value; setSubjects(n);
                        }}>
                            <option value="Tiểu học">Tiểu học</option><option value="THCS">THCS</option><option value="THPT">THPT</option><option value="Luyện thi">Luyện thi</option>
                        </select>
                        <input className="w-30" type="number" value={sub.tuition} onChange={e => {
                            const n = [...subjects]; n[idx].tuition = e.target.value; setSubjects(n);
                        }} />
                        <button type="button" className="btn-x" onClick={() => removeRow('sub', idx)}>&times;</button>
                    </div>
                ))}
                <button type="button" className="btn-add-line" onClick={() => handleAddRow('sub')}>+ Thêm môn học</button>
            </div>
        </div>

        {/* SECTION 5: TIME */}
        <div className="section-card">
            <div className="section-title">Lịch rảnh trong tuần</div>
            <div className="grid-layout-3">
                {availabilities.map((avai, idx) => (
                    <div key={idx} className="dynamic-input-row mb-2">
                        <select value={avai.day_of_week} onChange={e => {
                            const n = [...availabilities]; n[idx].day_of_week = e.target.value; setAvailabilities(n);
                        }}>
                            <option value="Monday">Thứ 2</option><option value="Tuesday">Thứ 3</option><option value="Wednesday">Thứ 4</option>
                            <option value="Thursday">Thứ 5</option><option value="Friday">Thứ 6</option><option value="Saturday">Thứ 7</option><option value="Sunday">Chủ nhật</option>
                        </select>
                        <input type="time" value={avai.start_time} onChange={e => {
                            const n = [...availabilities]; n[idx].start_time = e.target.value; setAvailabilities(n);
                        }} />
                        <input type="time" value={avai.end_time} onChange={e => {
                            const n = [...availabilities]; n[idx].end_time = e.target.value; setAvailabilities(n);
                        }} />
                        <button type="button" className="btn-x" onClick={() => removeRow('time', idx)}>&times;</button>
                    </div>
                ))}
            </div>
            <button type="button" className="btn-add-line" onClick={() => handleAddRow('time')}>+ Thêm khung giờ</button>
        </div>

        {/* SECTION 6: MEDIA (CV & VIDEO) */}
        <div className="section-card">
            <div className="section-title">Tài liệu & Video</div>
            <div className="row-layout">
                <div className="form-group flex-1">
                    <label>Link Video giới thiệu (Nếu có link sẵn)</label>
                    <input type="text" value={tutorInfo.intro_video_url} onChange={e => setTutorInfo({...tutorInfo, intro_video_url: e.target.value})} />
                </div>
                <div className="form-group flex-1">
                    <label>Tải lên video (File mp4)</label>
                    <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="form-control" />
                </div>
                <div className="form-group flex-1">
                    <label>Hồ sơ CV/Bằng cấp (PDF)</label>
                    <input type="file" accept=".pdf" onChange={(e) => setCvFile(e.target.files[0])} className="form-control" />
                    {tutorInfo.cv_url && <small className="text-success">Đã có file: {tutorInfo.cv_url}</small>}
                </div>
            </div>
            {(cvFile || videoFile) && (
                <div className="text-end mt-2">
                    <button type="button" className="btn btn-info btn-sm text-white fw-bold" onClick={uploadMediaFiles}>Tải lên tài liệu mới</button>
                </div>
            )}
        </div>

        <div className="actions-bar mt-4">
          <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Đang lưu..." : "LƯU TẤT CẢ THÔNG TIN"}</button>
        </div>
      </form>
    </div>
  );
};

export default TutorProfile;