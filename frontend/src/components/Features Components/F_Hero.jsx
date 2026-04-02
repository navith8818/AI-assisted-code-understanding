import "./F_Hero.css";
import Hexagon from "../Home Components/Hexagon.jsx";
export default function F_Hero() {
  return (
    <div className="home_hero_main">
      <div className="hero_main_left">
        <h1>Features</h1>
        <p>
          Instantly understand any codebase with interactive visualizations.
          Explore functions, classes, and dependencies through synchronized
          flowcharts and source code.
        </p>
      </div>
      <div className="hero_main_right">
        <Hexagon />
      </div>
    </div>
  );
}
