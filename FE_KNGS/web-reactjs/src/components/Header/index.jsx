import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./header.scss";
import '../../pages/home/HomePage/home.scss';
import MenuHeader from "../MenuHeader";
function Header() {
    return (
        <>
            <nav className="navbar headercss navbar-expand-lg navbar-dark">
                <div className="container">
                    <Link className="navbar-brand" to="/" style={{color: '#0c024c'}}>
                        <img src="/image/logo_Htrang.png" alt="logo" />
                        HTrang
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <MenuHeader />
                </div>
            </nav>
        </>
    )
}

export default Header