import React from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "../css/home.css";

function Home() {
  const navigate = useNavigate(); // Hook for navigation
  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 600 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 600, min: 0 },
      items: 1,
    },
  };
  const articles = [
    {
      title: "Ansiedad: Lo que usted debe saber",
      description:
        "Las experiencias negativas en la infancia y la historia familiar tal vez aumenten el riesgo.",
      link: "https://magazine.medlineplus.gov/es/art%C3%ADculo/ansiedad-lo-que-usted-debe-saber/",
    },
    {
      title: "No dormir",
      description:
        "Los lectores escriben sobre los problemas que causa la falta de sueño.",
      link: "https://elpais.com/opinion/2025-02-09/no-dormir.html",
    },
    {
      title: "El silencio mata: suicidio entre los adolescentes",
      description:
        "Los expertos coinciden en que las conductas suicidas y las autolesiones no son el problema.",
      link: "https://elpais.com/sociedad/2025-02-02/el-silencio-mata-como-y-por-que-hablar-del-suicidio-entre-los-adolescentes.html",
    },
    {
      title: "Hay algo peor que sentir emociones oscuras: evitarlas",
      description:
        "Priorizamos los acontecimientos negativos por encima de los positivos, lo cual parece… negativo.",
      link: "https://elpais.com/eps/2025-01-16/hay-algo-peor-que-sentir-emociones-oscuras-evitarlas.html",
    },
    {
      title: "Los contenidos negativos en redes",
      description:
        "Un nuevo estudio concluye que lo que perjudica la salud mental no es tanto el uso de internet como el tipo de información.",
      link: "https://elpais.com/tecnologia/2024-12-17/los-contenidos-negativos-en-redes-afectan-mas-a-las-personas-con-peor-salud-mental.html",
    },
  ];

  return (
    <div className="home">
      {/* Header Section */}
      <div id="headerHome">
        <img src="./images/logos/headWhiteTransparent.png" alt="Logo" />
        <h1>EMPIEZA A CUIDAR TU SALUD MENTAL</h1>
        <p>
          Una aplicación innovadora que integra tecnología y psicología para
          proporcionar a los estudiantes recursos esenciales que les ayuden a
          gestionar el estrés, la ansiedad y otros desafíos emocionales.
        </p>
        <button id="homeButton">
          <a id="functionalityLink" href="#howItWorks">
            Comienza
          </a>
        </button>
      </div>

      {/* How It Works Section */}
      <div id="howItWorks">
        <h2>¿Cómo funciona?</h2>
        <div className="features">
          <div className="feature-card chatCard">
            <img
              src="./images/functionality/chat.png"
              className="functionalityImage"
            />
            <div className="overlay">
              <h3>Chat Anónimo</h3>
              <p>Comparte tus pensamientos sin preocuparte por tu identidad.</p>
              <button
                className="redirectFunctionality"
                onClick={() => navigate("/chat")}
              >
                Ir al chat
              </button>
            </div>
          </div>
          <div className="feature-card tipsCard">
            <img
              src="./images/functionality/tips.jpg"
              className="functionalityImage"
            />
            <div className="overlay">
              <h3>Consejos de Bienestar</h3>
              <p>Descubre estrategias de profesionales y usuarios.</p>
              <button
                className="redirectFunctionality"
                onClick={() => navigate("/tips")}
              >
                Explorar consejos
              </button>
            </div>
          </div>
          <div className="feature-card aiCard">
            <img
              src="./images/functionality/assistant.png"
              className="functionalityImage"
            />
            <div className="overlay">
              <h3>Anima - Tu asistente IA</h3>
              <p>Habla con Anima y recibe apoyo de una IA amigable.</p>
              <button
                className="redirectFunctionality"
                onClick={() => navigate("/assistant")}
              >
                Hablar con IA
              </button>
            </div>
          </div>
          <div className="feature-card articlesCard">
            <img
              src="./images/functionality/articles.jpg"
              className="functionalityImage"
            />
            <div className="overlay">
              <h3>Artículos de Salud Mental</h3>
              <p>Aprende más sobre el bienestar emocional.</p>
              <button className="redirectFunctionality">
                <a id="articlesLink" href="#articlesContainer">
                  Ver artículos
                </a>
              </button>
            </div>
          </div>
          <div className="feature-card proposalsCard">
            <img
              src="./images/functionality/proposals.png"
              className="functionalityImage"
            />
            <div className="overlay">
              <h3>Mejora y Opinión</h3>
              <p>Comparte tus ideas y ayuda a generar cambios.</p>
              <button
                className="redirectFunctionality"
                onClick={() => navigate("/proposals")}
              >
                Responder preguntas
              </button>
            </div>
          </div>
        </div>
      </div>
      <hr id="homeHr" />
      {/* Articles Section */}
      <div id="articlesContainer">
        <h2>Estos artículos podrían interesarte</h2>

        <Carousel
          infinite
          autoPlay
          autoPlaySpeed={2000}
          keyBoardControl
          transitionDuration={500}
          containerClass="carousel-container"
          removeArrowOnDeviceType={["desktop"]}
          itemClass="carousel-item"
          showDots
          responsive={responsive}
        >
          {articles.map((article, index) => (
            <div key={index} className="article-card">
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <a
                className="readArticle"
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Leer más
              </a>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}

export default Home;
