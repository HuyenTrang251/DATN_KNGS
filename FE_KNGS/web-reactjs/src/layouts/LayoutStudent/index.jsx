import { useHideAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import HeaderAdmin from "../../components/Header/HeaderAdmin";
import { SidebarStudent } from "../../components/Sidebar/SidebarStudent";
import LayoutUser from "./../LayoutUser/index";
import { useLocation } from "react-router-dom";

function LayoutStudent() {
  const { setHideAuth } = useHideAuth();
  const location = useLocation();

  useEffect(() => {
    setHideAuth(true);
    sessionStorage.setItem('previousPage', location.pathname);
  }, [setHideAuth, location.pathname]);
  return <>
      <LayoutUser HeaderRole={HeaderAdmin} 
      SidebarRole={SidebarStudent} />;
  </>
}

export default LayoutStudent;
