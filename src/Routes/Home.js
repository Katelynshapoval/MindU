import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "../css/home.css";

function Home() {
  const articles = [
    {
      title: "Mental health of adolescents",
      description:
        "Learn about the mental health challenges faced by adolescents and ways to support them.",
      link: "https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health",
    },
    {
      title: "Body image",
      description:
        "Explore how body image affects mental well-being and self-esteem.",
      link: "https://www.mentalhealth.org.uk/explore-mental-health/articles/body-image-report-executive-summary",
    },
    {
      title: "Random acts of kindness",
      description:
        "Discover how small acts of kindness can positively impact mental health.",
      link: "https://www.mentalhealth.org.uk/explore-mental-health/kindness-and-mental-health/random-acts-kindness",
    },
    {
      title:
        "Ways to look after your mental health at times of political uncertainty",
      description:
        "Practical tips to maintain mental well-being during times of uncertainty.",
      link: "https://www.mentalhealth.org.uk/explore-mental-health/articles/ways-look-after-your-mental-health-times-political-uncertainty",
    },
    {
      title: "Ten top tips for good sleep",
      description: "Improve your sleep quality with these ten essential tips.",
      link: "https://www.mentalhealth.org.uk/explore-mental-health/articles/ten-top-tips-good-sleep",
    },
  ];

  return (
    <div className="home">
      <div id="headerHome">
        <img src="./images/logoWhite.png" alt="Logo" />
        <h1>EMPIEZA A CUIDAR TU SALUD MENTAL</h1>
        <p>
          Una aplicación innovadora que integra tecnología y psicología para
          proporcionar a los estudiantes recursos esenciales que les ayuden a
          gestionar el estrés, la ansiedad y otros desafíos emocionales.
        </p>
        <button id="homeButton">Comienza</button>
      </div>

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
          responsive={{
            all: { breakpoint: { max: 4000, min: 0 }, items: 3 },
          }}
        >
          {articles.map((article, index) => (
            <div key={index} className="article-card">
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <a href={article.link} target="_blank" rel="noopener noreferrer">
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
