import Shared_Hero from "../components/Shared/Shared_Hero.jsx";
import H_Section from "../components/Help Components/H_Section.jsx";
import HeaderNotLogged from "../components/Shared/HeaderNotLogged.jsx";
import Footer from "../components/Shared/Footer.jsx";
import ChatBot from "../components/ChatBot.jsx";
export default function Help() {
  return (
    <main style={styles.container}>
      <HeaderNotLogged />
      <Shared_Hero
        heading="Help"
        paragraph="Learn how to upload code, 
        navigate visualizations, and explore 
        program logic step by step. This guide 
        walks you through using the platform 
        effectively to analyze, trace, and understand 
        your codebase with ease."
      />
      <H_Section />
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
