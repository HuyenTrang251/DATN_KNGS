import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "../LayoutAdmin/LayoutAdmin.scss"; 
import Sidebar from "../../components/Sidebar";

const MOBILE_BREAKPOINT = 992;

const getIsMobileViewport = () =>
  typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;

function LayoutUser({ HeaderRole, SidebarRole }) {
  const [isMobile, setIsMobile] = useState(getIsMobileViewport);
  const [isSidebarOpen, setSidebarOpen] = useState(() => !getIsMobileViewport());
  const location = useLocation();
  const previousIsMobileRef = useRef(getIsMobileViewport());

  useEffect(() => {
    const handleResize = () => {
      const mobile = getIsMobileViewport();
      setIsMobile(mobile);
      setSidebarOpen((prev) => {
        if (previousIsMobileRef.current !== mobile) {
          return !mobile;
        }

        return prev;
      });
      previousIsMobileRef.current = mobile;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, location.pathname]);

  useEffect(() => {
    if (location.pathname.startsWith("/tutor") || location.pathname.startsWith("/student")) {
      sessionStorage.setItem("lastAccountPath", location.pathname);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <>
      <div className="admin-layout">
        <HeaderRole
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <div className="admin-content">
        <Sidebar isOpen={isSidebarOpen} menuItems={SidebarRole} />
          {isMobile && (
            <button
              type="button"
              className={`layout-overlay ${isSidebarOpen ? "show" : ""}`}
              onClick={() => setSidebarOpen(false)}
              aria-label="Đóng menu"
            />
          )}
          <div
            className={`main-content ${
              isSidebarOpen ? "with-sidebar" : "full-width"
            }`}
            >
            {console.log("Outlet Rendered")}
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default LayoutUser;


