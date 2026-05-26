// import { Outlet, useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";
// import HeaderAdmin from "../HeaderAdmin";
// import {SidebarAdmin} from "../SidebarAdmin";
// import "./LayoutAdmin.scss";
// import Sidebar from "../../Sidebar";

// function LayoutTutor() {
//     const [isSidebarOpen, setSidebarOpen] = useState(true);
//     const location = useLocation();

//     useEffect(() => {
//     }, [location]);

//     const toggleSidebar = () => {
//         setSidebarOpen((prev) => !prev);
//     };
//     return (
//         <>
//         <div className="admin-layout">
//         <HeaderAdmin
//             toggleSidebar={toggleSidebar}
//             isSidebarOpen={isSidebarOpen}
//         />
//         <div className="admin-content">
//         <Sidebar isOpen={isSidebarOpen} menuItems={SidebarAdmin} />
//             <div
//             className={`main-content ${
//                 isSidebarOpen ? "with-sidebar" : "full-width"
//             }`}
//             >
//             {console.log("Outlet Rendered")}
//             <Outlet />
//             </div>
//         </div>
//         </div>
//         </>
//     )
// }
// export default LayoutTutor

// import { useHideAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import HeaderAdmin from "../../components/Header/HeaderAdmin";
import { SidebarTutor } from "../../components/Sidebar/SidebarTutor";
import LayoutUser from "./../LayoutUser/index";
import { useLocation } from "react-router-dom";

function LayoutTutor() {
  // const { setHideAuth } = useHideAuth();
  // const location = useLocation();
  // useEffect(() => {
  //   setHideAuth(true);
  //     // return () => {
  //     //   setHideAuth(false); 
  //     // };
  //   sessionStorage.setItem('previousPage', location.pathname)
  // }, [setHideAuth, location.pathname]);
  return <
  LayoutUser HeaderRole={HeaderAdmin} 
  SidebarRole={SidebarTutor} />;
}

export default LayoutTutor;



