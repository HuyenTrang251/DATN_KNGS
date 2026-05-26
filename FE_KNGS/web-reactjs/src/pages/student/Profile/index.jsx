// import React, { useEffect, useState } from 'react';
// import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
// // Import c�c h�m t? studentApi
// import { getStudentById, updateStudentProfile } from '../../../services/studentApi';
// import { useAuth } from '../../../contexts/AuthContext';

// const StudentProfile = () => {
//     const { user } = useAuth(); 
//     const [profile, setProfile] = useState({
//         full_name: '', 
//         email: '', 
//         phone: '', 
//         address: '',
//         gender: '',
//         date_of_birth: '',
//         grade: '', 
//         avatar: '',
//         user_id: null
//     });
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [preview, setPreview] = useState('');
//     const [isInitialBirthdaySet, setIsInitialBirthdaySet] = useState(false);
//     const [isInitialGenderSet, setIsInitialGenderSet] = useState(false);

//     // Đường dẫn ảnh đồng nhất với trang quản lý
//     const AVATAR_BASE_URL = "http://localhost:3300/uploads/avatars";
    
//     const studentId = user?.id; 

//     useEffect(() => {
//         if (studentId) {
//             fetchProfile();
//         }
//     }, [studentId]);

//     const fetchProfile = async () => {
//         try {
//             const data = await getStudentById();
//             setProfile(data);
            
//             // Ki?m tra xem trong DB d� c� ng�y sinh/gi?i t�nh chua
//             if (data.date_of_birth) {
//                 setIsInitialBirthdaySet(true); 
//             }
//             if (data.gender) {
//                 setIsInitialGenderSet(true);
//             }

//             if (data.avatar) {
//                 setPreview(`${AVATAR_BASE_URL}/${data.avatar}`);
//             } else {
//                 setPreview('/image/avatar.jpg');
//             }
//         } catch (error) {
//             console.error("Lỗi lấy thông tin:", error);
//         }
//     };

//     // API Cập nhật thông tin (Sử dụng hàm từ studentApi)
//     const handleUpdateProfile = async (e) => {
//         e.preventDefault();
//         try {
//             // Chỉ gửi những trường cho phép sửa
//             const updateData = {
//                 phone: profile.phone,
//                 address: profile.address,
//                 grade: profile.grade
//             };
            
//             await updateStudentProfile(studentId, updateData);
//             alert("Cập nhật thông tin thành công!");
//             fetchProfile();
//         } catch (error) {
//             alert("Cập nhật thất bại: " + (error.response?.data?.message || error.message));
//         }
//     };

//     // Helper để định dạng ngày từ server (TxxxxZ) về yyyy-MM-dd cho ô input
//     const formatDate = (dateStr) => {
//         if (!dateStr) return "";
//         return dateStr.split('T')[0];
//     };

//     return (
//         <Container className="mt-5 pb-5">
//             <Row>
//                 {/* C?t tr�i: ?nh d?i di?n
//                 <Col md={4} className="text-center">
//                     <Card className="p-4 shadow-sm border-0">
//                         <div className="mb-3">
//                             <img 
//                                 src={preview} 
//                                 className="img-thumbnail rounded-circle shadow-sm" 
//                                 style={{width: '180px', height: '180px', objectFit: 'cover'}}
//                                 alt="avatar preview"
//                                 onError={(e) => e.target.src = '/image/avatar.jpg'}
//                             />
//                         </div>
//                         <Form.Group className="mb-3">
//                             <Form.Label className="small text-muted">Thay đổi ảnh đại diện</Form.Label>
//                             <Form.Control type="file" size="sm" accept="image/*" onChange={onFileChange} />
//                         </Form.Group>
//                         <Button 
//                             variant="primary" 
//                             className="w-100 fw-bold rounded-pill" 
//                             onClick={handleUploadAvatar} 
//                             disabled={!selectedFile}
//                         >
//                             <i className="bi bi-cloud-arrow-up me-2"></i>Lưu ảnh mới
//                         </Button>
//                     </Card>
//                 </Col> */}

