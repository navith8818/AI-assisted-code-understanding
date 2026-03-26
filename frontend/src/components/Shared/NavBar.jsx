import {Link,useLocation} from "react-router-dom"
import "../components_styles/NavBar.css"
export default function NavBar(){
    const location = useLocation();
    return (
        <nav className="navbar">
            <ul className="navbar-links">
                <li>
                    <Link to="/" className={location.pathname === "/Home" ? "active" : ""}>
                        Home
                    </Link>
                </li>
                <li>
                    <Link to="/Features" className={location.pathname === "/Features" ? "active" : ""}>
                        Features
                    </Link>
                </li>
                <li>
                    <Link to="/Demos" className={location.pathname === "/Demos" ? "active" : ""}>
                        Demos
                    </Link>
                </li>
                <li>
                    <Link to="/Help" className={location.pathname === "/Help" ? "active" : ""}>
                        Help
                    </Link>
                </li>
            </ul>
        </nav>
    )
}