import Shared_Hero from "../components/Shared/Shared_Hero.jsx";
import HeaderNotLogged from "../components/Shared/HeaderNotLogged.jsx";
import D_Section from "../components/Demos Components/D_Section.jsx";
import Footer from "../components/Shared/Footer.jsx";
import DemoLeftCard from "../components/Demos Components/D_DemoLeftCard.jsx";
import DemoRightCard from "../components/Demos Components/D_DemoRightCard.jsx";
import ChatBot from "../components/ChatBot.jsx";
import video from "../assets/testVid.mp4"
export default function Demos() {
  return (
    <main style={styles.container}>
      <HeaderNotLogged />
      <Shared_Hero
        heading="Demos"
        paragraph="Explore real examples of code transformed 
                into interactive visualizations. See how complex logic 
                becomes clear through synchronized flowcharts, guided 
                tracing, and intelligent analysis in action."
      />
      <DemoLeftCard
        span="Interactive"
        heading=" Flowchart Demo"
        paragraph="Upload your codebase and generate an interactive flowchart in a single click. 
                  This demo shows how the platform instantly analyzes your code and transforms it into a clear
                  , visual representation for easy understanding" 
        myVideo={video}
      />
      
      <DemoRightCard
        span="Interactive"
        heading=" Flowchart Demo"
        paragraph="Upload your codebase and generate an interactive flowchart in a single click. 
                  This demo shows how the platform instantly analyzes your code and transforms it into a clear
                  , visual representation for easy understanding" 
        myVideo={video}
      />
      
      {/* <D_Section /> */}
      <ChatBot />
      <Footer />
    </main>
  );
}

const styles = {
  container: {
    background: "#121214",
  },
};