//                 {/* Thông tin chi tiết */}
//                 <Col md={12}>
//                     <Card className="p-1 shadow-sm border-0">
//                         <h3 className="mb-4 fw-bold text-primary border-bottom pb-2">Th�ng tin c� nh�n H?c vi�n</h3>
//                         <Form onSubmit={handleUpdateProfile}>
//                             <Row className="mb-3">
//                                 <Col md={6}>
//                                     <Form.Label className="fw-bold small">Họ và tên</Form.Label>
//                                     <Form.Control 
//                                         type="text" 
//                                         value={profile.full_name} 
//                                         readOnly 
//                                         className="bg-light text-muted border-0" 
//                                         style={{cursor: 'not-allowed'}}
//                                     />
//                                 </Col>
//                                 <Col md={6}>
//                                     <Form.Label className="fw-bold small">Email</Form.Label>
//                                     <Form.Control 
//                                         type="email" 
//                                         value={profile.email} 
//                                         readOnly 
//                                         className="bg-light text-muted border-0"
//                                         style={{cursor: 'not-allowed'}}
//                                     />
//                                 </Col>
//                             </Row>

//                             <Row className="mb-3">
//                                 <Col md={6}>
//                                     <Form.Label className="fw-bold small">Giới tính</Form.Label>
//                                     <Form.Select 
//                                         value={profile.gender || ''} 
//                                         onChange={(e) => setProfile({...profile, gender: e.target.value})}
//                                         // KH�A N?U �� C� D? LI?U
//                                         disabled={isInitialGenderSet}
//                                         className={isInitialGenderSet ? "bg-light text-muted border-0" : ""}
//                                     >
//                                         <option value="">-- Chọn giới tính --</option>
//                                         <option value="male">Nam</option>
//                                         <option value="female">Nữ</option>
//                                         <option value="other">Kh�c</option>
//                                     </Form.Select>
//                                 </Col>
//                                 <Col md={6}>
//                                     <Form.Label className="fw-bold small" >Ngày sinh</Form.Label>
//                                     <Form.Control 
//                                         type="date" 
//                                         placeholder="Ngày sinh"
//                                         value={profile.date_of_birth || ''} 
//                                         onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})} 
//                                         // KH�A N?U �� C� D? LI?U
//                                         readOnly={isInitialBirthdaySet}
//                                         className={isInitialBirthdaySet ? "bg-light text-muted border-0" : ""}
//                                     />
//                                 </Col>
//                             </Row>
                            
//                             <Row className="mb-3">
//                                 <Col md={6}>
//                                     <Form.Label className="fw-bold small">Số điện thoại</Form.Label>
//                                     <Form.Control 
//                                         type="text" 
//                                         placeholder="Nhập số điện thoại"
//                                         value={profile.phone || ''} 
//                                         onChange={(e) => setProfile({...profile, phone: e.target.value})} 
//                                     />
//                                 </Col>
//                                 <Col md={6}>
//                                     <Form.Label className="fw-bold small">Khối lớp</Form.Label>
//                                     <Form.Select 
//                                         value={profile.grade || ''} 
//                                         onChange={(e) => setProfile({...profile, grade: e.target.value})}
//                                     >
//                                         <option value="">-- Chọn khối lớp --</option>
//                                         <option value="Lớp 1">Lớp 1</option>
//                                         <option value="Lớp 2">Lớp 2</option>
//                                         <option value="Lớp 3">Lớp 3</option>
//                                         <option value="Lớp 4">Lớp 4</option>
//                                         <option value="Lớp 5">Lớp 5</option>
//                                         <option value="Lớp 6">Lớp 6</option>
//                                         <option value="Lớp 7">Lớp 7</option>
//                                         <option value="Lớp 8">Lớp 8</option>
//                                         <option value="Lớp 9">Lớp 9</option>
//                                         <option value="Lớp 10">Lớp 10</option>
//                                         <option value="Lớp 11">Lớp 11</option>
//                                         <option value="Lớp 12">Lớp 12</option>
//                                         <option value="Luyện thi">Luyện thi</option>
//                                     </Form.Select>
//                                 </Col>
//                             </Row>

//                             <Form.Group className="mb-4">
//                                 <Form.Label className="fw-bold small">Địa chỉ hiện tại</Form.Label>
//                                 <Form.Control 
//                                     as="textarea" 
//                                     rows={3}
//                                     placeholder="S? nh�, t�n du?ng, Phu?ng/X�, Qu?n/Huy?n, T?nh/Th�nh ph?"
//                                     value={profile.address || ''} 
//                                     onChange={(e) => setProfile({...profile, address: e.target.value})} 
//                                 />
//                             </Form.Group>

//                             <div className="text-center">
//                                 <Button type="submit" variant="success" className="px-5 py-2 fw-bold rounded-pill">
//                                     <i className="bi bi-save me-2"></i>Lưu thay đổi
//                                 </Button>
//                             </div>
//                         </Form>
//                     </Card>
//                 </Col>
//             </Row>
//         </Container>
//     );
// };

