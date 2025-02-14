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
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
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

  const checkIfSubmittedToday = async () => {
    try {
      const userId = "unique_user_id"; // Replace with actual user identification
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, "feedback"),
        where("timestamp", ">=", todayStart),
        where("timestamp", "<=", todayEnd),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setHasSubmittedToday(true);
      }
    } catch (err) {
      console.error("Error checking submission: ", err);
    }
  };

  useEffect(() => {
    checkIfSubmittedToday();
  }, []);

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

    if (hasSubmittedToday) {
      setError(
        "¡Ya has enviado un formulario hoy! Solo se permite uno por día."
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
      setHasSubmittedToday(true);
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
      <h2>Propuestas de Mejora </h2>
      <p>
        Comparte tus ideas para mejorar el bienestar emocional en distintos
        ámbitos. Tu voz puede marcar la diferencia.
      </p>

      {/* PieChart wrapped in a container with specific size */}
      {/* Render both pie charts */}
      <div className="chartsContainer">
        <p>hola</p>
        <div class="sentimentsContainer chartContainer">
          <div className="chart" id="sentimentsChart">
            <SentimentSchoolPieChart feedbackData={feedbackData} />
          </div>
        </div>
        <div class="resourcesContainer chartContainer">
          <p>hola</p>

          <div className="chart">
            <ResourcesBarChart feedbackData={feedbackData} />
          </div>
        </div>
      </div>

      {!showForm ? (
        hasSubmittedToday ? (
          <p>✅ ¡Ya enviaste una sugerencia hoy! Vuelve mañana.</p>
        ) : (
          <button
            id="showFormButtonProposals"
            onClick={() => setShowForm(true)}
          >
            Enviar Sugerencia
          </button>
        )
      ) : (
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
    </div>
  );
}

export default Proposals;
