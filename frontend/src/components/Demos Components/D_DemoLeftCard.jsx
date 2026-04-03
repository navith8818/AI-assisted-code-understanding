import "./D_DemoLeftCard.css"
import Button from "../Shared/Button"
export default function DemoLeftCard({span, heading, paragraph, myVideo}){
    return(
        <div className = "OuterContainer">
            <div className="inner_left_container">
                <h2><span>{span}</span> {heading}</h2>
                <p>{paragraph}</p>
                <Button
                          text={"Try out"}
                          
                        />
            </div>
            <div className="inner_right_container">
                <video width="100%" height="100%" autoPlay muted loop>
                    <source src={myVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
}