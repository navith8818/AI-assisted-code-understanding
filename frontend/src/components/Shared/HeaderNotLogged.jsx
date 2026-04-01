import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link} from "react-router-dom";
import "../components_styles/HeaderNotLogged.css";
import logo from "../../sources/logo.svg";
import NavBar from "./NavBar";
import Login_button from "./login_button";
export default function HeaderNotLogged() {

  const navigate  = useNavigate();
  const location  = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");

  const isLoginPage = location.pathname === "/Login";
  const isRegisterPage = location.pathname === "/register";

  return (
    <div className="header_outer_div">
      <div className="logo_div">     
        <Link to="/Home">
          <img src={logo} alt="logo" />
        </Link>
      </div>
      <NavBar />
      <div className="header_button_div">

        {isLoggedIn ? (
          <Link to="/Dashboard">
            <Login_button text="Dashboard" />
          </Link>
        ) : (
          isLoginPage ? (
              <Link to="/Register">
              <Login_button text="Register" />
              </Link>
          ):(
            <Link to="/Login">
            <Login_button text="Log in" />
            </Link>
          )
        )}
        
      </div>
    </div>
  );
}
