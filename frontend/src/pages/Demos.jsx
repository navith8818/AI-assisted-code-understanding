import Shared_Hero from "../components/Shared/Shared_Hero.jsx";
import HeaderNotLogged from "../components/Shared/HeaderNotLogged.jsx";
import D_Section from "../components/Demos Components/D_Section.jsx";
import Footer from "../components/Shared/Footer.jsx";
import DemoLeftCard from "../components/Demos Components/D_DemoLeftCard.jsx";
import DemoRightCard from "../components/Demos Components/D_DemoRightCard.jsx";
import BookLiveDemo from "../components/Demos Components/BookLiveDemo.jsx";
import ChatBot from "../components/ChatBot.jsx";
import GraphGenvid from "../assets/GraphGenvid.mp4";
import NodeSelectVid from "../assets/NodeSelectVid.mp4";
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
        span="Flowchart "
        heading=" Generation Guide"
        paragraph="This guide demonstrates how the platform automatically 
        generates flowcharts from uploaded code. It highlights the 
        process of analyzing source code, extracting key structures,
        and transforming them into clear, interactive visual 
        representations for easier understanding."
        myVideo={GraphGenvid}
      />

      <DemoRightCard
        span="Graph "
        heading=" Dependency Viewer"
        paragraph="This demonstration shows how users can 
        interact with the graph to explore dependencies 
        between different components. By clicking on nodes,
        the system highlights related functions, classes,
        and connections, enabling a clear understanding 
        of how different parts of the codebase are linked."
        myVideo={NodeSelectVid}
      />

      <BookLiveDemo />

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
