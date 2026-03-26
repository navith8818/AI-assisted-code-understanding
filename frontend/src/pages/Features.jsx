import Hero from "../components/Home/Hero.jsx";
import HeaderNotLogged from "../components/Shared/HeaderNotLogged.jsx";
export default function Features(){
    return (
        <main style ={styles.container}>
            <Hero/>
            <HeaderNotLogged />
        
        </main>
    )
}

const styles = {
    container: {
        background : "#121214", 
    }
}