
import "../components_styles/Login_button.css";

export default function Login_button({ text, onClick }) {
    return (
        <button className="Login_button" onClick={onClick}>
            {text}
        </button>
    );
}



