import HeaderAdmin from "../../components/Header/HeaderAdmin";
import { SidebarStudent } from "../../components/Sidebar/SidebarStudent";
import LayoutUser from "./../LayoutUser/index";

function LayoutStudent() {
  return (
      <LayoutUser 
        HeaderRole={HeaderAdmin} 
        SidebarRole={SidebarStudent} 
      />
  );
}

export default LayoutStudent;



