import { Link } from "react-router-dom";
import "../components_styles/Footer.css";
import logo from "../../sources/logo.svg";
import FacebookLogo from "../../assets/facebook-logo.svg";
import InstagramLogo from "../../assets/instagram-logo.svg";
import LinkedinLogo from "../../assets/linkedin.svg";
import XLogo from "../../assets/x-logo.svg";
import submit from "../../assets/send-mail.svg";

export default function Footer() {
  return (
    <div className="footer_outer_div">
        <div className="footer_inner_top">
            <div className="footer_inner_left">
                <img src={logo} alt="logo" />
                <p>The best platform for understanding code through intelligent visual graphs</p>
                <div className="socialMediaBlock">
                    <div className="facebook_rect">
                        <img src={FacebookLogo} alt="facebook logo" />
                    </div>
                    <div className="facebook_rect">
                        <img src={InstagramLogo} alt="facebook logo" />
                    </div>
                    <div className="facebook_rect">
                        <img src={LinkedinLogo} alt="facebook logo" />
                    </div>
                    <div className="facebook_rect">
                        <img src={XLogo} alt="facebook logo" />
                    </div>
                </div>
            </div>
            <div className="footer_inner_center">
                <h2>Pages</h2>
                <Link to="/Features">Features</Link>
                <Link to="/Services">Services</Link>
                <Link to="/Demos">Demos</Link>
                <Link to="/Help">Help</Link>
            </div>
            <div className="footer_inner_right">
                <h2>Newsletter</h2>
                <p>Get the news before everyone else does.</p>
                <div className="email_container">
                    <input type="email" placeholder="Your email address" />
                    <button><img src={submit} alt="submit" /></button>
                </div>
            </div>
        </div>
        <div className="footer_inner_bottom">
            <p>© 2024 All rights reserved.</p>
        </div>
     
    </div>
  );
}