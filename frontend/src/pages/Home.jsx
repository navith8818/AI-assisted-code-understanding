import Hero from "../components/Home/Hero.jsx";
import Description from "../components/Home/Description.jsx";
import Explanation from "../components/Home/Explanation.jsx";
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
