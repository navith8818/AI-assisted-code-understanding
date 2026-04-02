import "./Hero.css";
import Hexagon from "./Hexagon.jsx";
import UploadBox from "./UploadBox.jsx";
export default function Hero(){
    return (
        <div className="home_hero_main">
            <div className="home_hero_main_left">
                <h1>Understand <br />Any Codebase <br /> Visually</h1>
                <p>
                    Explore program structure, control flow, 
                    and dependencies through interactive 
                    diagrams and AI-powered explanations.
                </p>
            </div>
            <div className="home_hero_main_right">
                <Hexagon/>
                <UploadBox/>
            </div>
        </div>
    );
}