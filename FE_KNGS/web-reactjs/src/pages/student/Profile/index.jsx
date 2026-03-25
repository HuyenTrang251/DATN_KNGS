import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
// Import các hàm từ studentApi
import { getStudentById, updateStudentProfile } from '../../../services/studentApi';
// Import axiosClient để gọi các api dùng chung (như upload avatar)
import axiosClient from '../../../api/axiosClient';

const StudentProfile = () => {
    const [profile, setProfile] = useState({
        full_name: '', 
        email: '', 
        phone: '', 
        address: '', 
        grade: '', 
        avatar: '',
        user_id: null
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState('');

    // Đường dẫn ảnh đồng nhất với trang quản lý
    const AVATAR_BASE_URL = "http://localhost:3300/uploads/avatars";
    
    // Giả sử ID học viên (student_id) cố định là 9 theo yêu cầu của bạn
    const studentId = 9; 

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Sử dụng hàm từ studentApi
            const data = await getStudentById(studentId);
            setProfile(data);
            
            if (data.avatar) {
                setPreview(`${AVATAR_BASE_URL}/${data.avatar}`);
            } else {
                setPreview('/image/avatar.jpg');
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin cá nhân:", error);
        }
    };

    // Xử lý chọn ảnh và tạo preview
    // const onFileChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         setSelectedFile(file);
    //         setPreview(URL.createObjectURL(file));
    //     }
    // };

    // API Upload ảnh (Sử dụng route /users/upload-avatar bạn đã viết)
    // const handleUploadAvatar = async () => {
    //     if (!selectedFile) return;
        
    //     const formData = new FormData();
    //     formData.append('avatar', selectedFile);

    //     try {
    //         // Gọi api upload-avatar (đã có authentic middleware xử lý lấy ID từ token)
    //         await axiosClient.post("/users/upload-avatar", formData, {
    //             headers: { 'Content-Type': 'multipart/form-data' }
    //         });
    //         alert("Cập nhật ảnh đại diện thành công!");
    //         setSelectedFile(null);
    //         fetchProfile(); // Load lại để cập nhật tên file mới từ DB
    //     } catch (error) {
    //         alert("Lỗi upload: " + (error.response?.data || error.message));
    //     }
    // };

    // API Cập nhật thông tin (Sử dụng hàm từ studentApi)
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            // Chỉ gửi những trường cho phép sửa
            const updateData = {
                phone: profile.phone,
                address: profile.address,
                grade: profile.grade
            };
            
            await updateStudentProfile(studentId, updateData);
            alert("Cập nhật thông tin thành công!");
            fetchProfile();
        } catch (error) {
            alert("Cập nhật thất bại: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <Container className="mt-5 pb-5">
            <Row>
                {/* Cột trái: Ảnh đại diện
                <Col md={4} className="text-center">
                    <Card className="p-4 shadow-sm border-0">
                        <div className="mb-3">
                            <img 
                                src={preview} 
                                className="img-thumbnail rounded-circle shadow-sm" 
                                style={{width: '180px', height: '180px', objectFit: 'cover'}}
                                alt="avatar preview"
                                onError={(e) => e.target.src = '/image/avatar.jpg'}
                            />
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted">Thay đổi ảnh đại diện</Form.Label>
                            <Form.Control type="file" size="sm" accept="image/*" onChange={onFileChange} />
                        </Form.Group>
                        <Button 
                            variant="primary" 
                            className="w-100 fw-bold rounded-pill" 
                            onClick={handleUploadAvatar} 
                            disabled={!selectedFile}
                        >
                            <i className="bi bi-cloud-arrow-up me-2"></i>Lưu ảnh mới
                        </Button>
                    </Card>
                </Col> */}

                {/* Thông tin chi tiết */}
                <Col md={12}>
                    <Card className="p-1 shadow-sm border-0">
                        <h3 className="mb-4 fw-bold text-primary border-bottom pb-2">Thông tin cá nhân Học viên</h3>
                        <Form onSubmit={handleUpdateProfile}>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Label className="fw-bold small">Họ và tên</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={profile.full_name} 
                                        readOnly 
                                        className="bg-light text-muted border-0" 
                                        style={{cursor: 'not-allowed'}}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="fw-bold small">Email</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        value={profile.email} 
                                        readOnly 
                                        className="bg-light text-muted border-0"
                                        style={{cursor: 'not-allowed'}}
                                    />
                                </Col>
                            </Row>
                            
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Label className="fw-bold small">Số điện thoại</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Nhập số điện thoại"
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
                                        <option value="Lớp 1">Lớp 1</option>
                                        <option value="Lớp 2">Lớp 2</option>
                                        <option value="Lớp 3">Lớp 3</option>
                                        <option value="Lớp 4">Lớp 4</option>
                                        <option value="Lớp 5">Lớp 5</option>
                                        <option value="Lớp 6">Lớp 6</option>
                                        <option value="Lớp 7">Lớp 7</option>
                                        <option value="Lớp 8">Lớp 8</option>
                                        <option value="Lớp 9">Lớp 9</option>
                                        <option value="Lớp 10">Lớp 10</option>
                                        <option value="Lớp 11">Lớp 11</option>
                                        <option value="Lớp 12">Lớp 12</option>
                                        <option value="Luyện thi">Luyện thi</option>
                                    </Form.Select>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold small">Địa chỉ hiện tại</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3}
                                    placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                                    value={profile.address || ''} 
                                    onChange={(e) => setProfile({...profile, address: e.target.value})} 
                                />
                            </Form.Group>

                            <div className="text-center">
                                <Button type="submit" variant="success" className="px-5 py-2 fw-bold rounded-pill">
                                    <i className="bi bi-save me-2"></i>Lưu thay đổi
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StudentProfile;