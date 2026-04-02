import "./Explanation.css";
import exp_filler from "../../assets/exp-filler.png"
import ellips_1 from "../../assets/ellips 1.svg"
import ellips_2 from "../../assets/ellips 2.svg"
import icon_programming from "../../assets/icons-programming.svg"
import icon_analysis from "../../assets/icons-analysis.svg"
import icon_chart from "../../assets/icons-chart.svg"
import icon_robot from "../../assets/icons-robot.svg"

export default function Explanation(){
    return (
        <div className="exp_main">
            <div className="exp_left">
                <div className="exp_header">
                    <h2>How Understanding Happens</h2>
                </div>
                <div className="exp_rect_container">
                    <div className="exp_rect">
                        <div className="rect_left">
                            <h3>Describe your requirements or upload code</h3>
                            <p>
                                Provide high level goals or upload your project. 
                                The system accepts real codebases, private or 
                                public, with no setup.
                            </p>
                        </div>
                        <div className="rect_right">
                            <img src={icon_programming} alt="icon_programming" />
                        </div>
                    </div>
                    <div className="exp_rect">
                        <div className="rect_left">
                            <h3>We analyze structure and execution</h3>
                            <p>
                                We automatically extract functions, dependencies, and control flow to build a reliable program level understanding.
                            </p>
                        </div>
                        <div className="rect_right">
                            <img src={icon_analysis} alt="icon_analysis" />
                        </div>
                    </div>
                    <div className="exp_rect">
                        <div className="rect_left">
                            <h3>Generate interactive diagrams</h3>
                            <p>
                                The system converts analysis into scalable visual diagrams, letting you zoom, expand, and explore complex logic easily.
                            </p>
                        </div>
                        <div className="rect_right">
                            <img src={icon_chart} alt="icon_chart" />
                        </div>
                    </div>
                    <div className="exp_rect">
                        <div className="rect_left">
                            <h3>Explore with AI guidance</h3>
                            <p>
                                Ask questions and receive targeted explanations linked directly to relevant code regions and diagrams.
                            </p>
                        </div>
                        <div className="rect_right">
                            <img src={icon_robot} alt="icon_robot" />
                        </div>
                    </div>      
                </div>
            </div>
            <div className="exp_right">
                <div className="image_box">
                    <img src={exp_filler} alt="exp_filler" className="main_img" />
                    <img src={ellips_1} alt="exp_filler" className="ellips1"/>
                    <img src={ellips_2} alt="exp_filler" className="ellips2"/>
                </div>
            </div>
        </div>
    );
}