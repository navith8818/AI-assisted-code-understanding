
import "../components_styles/Button.css";

export default function Button({ text, onClick }) {
    return (
        <button className="Button" onClick={onClick}>
            {text}
        </button>
    );
}



