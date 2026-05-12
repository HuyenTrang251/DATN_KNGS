import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import HeaderAdmin from "../../components/Header/HeaderAdmin";
import SidebarAdmin from "../../components/Sidebar/SidebarAdmin";
import "./LayoutAdmin.scss";

const MOBILE_BREAKPOINT = 992;

const getIsMobileViewport = () =>
    typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;

function LayoutAdmin() {
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
        if (location.pathname.startsWith("/admin")) {
            sessionStorage.setItem("lastAccountPath", location.pathname);
        }
    }, [location.pathname]);

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };
    return (
        <>
        <div className="admin-layout">
        <HeaderAdmin
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
        />
        <div className="admin-content">
            <SidebarAdmin isOpen={isSidebarOpen} />
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
    )
}
export default LayoutAdmin