import Shared_Hero from "../components/Shared/Shared_Hero.jsx";
import F_Section from "../components/Features Components/F_Section.jsx";
import Footer from "../components/Shared/Footer.jsx";
import HeaderNotLogged from "../components/Shared/HeaderNotLogged.jsx";
import ChatBot from "../components/ChatBot.jsx";

export default function Features() {
  return (
    <main style={styles.container}>
      <HeaderNotLogged />
      <Shared_Hero
        heading="Features"
        paragraph="Instantly understand any codebase with interactive visualizations.
          Explore functions, classes, and dependencies through synchronized
          flowcharts and source code."
      />
      <F_Section />
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
