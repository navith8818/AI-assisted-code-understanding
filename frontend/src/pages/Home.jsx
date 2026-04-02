import Hero from "../components/Home Components/Hero.jsx";
import Description from "../components/Home Components/Description.jsx";
import Explanation from "../components/Home Components/Explanation.jsx";
import Footer from "../components/Shared/Footer.jsx";
import HeaderNotLogged from "../components/Shared/HeaderNotLogged.jsx";
export default function Home() {
  return (
    <main style={styles.container}>
      <HeaderNotLogged />
      <Hero />
      <Description />
      <Explanation />
      <Footer />
    </main>
  );
}

const styles = {
  container: {
    background: "#121214",
  },
};
