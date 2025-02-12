import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { MdEdit, MdDelete, MdComment } from "react-icons/md";
import "../css/tips.css";
import Comments from "./TipsComments";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";
import { Timestamp } from "firebase/firestore";

function Tips() {
  const [uid, setUid] = useState(null);
  const [tips, setTips] = useState([]);
  const [showProTips, setShowProTips] = useState(false);
  const [showUserTips, setShowUserTips] = useState(false);
  const [newTip, setNewTip] = useState({
    Name: "",
    Description: "",
    Creator: "",
  });
  const [editingTipId, setEditingTipId] = useState(null);
  const [openedComment, setOpenedComment] = useState(null);
  const professionalTips = [
    {
      Name: "Snacks de movimiento",
      Description:
        "Cada 20-30 minutos, levántate y haz un movimiento: camina, estira o haz una sentadilla para activar el cuerpo.",
      id: 1,
    },
    {
      Name: "Actividad física",
      Description:
        "Prioriza el ejercicio, incluso en épocas de exámenes, para oxigenar el cerebro y reducir el estrés.",
      id: 2,
    },
    {
      Name: "⁠Higiene postural",
      Description:
        "Evita mantener la misma postura por mucho tiempo. Cambia de posición regularmente.",
      id: 3,
    },
    {
      Name: "Ergonomía ",
      Description:
        "Ajusta tu espacio de trabajo: silla, teclado y pantalla deben estar alineados para evitar lesiones.",
      id: 4,
    },
    {
      Name: "⁠Higiene del sueño",
      Description:
        "Respeta tus horas de descanso para mejorar la retención y permitir que el cuerpo se recupere.",
      id: 5,
    },
  ];

  // Authentication state
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUid(user ? user.uid : null);
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch tips
  useEffect(() => {
    const q = query(collection(db, "tips"), orderBy("createdAt", "desc")); // Order by createdAt in descending order

    const unsubscribeTips = onSnapshot(
      q,
      (querySnapshot) => {
        const tipsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTips(tipsList);
      },
      (error) => {
        console.error("Error fetching tips:", error);
      }
    );

    return () => unsubscribeTips();
  }, []);

  // Handle tip input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTip((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add or update tip
  const handleAddOrUpdateTip = async (e) => {
    e.preventDefault();
    if (!newTip.Name || !newTip.Description) {
      alert("Por favor, rellena todos los campos.");
      return;
    }

    const now = Timestamp.now();
    const twentyFourHoursAgo = new Timestamp(
      now.seconds - 24 * 60 * 60,
      now.nanoseconds
    );

    try {
      if (editingTipId) {
        await updateDoc(doc(db, "tips", editingTipId), {
          ...newTip,
          Creator: uid,
        });
        setEditingTipId(null);
      } else {
        // Get user's tips from the last 24 hours
        const userTipsQuery = query(
          collection(db, "tips"),
          where("Creator", "==", uid),
          where("createdAt", ">", twentyFourHoursAgo)
        );
        const userTipsSnapshot = await getDocs(userTipsQuery);

        if (userTipsSnapshot.size >= 3) {
          alert("Solo puedes crear 3 tips al día.");
          setNewTip({ Name: "", Description: "", Creator: "" });
          return;
        }
        await addDoc(collection(db, "tips"), {
          ...newTip,
          Creator: uid,
          createdAt: serverTimestamp(),
        });
      }
      setNewTip({ Name: "", Description: "", Creator: "" });
    } catch (error) {
      console.error("Error adding/updating tip:", error);
    }
  };

  // Delete a tip
  const deleteTip = async (id) => {
    const confirmDelete = window.confirm(
      "Estás seguro de que quieres borrar ese tip?"
    );
    if (!confirmDelete) return;
    try {
      // Get all comments associated with the tip
      const commentsQuery = query(
        collection(db, "comments"),
        where("tipId", "==", id)
      );
      const commentsSnapshot = await getDocs(commentsQuery);

      // Delete each comment individually
      const deletePromises = commentsSnapshot.docs.map((commentDoc) =>
        deleteDoc(doc(db, "comments", commentDoc.id))
      );
      await Promise.all(deletePromises);

      // Now delete the tip
      await deleteDoc(doc(db, "tips", id));
    } catch (error) {
      console.error("Error deleting tip:", error);
    }
  };

  // Edit a tip
  const editTip = (id) => {
    const tipToEdit = tips.find((tip) => tip.id === id);
    if (tipToEdit) {
      setNewTip({
        Name: tipToEdit.Name,
        Description: tipToEdit.Description,
        Creator: tipToEdit.Creator,
      });
      setEditingTipId(id);
    }
  };

  return (
    <div className="tips">
      <h1>Tips</h1>

      {/* Professional Tips Section */}
      <div className="tipSection">
        <h2
          onClick={() => setShowProTips(!showProTips)}
          className="dropdownTitle"
        >
          Tips de profesionales{" "}
          {showProTips ? <FaCaretDown /> : <FaCaretRight />}
        </h2>
        <div className="tipCardContainer">
          {(showProTips ? professionalTips : professionalTips.slice(0, 3)).map(
            (tip) => (
              <div key={tip.id} className="tipCard">
                <div className="tipCardText">
                  <h2>{tip.Name}</h2>
                  <p>{tip.Description}</p>
                </div>
                <div className="tipCardButtons">
                  <button
                    className="iconTip"
                    onClick={() => setOpenedComment(tip)}
                  >
                    <MdComment size={20} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <hr width="95%" color="black" />

      {/* User Tips Section */}
      <div className="tipSection">
        <h2
          onClick={() => setShowUserTips(!showUserTips)}
          className="dropdownTitle"
        >
          Tips de usuarios {showUserTips ? <FaCaretDown /> : <FaCaretRight />}
        </h2>
        <div className="tipCardContainer">
          {(showUserTips ? tips : tips.slice(0, uid ? 2 : 3)).map((tip) => (
            <div key={tip.id} className="tipCard">
              <div className="tipCardText">
                <h2>{tip.Name}</h2>
                <p>{tip.Description}</p>
              </div>
              <div className="tipCardButtons">
                {uid === tip.Creator && (
                  <div className="creatorIcons">
                    <button
                      className="iconTip"
                      onClick={() => deleteTip(tip.id)}
                    >
                      <MdDelete size={20} />
                    </button>
                    <button className="iconTip" onClick={() => editTip(tip.id)}>
                      <MdEdit size={20} />
                    </button>
                  </div>
                )}
                <button
                  className="iconTip"
                  onClick={() => setOpenedComment(tip)}
                >
                  <MdComment size={20} />
                </button>
              </div>
            </div>
          ))}
          {uid && (
            <div className="addTip tipCard">
              <h2>{editingTipId ? "Editar Tip" : "Añadir Tip"}</h2>
              <form onSubmit={handleAddOrUpdateTip} autoComplete="off">
                <input
                  type="text"
                  name="Name"
                  placeholder="Título"
                  value={newTip.Name}
                  maxLength={30}
                  onChange={handleInputChange}
                />
                <textarea
                  name="Description"
                  placeholder="Descripción"
                  maxLength={150}
                  value={newTip.Description}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault(); // Prevents new line
                      handleAddOrUpdateTip(e); // Submit the form
                    }
                  }}
                ></textarea>
              </form>
            </div>
          )}
        </div>
      </div>

      {openedComment && (
        <Comments tip={openedComment} onClose={() => setOpenedComment(null)} />
      )}
    </div>
  );
}

export default Tips;

// {uid && (
//   <div className="addTip tipCard">
//   <h2>{editingTipId ? "Edit Tip" : "Add a New Tip"}</h2>
//   <form onSubmit={handleAddOrUpdateTip} autoComplete="off">
//     <input
//       type="text"
//       name="Name"
//       placeholder="Tip Name"
//       value={newTip.Name}
//       maxLength={30}
//       onChange={handleInputChange}
//     />
//     <textarea
//       name="Description"
//       placeholder="Tip Description"
//       maxLength={150}
//       value={newTip.Description}
//       onChange={handleInputChange}
//       onKeyDown={(e) => {
//         if (e.key === "Enter" && !e.shiftKey) {
//           e.preventDefault(); // Prevents new line
//           handleAddOrUpdateTip(e); // Submit the form
//         }
//       }}
//     ></textarea>
//   </form>
// </div>
// )}
// </div>
// )}
