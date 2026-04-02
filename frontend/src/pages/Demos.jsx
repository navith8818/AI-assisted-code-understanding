import Shared_Hero from "../components/Shared/Shared_Hero.jsx";
import HeaderNotLogged from "../components/Shared/HeaderNotLogged.jsx";
import D_Section from "../components/Demos Components/D_Section.jsx";
import Footer from "../components/Shared/Footer.jsx";
import ChatBot from "../components/ChatBot.jsx";
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
        <D_Section />
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
