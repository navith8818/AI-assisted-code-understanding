import "../components_styles/Shared_Hero.css";
import Hexagon from "../Home Components/Hexagon.jsx";
export default function Shared_Hero({heading, paragraph}) {
  return (
    <div className="home_hero_main">
      <div className="hero_main_left">
        <h1>{heading}</h1>
        <p>
          {paragraph}
        </p>
      </div>
      <div className="hero_main_right">
        <Hexagon />
      </div>
    </div>
  );
}
