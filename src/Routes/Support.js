import React, { useState, useEffect, useRef } from "react";
import "../css/support.css";
import { AiOutlineClose } from "react-icons/ai";
import { auth, db } from "../firebase/firebase"; // Import Firestore
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function Support() {
  const [openIndex, setOpenIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null); // Reference for the form

  const user = auth.currentUser;
  const [formData, setFormData] = useState({
    email: user?.email || "",
    problem: "",
    foto: null,
    description: "",
  });

  const problems = [
    {
      name: "Problem 1",
      description: "This is the description for problem 1.",
    },
    {
      name: "Problem 2",
      description: "This is the description for problem 2.",
    },
    {
      name: "Problem 3",
      description: "This is the description for problem 3.",
    },
  ];

  const toggleDescription = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleClickOutside = (event) => {
    if (formRef.current && formRef.current.contains(event.target)) {
      return; // Prevents closing when clicking inside the form
    }
    setShowForm(false);
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle file input separately
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, foto: file }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "problems"), {
        email: formData.email,
        problem: formData.problem,
        description: formData.description,
        foto: formData.foto ? formData.foto.name : "", // Just storing the filename for now
        timestamp: serverTimestamp(),
        userId: user?.uid || "anonymous",
      });

      alert("Problema enviado correctamente.");
      setShowForm(false);
      setFormData({
        email: user?.email || "",
        problem: "",
        foto: null,
        description: "",
      });
    } catch (error) {
      console.error("Error al enviar el problema:", error);
      alert("Hubo un error al enviar el problema.");
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
            {openIndex === index && (
              <p className="problemDescription">{problem.description}</p>
            )}
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
          <div ref={formRef}>
            <form id="formReportProblem" onSubmit={handleSubmit}>
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
              <div className="field">
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
                  value={formData.problem}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="foto">Foto</label>
                <input id="foto" type="file" onChange={handleFileChange} />
              </div>
              <div className="field">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" id="submitForm">
                Enviar
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Support;
