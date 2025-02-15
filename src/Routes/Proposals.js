import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase/firebase"; // Firebase config
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore"; // Firestore methods
import { AiOutlineClose } from "react-icons/ai"; // Import close icon
import "../css/proposals.css";
import SentimentSchoolPieChart from "../components/SentimentSchoolPieChart"; // Import sentiment and school pie chart
import ResourcesBarChart from "../components/ResourcesBarChart"; // Import resources pie chart
import { fetchFeedbackData } from "../components/processData"; // import the fetch function

function Proposals() {
  const [schoolType, setSchoolType] = useState("");
  const [feedback, setFeedback] = useState("");
  const [resources, setResources] = useState([]);
  const [otherResources, setOtherResources] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [extraComments, setExtraComments] = useState("");
  const [error, setError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false); // Changed
  const [showForm, setShowForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState([]);
  const formRef = useRef(null);

  // Fetching data from Firebase
  // Fetching data from Firebase
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        // Get the collection "feedback" from Firestore
        const q = query(collection(db, "feedback"));
        const querySnapshot = await getDocs(q);

        // Store the fetched data in the state
        const data = querySnapshot.docs.map((doc) => doc.data());
        setFeedbackData(data);
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      }
    };

    fetchFeedbackData();
  }, []); // Empty dependency array to run only once on component mount

  const checkIfAlreadySubmitted = async () => {
    try {
      const userId = "unique_user_id"; // Use actual user identification (e.g., Firebase Auth ID)

      // Check if this user has ever submitted
      const q = query(
        collection(db, "feedback"),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setHasSubmitted(true); // User has already submitted
      }
    } catch (err) {
      console.error("Error checking submission: ", err);
    }
  };
  useEffect(() => {
    checkIfAlreadySubmitted();
  }, []); // Only check once on component mount

  const handleClickOutside = (event) => {
    if (formRef.current && !formRef.current.contains(event.target)) {
      setShowForm(false);
    }
  };

  useEffect(() => {
    if (showForm) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasSubmitted) {
      setError(
        "¡Ya has enviado una sugerencia previamente! No puedes enviarla nuevamente."
      );
      return;
    }

    if (!schoolType || !feedback || !sentiment) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      const userId = "unique_user_id"; // Replace with actual user ID

      await addDoc(collection(db, "feedback"), {
        schoolType,
        feedback,
        resources,
        otherResources,
        sentiment,
        extraComments,
        timestamp: serverTimestamp(),
        userId,
      });

      setSchoolType("");
      setFeedback("");
      setResources([]);
      setOtherResources("");
      setSentiment("");
      setExtraComments("");
      setError("");
      alert("¡Gracias por tus sugerencias!");
      setHasSubmitted(true);
      setShowForm(false); // Hide form after submission
    } catch (err) {
      console.error("Error al enviar la sugerencia: ", err);
      setError(
        "Hubo un error al enviar tu sugerencia. Intenta de nuevo más tarde."
      );
    }
  };

  return (
    <div className="proposals">
      <div className="descriptionProposals">
        <h1>Propuestas de Mejora </h1>
        <p>
          Comparte tus ideas para mejorar el bienestar emocional en distintos
          ámbitos. Tu voz puede marcar la diferencia.
        </p>
        {hasSubmitted ? (
          <p>
            ¡Ya has enviado una sugerencia previamente! No puedes enviarla
            nuevamente.
          </p>
        ) : (
          <button
            id="showFormButtonProposals"
            onClick={() => setShowForm(true)}
          >
            Enviar Sugerencia
          </button>
        )}
      </div>
      {showForm && !hasSubmitted && (
        <form ref={formRef} onSubmit={handleSubmit} className="proposalForm">
          {error && <p className="formError">{error}</p>}
          <div className="formHeader">
            <p>Formulario</p>
            <button
              className="closeButtonProposals"
              id="closeForm"
              onClick={() => setShowForm(false)}
            >
              <AiOutlineClose />
            </button>
          </div>
          <div className="formField">
            <label htmlFor="schoolType">
              ¿A qué tipo de institución asistes?
            </label>
            <select
              id="schoolType"
              value={schoolType}
              onChange={(e) => setSchoolType(e.target.value)}
              required
            >
              <option value="" disabled>
                Selecciona...
              </option>
              <option value="Secundaria">Secundaria</option>
              <option value="Bachillerato">Bachillerato</option>
              <option value="Universidad">Universidad</option>
              <option value="Formación técnica/profesional">
                Formación técnica/profesional
              </option>
            </select>
          </div>
          <div className="formField">
            <label htmlFor="feedback">
              ¿Qué mejorarías para hablar más sobre salud mental?
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="formField">
            <label>¿Qué recursos crees que necesitamos?</label>
            <div className="checkboxGroup">
              {[
                "Más talleres",
                "Acceso a profesionales",
                "Espacios seguros",
                "Material educativo",
                "Otro",
              ].map((resource) => (
                <div className="checkbox-wrapper-1" key={resource}>
                  <input
                    id={`checkbox-${resource}`}
                    type="checkbox"
                    value={resource}
                    className="substituted"
                    checked={resources.includes(resource)}
                    onChange={(e) =>
                      setResources(
                        e.target.checked
                          ? [...resources, resource]
                          : resources.filter((r) => r !== resource)
                      )
                    }
                    aria-hidden="true"
                  />
                  <label
                    className="checkboxLabel"
                    htmlFor={`checkbox-${resource}`}
                  >
                    {resource}
                  </label>
                </div>
              ))}
              {resources.includes("Otro") && (
                <input
                  type="text"
                  placeholder="Especifica"
                  value={otherResources}
                  onChange={(e) => setOtherResources(e.target.value)}
                  className="otherInput"
                />
              )}
            </div>
          </div>
          <div className="formField">
            <label htmlFor="sentiment">
              ¿Qué piensas sobre la concienciación de la salud mental en tu
              institución?
            </label>
            <select
              id="sentiment"
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value)}
              required
            >
              <option value="">Selecciona...</option>
              <option value="Malo">Malo</option>
              <option value="Regular">Regular</option>
              <option value="Bueno">Bueno</option>
              <option value="Excelente">Excelente</option>
            </select>
          </div>
          <div className="formField">
            <label htmlFor="extraComments">
              ¿Tienes algún comentario adicional?
            </label>
            <textarea
              id="extraComments"
              value={extraComments}
              onChange={(e) => setExtraComments(e.target.value)}
            ></textarea>
          </div>
          <button id="submitProposal" type="submit">
            Enviar
          </button>
        </form>
      )}
      {/* PieChart wrapped in a container with specific size */}
      {/* Render both pie charts */}
      <div className="chartsContainer">
        <div class="sentimentsContainer chartContainer">
          <div className="chartText">
            <h2>¿Cómo ven los estudiantes la salud mental?</h2>
            <p>
              Este gráfico muestra la distribución de respuestas por sentimiento
              y tipo de institución. Cada segmento representa un sentimiento, y
              nos ayuda a ver qué tipo de institución está asociado con cada
              uno.
            </p>
          </div>
          <div className="chart" id="sentimentsChart">
            <SentimentSchoolPieChart feedbackData={feedbackData} />
          </div>
        </div>
        <div class="resourcesContainer chartContainer">
          <div className="chartText">
            <h2>¿Qué apoyo necesitan los estudiantes?</h2>
            <p>
              Este gráfico muestra qué recursos para el bienestar estudiantil
              son más solicitados por los alumnos. Cada barra representa un
              recurso marcado en el formulario, ayudándonos a entender mejor qué
              apoyo necesitan los estudiantes.
            </p>
          </div>

          <div className="chart">
            <ResourcesBarChart feedbackData={feedbackData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Proposals;
