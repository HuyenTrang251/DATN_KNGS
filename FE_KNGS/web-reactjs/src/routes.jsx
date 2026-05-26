// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import LayoutDefault from "./layouts/LayoutDefault/index.jsx";
// // import LayoutAdmin from "./layouts/LayoutAdmin/index.js";
// // import LayoutTutor from "./layouts/LayoutTutor";
// // import LayoutStudent from "./layouts/LayoutStudent";

// import HomePage from "./pages/home/HomePage/index.jsx";
// import ListTutorPage from "./pages/home/ListTutorPage/index.jsx";
// import ListNewClassPage from "./pages/home/ListNewClassPage/index.jsx";

// import LoginPage from "./pages/auth/LoginPage/index.jsx";
// import SignupPage from "./pages/auth/SignupPage/index.jsx";

// // import StatisticsDashboard from "./pages/admin/Statistics";
// // import ManageUser from "./pages/admin/ManageUser";

// // import TutorProfile from "./pages/tutor/TutorProfile";

// // import StudentProfile from "./pages/student/StudentProfile";

// // import Error404 from "./pages/Error404";

// const routes = [
//   {
//     path: "/",
//     element: <LayoutDefault />,
//     children: [
//       { index: true, element: <HomePage /> },
//       { path: "tutors", element: <ListTutorPage /> },
//       { path: "classes", element: <ListNewClassPage /> }
//     ]
//   },

//   { path: "/login", element: <LoginPage /> },
//   { path: "/signup", element: <SignupPage /> },

//   // {
//   //   path: "/admin",
//   //   element: <LayoutAdmin />,
//   //   children: [
//   //     { index: true, element: <StatisticsDashboard /> },
//   //     { path: "users", element: <ManageUser /> }
//   //   ]
//   // },

//   // {
//   //   path: "/tutor",
//   //   element: <LayoutTutor />,
//   //   children: [
//   //     { index: true, element: <TutorProfile /> }
//   //   ]
//   // },

//   // {
//   //   path: "/student",
//   //   element: <LayoutStudent />,
//   //   children: [
//   //     { index: true, element: <StudentProfile /> }
//   //   ]
//   // },

//   // { path: "*", element: <Error404 /> }
// ];

// function renderRoutes(routes) {
//   return routes.map((route, index) => {
//     if (route.children) {
//       return (
//         <Route key={index} path={route.path} element={route.element}>
//           {renderRoutes(route.children)}
//         </Route>
//       );
//     }

//     if (route.index) {
//       return <Route key={index} index element={route.element} />;
//     }

//     return <Route key={index} path={route.path} element={route.element} />;
//   });
// }

// function Router() {
//   return (
//     <Routes>
//       {renderRoutes(routes)}
//     </Routes>
//   );
// }

// export default Router;

// import { Routes, Route } from "react-router-dom";

// import LayoutDefault from "./layouts/LayoutDefault";

// import HomePage from "./pages/home/HomePage";
// import ListTutorPage from "./pages/home/ListTutorPage";
// import ListNewClassPage from "./pages/home/ListNewClassPage";

// import LoginPage from "./pages/auth/LoginPage";
// import SignupPage from "./pages/auth/SignupPage";

// function AppRoutes() {
//   return (
//     <Routes>

//       {/* Layout cho trang public */}
//       <Route path="/" element={<LayoutDefault />}>

//         <Route index element={<HomePage />} />

//         <Route path="danh-sach-gia-su" element={<ListTutorPage />} />

//         <Route path="danh-sach-lop-moi" element={<ListNewClassPage />} />

//       </Route>

//       {/* Auth */}
//       <Route path="dang-nhap" element={<LoginPage />} />

//       <Route path="dang-ki" element={<SignupPage />} />

//     </Routes>
//   );
// }

// export default AppRoutes;

import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import LayoutDefault from "./layouts/LayoutDefault";
import LayoutAdmin from "./layouts/LayoutAdmin"; // Giả định đường dẫn
import LayoutStudent from "./layouts/LayoutStudent"; // Giả định đường dẫn
import LayoutTutor from "./layouts/LayoutTutor"; // Giả định đường dẫn

// Public Pages
import HomePage from "./pages/home/HomePage";
import ListTutorPage from "./pages/home/ListTutorPage";
import ListNewClassPage from "./pages/home/ListNewClassPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentCancel from "./pages/payment/PaymentCancel";

