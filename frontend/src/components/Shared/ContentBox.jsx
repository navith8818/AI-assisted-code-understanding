import "../components_styles/ContentBox.css"
export default function ContentBox({heading, span, paragraph, image}){
    return(
        <div className="box">
            <div className="text_box">
                <h2><span className="colored">{span}</span> {heading}</h2>
                <p>
                    {paragraph}
                </p>
                </div>
                <div className="img_box">
                <img src={image} alt="BoxImg1" />
            </div>
        </div>
    );
}