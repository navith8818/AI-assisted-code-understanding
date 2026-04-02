import "./F_Section.css"
import Button from "../Shared/Button"
import ContentBox from "../Shared/ContentBox";
import BoxImg1 from "../../assets/Screenshot.png"

export default function F_Section(){
    return(
        <div className="F_container">
            <div className="flex_container">
                
                <ContentBox heading="Code Upload" span="Source" paragraph="Supports direct analysis 
                            of user uploaded source code, 
                            enabling visualization and comprehension" image={BoxImg1}/>
                <ContentBox heading="Code Upload" span="Source" paragraph="Supports direct analysis 
                            of user uploaded source code, 
                            enabling visualization and comprehension" image={BoxImg1}/>
                <ContentBox heading="Code Upload" span="Source" paragraph="Supports direct analysis 
                            of user uploaded source code, 
                            enabling visualization and comprehension" image={BoxImg1}/>
                <ContentBox heading="Code Upload" span="Source" paragraph="Supports direct analysis 
                            of user uploaded source code, 
                            enabling visualization and comprehension" image={BoxImg1}/>
                <ContentBox heading="Code Upload" span="Source" paragraph="Supports direct analysis 
                            of user uploaded source code, 
                            enabling visualization and comprehension" image={BoxImg1}/>
                <ContentBox heading="Code Upload" span="Source" paragraph="Supports direct analysis 
                            of user uploaded source code, 
                            enabling visualization and comprehension" image={BoxImg1}/>
                
                
            </div>
        </div>
    );
}