// Admin
import Dashboard from "./pages/admin/Dashboard";
import StudentManagement from "./pages/admin/StudentManagement";
import TutorManagement from "./pages/admin/TutorManagement";
import PostManagement from "./pages/admin/PostManagement";
import BookingManagement from "./pages/admin/BookingManagement";
import ClassManagement from "./pages/admin/ClassManagement";

// Tutor
import ManageApplications from "./pages/tutor/ManageApplications";
import ManageBookingsT from "./pages/tutor/ManageBookings";
import ConnectedClassesT from "./pages/tutor/ConnectedClasses";
import Profile from "./pages/tutor/Profile";

// Student
import CreatePost from "./pages/student/CreatePost";
import ManageBookingsS from "./pages/student/ManageBookings";
import ManagePosts from "./pages/student/ManagePosts";
import ConnectedClassesS from "./pages/student/ConnectedClasses";
import ProfileS from "./pages/student/Profile";




// Bạn cần tạo/import thêm các component con ở đây để nó hiển thị nội dung
// Ví dụ: import ManageUser from "./pages/admin/ManageUser";

function AppRoutes() {
  return (
    <Routes>
      {/* 1. ROUTES CHO KHÁCH (PUBLIC) */}
      <Route path="/" element={<LayoutDefault />}>
        <Route index element={<HomePage />} />
        <Route path="danh-sach-gia-su" element={<ListTutorPage />} />
        <Route path="danh-sach-lop-moi" element={<ListNewClassPage />} />
      </Route>

      {/* 2. ROUTES CHO ADMIN */}
      <Route path="/admin" element={<LayoutAdmin />}>
        {/* Các đường dẫn phải khớp với SidebarAdmin.jsx */}
        <Route index element={<Navigate to="tong-quan" replace />} />
        <Route path="quan-ly-hoc-vien" element={<StudentManagement />} />
        <Route path="quan-ly-gia-su" element={<TutorManagement />} />
        <Route path="quan-ly-nhan-vien" element={<div>Trang Quản lý nhân viên</div>} />
        <Route path="quan-ly-bai-dang" element={<PostManagement />} />
        <Route path="quan-ly-dat-lich" element={<BookingManagement />} />
        <Route path="quan-ly-lop" element={<ClassManagement />} />
        <Route path="tong-quan" element={<Dashboard />} />
      </Route>

      {/* 3. ROUTES CHO HỌC VIÊN (STUDENT) */}
      <Route path="/student" element={<LayoutStudent />}>
        {/* Các đường dẫn phải khớp với SidebarStudent.jsx */}
        <Route index element={<Navigate to="quan-ly-bai-dang" replace />} />
        <Route path="dang-bai" element={<CreatePost />} />
        <Route path="quan-ly-bai-dang" element={<ManagePosts />} />
        <Route path="quan-ly-dat-lich" element={<ManageBookingsS />} />
        <Route path="quan-ly-lop" element={<ConnectedClassesS />} />
        <Route path="thong-tin-ca-nhan" element={<ProfileS />} />
      </Route>

      {/* 4. ROUTES CHO GIA SÆ¯ (TUTOR) */}
      <Route path="/tutor" element={<LayoutTutor />}>
        {/* Các đường dẫn phải khớp với SidebarTutor.jsx */}
        <Route index element={<Navigate to="quan-ly-nhan-lop" replace />} />
        <Route path="thong-tin-dat-lich" element={<ManageBookingsT />} />
        <Route path="quan-ly-nhan-lop" element={<ManageApplications />} />
        <Route path="quan-ly-lop" element={< ConnectedClassesT />} />
        <Route path="thong-tin-ca-nhan" element={<Profile />} />
      </Route>

      {/* 5. AUTH ROUTES */}
      <Route path="dang-nhap" element={<LoginPage />} />
      <Route path="dang-ki" element={<SignupPage />} />
      <Route path="đăng-nhap" element={<Navigate to="/dang-nhap" replace />} />
      <Route path="đăng-ki" element={<Navigate to="/dang-ki" replace />} />
      <Route path="payment-success" element={<PaymentSuccess />} />
      <Route path="payment-cancel" element={<PaymentCancel />} />

    </Routes>
  );
}

export default AppRoutes;



