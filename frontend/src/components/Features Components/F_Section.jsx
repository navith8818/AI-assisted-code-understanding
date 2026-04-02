import "./F_Section.css"
import Button from "../Shared/Button"
import ContentBox from "../Shared/ContentBox";
import BoxImg1 from "../../assets/Screenshot.png"

export default function F_Section(){
    return(
        <div className="F_container">
            <div className="flex_container">
                
                <ContentBox heading="Discovery" span="Requirement" paragraph="Enables semantic 
                            search of GitHub repositories based on requirements, allowing users to 
                            identify codebases." image={BoxImg1}/>

                <ContentBox heading="Extraction" span="Automated" paragraph="Analyzes source code using 
                            static program analysis to extract functions, classes, variables, and execution
                            flow." image={BoxImg1}/>

                <ContentBox heading="Visualization" span="Smart" paragraph="Adjusts detail based on zoom level,
                            presenting architecture views when zoomed out and function level detail."
                             image={BoxImg1}/>

                <ContentBox heading="Interaction" span="Dual-Pane" paragraph="Provides bidirectional synchronization 
                            between flowchart elements and source code, enabling users to trace logic." 
                            image={BoxImg1}/>

                <ContentBox heading="Reasoning" span="AI-Powered" paragraph="Integrates conversational AI that 
                            provides natural language explanations and targeted insights tied to specific code."   
                            image={BoxImg1}/>

                <ContentBox heading="Exploration" span="Guided" paragraph="Supports a guided walkthrough of 
                            program execution, enabling users to follow control flow paths for understanding." 
                            image={BoxImg1}/>
                
                
            </div>
        </div>
    );
}