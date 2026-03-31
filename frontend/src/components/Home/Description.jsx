import "./Description.css";
import card1 from "../../assets/card1.avif"
import clock_icon from "../../assets/icons-clock.svg"
import grid_iyem from "../../assets/grid-item.avif"
import icons_dependencies from "../../assets/icons-dependencies.svg"
import card2 from "../../assets/card 2.avif"
import card3 from "../../assets/card 3.avif"

export default function Description(){
    return (
        <div className="des_main">
            <div className="des_header">
                <h2>Why Understanding Code Is Hard</h2>
            </div>
            <div className="des_inner">
                <div className="des_inner_top">
                    <div className="des_inner_top_left">
                        <div className="img_box">
                            <img src={card1} alt="card1" />
                        </div>
                        <div className="text_box">
                            <h5>THE MAIN PROBLEM </h5>
                            <h3>Large codebases with no documentation</h3>
                            <p>Large codebases often lack clear documentation, 
                                making it difficult to understand structure, 
                                intent, and execution flow especially for new 
                                contributors or inherited projects.
                            </p>
                            <div className="light_box">
                                <img src={clock_icon} alt="clock icon" />
                                <p>Understanding Code Takes Too Long</p>
                            </div>
                        </div>
                    </div>
                    <div className="des_inner_top_right">
                        <div className="des_inner_top_right_top">
                            <img src={grid_iyem} alt="grid_iyem" />
                            <div className="text_box">
                                <h5>DEVELOPER PAIN POINT</h5>
                                <h3>Unclear and Uncoordinated Execution Flow</h3>
                            </div>
                        </div>
                        <div className="des_inner_top_right_bottom">
                            <img src={icons_dependencies} alt="icons_dependencies" />
                            <div className="text_box">
                                <h5>CHALLENGE</h5>
                                <h3>Hidden and Implicit Dependencies</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="inner_bottom">
                    <div className="inner_bottom_left">
                        <div className="image_box">
                            <img src={card2} alt="card2" />
                        </div>
                        <div className="text_box">
                            <h5>THE MAIN PROBLEM </h5>
                            <h3>Code Navigation Becomes Overwhelming</h3>
                            <p>
                                As projects grow, understanding which functions, 
                                classes, or modules interact becomes difficult, 
                                leaving developers lost in hundreds or thousands 
                                of lines of code.
                            </p>
                        </div>                       
                    </div>
                    <div className="inner_bottom_right">
                        <div className="image_box">
                            <img src={card3} alt="card3"/>
                        </div>
                        <div className="text_box">
                            <h5>WASTED ENGINEERING TIME</h5>
                            <h3>Too Much Time Spent Onboarding and Debugging</h3>
                            <p>
                                New developers spend more time understanding existing 
                                code than writing it. Without clear execution flow and 
                                dependency visibility, onboarding slows and debugging 
                                becomes trial and error.
                            </p>
                        </div>
                    </div>
                </div>
            </div>  
        </div>
    );
}