// export default StudentProfile;

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { getStudentById, updateStudentProfile } from '../../../services/studentApi';
import { useAuth } from '../../../contexts/AuthContext';

const StudentProfile = () => {
    const { user } = useAuth(); 
    const [profile, setProfile] = useState({
        full_name: '', 
        email: '', 
        phone: '', 
        address: '',
        gender: '',
        date_of_birth: '',
        grade: '', 
        avatar: '',
        user_id: null
    });
    const [loading, setLoading] = useState(true);
    const [isInitialBirthdaySet, setIsInitialBirthdaySet] = useState(false);
    const [isInitialGenderSet, setIsInitialGenderSet] = useState(false);

    const AVATAR_BASE_URL = "http://localhost:3300/uploads/avatars";
    
    // Đảm bảo lấy đúng ID người dùng từ context
    const studentId = user?.id; 

    useEffect(() => {
        // Chỉ gọi API khi đã xác định được studentId
        if (studentId) {
            fetchProfile();
        }
    }, [studentId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            // FIX LỖI: Phải truyền studentId vào hàm này
            const data = await getStudentById(studentId); 
            
            if (data) {
                setProfile(data);
                
                // Đánh dấu để khóa trường nếu đã có dữ liệu trong DB
                if (data.date_of_birth) setIsInitialBirthdaySet(true); 
                if (data.gender) setIsInitialGenderSet(true);
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin cá nhân:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                phone: profile.phone,
                address: profile.address,
                grade: profile.grade,
                // Gửi thêm gender/dob nếu chúng chưa được set (để lưu lần đầu)
                gender: isInitialGenderSet ? undefined : profile.gender,
                date_of_birth: isInitialBirthdaySet ? undefined : profile.date_of_birth
            };
            
            await updateStudentProfile(studentId, updateData);
            alert("Cập nhật thông tin thành công!");
            fetchProfile(); // Load lại dữ liệu để khóa các trường vừa nhập
        } catch (error) {
            alert("Cập nhật thất bại: " + (error.response?.data?.message || error.message));
        }
    };

    // Helper: Chuyển "2008-03-04T17:00:00.000Z" -> "2008-03-04" cho ô input date
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return "";
        return dateStr.split('T')[0];
    };

    if (loading && studentId) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="mt-5 pb-5">
            <Card className="p-4 shadow-sm border-0">
                <h3 className="mb-4 fw-bold text-primary border-bottom pb-2">Thông tin cá nhân Học viên</h3>
                <Form onSubmit={handleUpdateProfile}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label className="fw-bold small">Họ và tên</Form.Label>
                            <Form.Control type="text" value={profile.full_name} readOnly className="bg-light" />
                        </Col>
                        <Col md={6}>
                            <Form.Label className="fw-bold small">Email</Form.Label>
                            <Form.Control type="text" value={profile.email} readOnly className="bg-light" />
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label className="fw-bold small">Giới tính</Form.Label>
                            <Form.Select 
                                value={profile.gender || ''} 
                                onChange={(e) => setProfile({...profile, gender: e.target.value})}
                                disabled={isInitialGenderSet} // Khóa nếu đã có dữ liệu gốc
                                className={isInitialGenderSet ? "bg-light" : ""}
                            >
                                <option value="">-- Chọn giới tính --</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </Form.Select>
                        </Col>
                        <Col md={6}>
                            <Form.Label className="fw-bold small">Ngày sinh</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={formatDateForInput(profile.date_of_birth)} 
                                onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})} 
                                readOnly={isInitialBirthdaySet} // Khóa nếu đã có dữ liệu gốc
                                className={isInitialBirthdaySet ? "bg-light" : ""}
                            />
                        </Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label className="fw-bold small">Số điện thoại</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={profile.phone || ''} 
                                onChange={(e) => setProfile({...profile, phone: e.target.value})} 
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Label className="fw-bold small">Khối lớp</Form.Label>
                            <Form.Select 
                                value={profile.grade || ''} 
                                onChange={(e) => setProfile({...profile, grade: e.target.value})}
                            >
                                <option value="">-- Chọn khối lớp --</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i} value={`Lớp ${i + 1}`}>Lớp {i + 1}</option>
                                ))}
                                <option value="Luyện thi">Luyện thi</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small">Địa chỉ hiện tại</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3}
                            value={profile.address || ''} 
                            onChange={(e) => setProfile({...profile, address: e.target.value})} 
                        />
                    </Form.Group>

                    <div className="text-center">
                        <Button type="submit" variant="success" className="px-5 py-2 fw-bold rounded-pill">
                            Lưu thay đổi
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
};

export default StudentProfile;






