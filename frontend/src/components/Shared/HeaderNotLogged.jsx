import { Link } from "react-router-dom";
import "../components_styles/HeaderNotLogged.css";
import logo from "../../sources/logo.svg";
import NavBar from "./NavBar";
import Login_button from "./login_button";
export default function HeaderNotLogged() {
  return (
    <div className="header_outer_div">
      <div className="logo_div">     
        <Link to="/Home">
          <img src={logo} alt="logo" />
        </Link>
      </div>
      <NavBar />
      <div className="header_button_div">
        <Login_button text="Log in" />
      </div>
    </div>
  );
}
