import "./D_DemoLeftCard.css"
import { Link } from "react-router-dom";
import Button from "../Shared/Button"
export default function DemoLeftCard({span, heading, paragraph, myVideo}){
    return(
        <div className = "OuterContainer">
            <div className="inner_left_container">
                <h2><span>{span}</span> {heading}</h2>
                <p>{paragraph}</p>
                <Link to = "/Dashboard" >
                <Button text={"Try out"} />
                </ Link>
            </div>
            <div className="DL_inner_right_container">
                <video width="100%" height="100%" autoPlay muted loop>
                    <source src={myVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
}