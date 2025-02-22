import React, { useState, useEffect, useRef } from "react";
import "../css/support.css";
import { AiOutlineClose } from "react-icons/ai";
import { auth, db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function Support() {
  // Form state
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const user = auth.currentUser;

  // Problem dropdown state
  const [openIndex, setOpenIndex] = useState(null);
  const problemRefs = useRef([]);

  // Form data state
  const [formData, setFormData] = useState({
    email: user?.email || "",
    problem: "",
    photo: null,
    description: "",
  });

  // Problem list
  const problems = [
    {
      name: "No puedo usar el chat",
      description:
        "Debes iniciar sesión. Solo los usuarios registrados pueden usar el chat, comentar, dar 'me gusta' y agregar consejos.",
    },
    {
      name: "No puedo enviar el formulario de propuestas",
      description: "Lamentablemente, solo puedes enviarlo una vez.",
    },
    {
      name: "En el chat, quiero usar otro apodo",
      description:
        "Hay un campo en el chat donde puedes cambiarlo. Simplemente escribe tu nuevo apodo y presiona 'Enter'.",
    },
  ];

  // Toggle problem descriptions
  const toggleDescription = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (formRef.current && formRef.current.contains(event.target)) ||
        problemRefs.current.some((ref) => ref && ref.contains(event.target))
      ) {
        return;
      }
      setOpenIndex(null);
      setShowForm(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Por favor, sube solo imágenes (JPG, PNG, GIF, WEBP).");
      e.target.value = "";
      return;
    }
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "problems"), {
        email: formData.email,
        problem: formData.problem,
        description: formData.description,
        photo: formData.photo ? formData.photo.name : "",
        timestamp: serverTimestamp(),
        userId: user?.uid || "anonymous",
      });

      alert("Formulario enviado correctamente.");
      setShowForm(false);
      setFormData({
        email: user?.email || "",
        problem: "",
        photo: null,
        description: "",
      });
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      alert("Hubo un error al enviar el formulario.");
    }
  };

  return (
    <div className="support">
      <h1>¿NECESITAS AYUDA?</h1>
      <div className="typicalProblems">
        {problems.map((problem, index) => (
          <div key={index} className="typicalProblem">
            <p
              className="problemName"
              onClick={(e) => {
                e.stopPropagation();
                toggleDescription(index);
              }}
            >
              {problem.name}
            </p>
            <div
              ref={(el) => (problemRefs.current[index] = el)} // Attach ref to each problem
            >
              {openIndex === index && (
                <p className="problemDescription">{problem.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="formInitiation">
        <h2>¿NO ENCUENTRAS LO QUE BUSCAS?</h2>
        <button
          id="showFormButton"
          onClick={(e) => {
            e.stopPropagation(); // Prevents immediate form closure
            setShowForm(true);
          }}
        >
          Escríbenos
        </button>
        {showForm && (
          <form id="formReportProblem" onSubmit={handleSubmit} ref={formRef}>
            <div className="formHeader">
              <p>Formulario</p>
              <button
                id="closeForm"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForm(false);
                }}
              >
                <AiOutlineClose />
              </button>
            </div>
            <div className="field" style={{ display: "none" }}>
              <label htmlFor="email">Correo</label>
              <input
                id="email"
                placeholder="tucorreo@gmail.com"
                value={formData.email}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="field">
              <label htmlFor="problem">Problema</label>
              <input
                id="problem"
                maxLength={60}
                value={formData.problem}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="foto">Foto</label>
              <input
                id="foto"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div className="field">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={160}
                required
              />
            </div>
            <button type="submit" id="submitForm">
              Enviar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Support;
