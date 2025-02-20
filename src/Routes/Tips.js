import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom"; // For navigation

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
import { FaCaretDown, FaCaretRight, FaHeart, FaArrowUp } from "react-icons/fa";
import { admins } from "../firebase/firebase";
import { Timestamp } from "firebase/firestore";

function Tips() {
  const [uid, setUid] = useState(null);
  const [tips, setTips] = useState([]);
  const [showProTips, setShowProTips] = useState(false);
  const [showUserTips, setShowUserTips] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [proTips, setProTips] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [commentCounts, setCommentCounts] = useState({});
  const [editingProTip, setEditingProTip] = useState({
    id: null,
    Name: "",
    Description: "",
    Category: "",
  });

  const [newTip, setNewTip] = useState({
    Name: "",
    Description: "",
    Creator: "",
    Category: "",
  });

  const [editingTipId, setEditingTipId] = useState(null);
  const [openedComment, setOpenedComment] = useState(null);
  useEffect(() => {
    // Check if admin is logged in
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setAdmin(user ? admins.includes(user.email) : false);
    });
    return () => unsubscribeAuth();
  });
  const filteredTips = selectedCategory
    ? tips.filter((tip) => tip.Category === selectedCategory)
    : tips;
  useEffect(() => {
    const commentCountsMap = {};
    const unsubscribeMap = {};

    const setupCommentListener = (tipId) => {
      const commentsQuery = query(
        collection(db, "comments"),
        where("tipId", "==", tipId)
      );

      unsubscribeMap[tipId] = onSnapshot(commentsQuery, (snapshot) => {
        commentCountsMap[tipId] = snapshot.size;
        setCommentCounts({ ...commentCountsMap });
      });
    };

    [...tips, ...proTips].forEach((tip) => {
      setupCommentListener(tip.id);
    });

    return () => {
      Object.values(unsubscribeMap).forEach((unsubscribe) => unsubscribe());
    };
  }, [tips, proTips]); // Runs when proTips and tips update

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

  // Fetch user tips
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
  // Fetch professional tips
  useEffect(() => {
    const q = query(
      collection(db, "professionalTips"),
      orderBy("createdAt", "desc")
    );
    const unsubscribeProTips = onSnapshot(q, (querySnapshot) => {
      setProTips(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsubscribeProTips();
  }, []);

  // Handle tip input changes
  const handleTipInputChange = (e, setTip) => {
    const { name, value } = e.target;
    setTip((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Like tips
  const likeAnyTip = async (tip, collectionName) => {
    let newLikes = tip.likes.includes(uid)
      ? tip.likes.filter((person) => person !== uid)
      : [...tip.likes, uid];

    await updateDoc(doc(db, collectionName, tip.id), { likes: newLikes });
  };

  // Add or update tip
  const handleAddOrUpdateTip = async (e) => {
    e.preventDefault();
    if (!newTip.Name || !newTip.Description || !newTip.Category) {
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
          likes: [],
        });
      }
      setNewTip({ Name: "", Description: "", Category: "", Creator: "" });
      setSelectedCategory("");
    } catch (error) {
      console.error("Error adding/updating tip:", error);
    }
  };

  const handleAddOrUpdateProTip = async (e) => {
    e.preventDefault();
    if (!editingProTip.Name || !editingProTip.Description)
      return alert("Por favor, rellena todos los campos.");

    try {
      if (editingProTip.id) {
        await updateDoc(doc(db, "professionalTips", editingProTip.id), {
          Name: editingProTip.Name,
          Description: editingProTip.Description,
        });
        setEditingProTip({ id: null, Name: "", Description: "" });
      } else {
        await addDoc(collection(db, "professionalTips"), {
          Name: editingProTip.Name,
          Description: editingProTip.Description,
          createdAt: serverTimestamp(),
          likes: [],
        });
      }

      setEditingProTip({ Name: "", Description: "" });
    } catch (error) {
      console.error("Error adding/updating professional tip:", error);
    }
  };
  // Delete pro tips
  const deleteProTip = async (id) => {
    if (window.confirm("¿Seguro que quieres borrar este tip?")) {
      await deleteDoc(doc(db, "professionalTips", id));
    }
    setEditingProTip({ id: null, Name: "", Description: "" });
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
    setEditingTipId(null);
    setNewTip({ Name: "", Description: "", Creator: "" });
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
          id="professionalHeader"
        >
          Tips de profesionales{" "}
          {showProTips ? <FaCaretDown /> : <FaCaretRight />}
        </h2>
        <div className="tipCardContainer">
          {(showProTips ? proTips : proTips.slice(0, admin ? 2 : 3)).map(
            (tip) => (
              <div key={tip.id} className="tipCard">
                <div className="tipCardText">
                  <h2>{tip.Name}</h2>
                  <p>{tip.Description}</p>
                </div>
                <div className="tipCardButtons">
                  <div className="buttonsFirstRow">
                    {admin && (
                      // <div className="creatorIcons">
                      <>
                        <button
                          className="iconTip"
                          onClick={() => deleteProTip(tip.id)}
                        >
                          <MdDelete size={20} />
                        </button>
                        <button
                          className="iconTip"
                          onClick={() => {
                            setEditingProTip({
                              id: tip.id,
                              Name: tip.Name,
                              Description: tip.Description,
                            });
                          }}
                        >
                          <MdEdit size={20} />
                        </button>
                      </>
                    )}
                    {/* <button
                      className="iconTip"
                      onClick={() => setOpenedComment(tip)}
                    >
                      <MdComment size={20} />
                    </button> */}
                    <button
                      className="iconTip"
                      onClick={() => setOpenedComment(tip)}
                    >
                      <div style={{ position: "relative" }}>
                        <MdComment size={20} />
                        {commentCounts[tip.id] > 0 && (
                          <span className="commentCount">
                            {commentCounts[tip.id] > 5
                              ? "5+"
                              : commentCounts[tip.id]}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                  <div
                    class={`likesTip ${tip.likes.includes(uid) ? "liked" : ""}`}
                  >
                    <p>{tip.likes?.length || 0}</p>
                    <button
                      className="iconTip"
                      onClick={() => {
                        admin
                          ? alert("No puedes dar like.")
                          : uid
                          ? likeAnyTip(tip, "professionalTips")
                          : alert("Tienes que iniciar sesión.");
                      }}
                    >
                      <FaHeart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
          {admin && (
            <div className="addTip tipCard">
              <h2>{editingTipId ? "Editar Tip" : "Añadir Tip"}</h2>
              <form onSubmit={handleAddOrUpdateProTip} autoComplete="off">
                <input
                  type="text"
                  name="Name"
                  placeholder="Título"
                  value={editingProTip.Name}
                  maxLength={30}
                  onChange={(e) => handleTipInputChange(e, setEditingProTip)}
                  id="inputTip"
                  required
                />
                <textarea
                  name="Description"
                  placeholder="Descripción"
                  maxLength={110}
                  value={editingProTip.Description}
                  onChange={(e) => handleTipInputChange(e, setEditingProTip)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault(); // Prevents new line
                      handleAddOrUpdateProTip(e); // Submit the form
                    }
                  }}
                  id="textareaTip"
                  required
                ></textarea>
                <button type="submit" id="submitFormTip">
                  {editingTipId ? "Guardar Cambios" : "Añadir Tip"}
                </button>
              </form>
            </div>
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
        <div className="filterContainer">
          <label htmlFor="categoryFilter">Filtrar por categoría: </label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="Bienestar emocional">Bienestar Emocional</option>
            <option value="Relaciones">Relaciones</option>
            <option value="Productividad">Productividad</option>
            <option value="Autoestima">Autoestima</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className="tipCardContainer">
          {(showUserTips
            ? filteredTips
            : filteredTips.slice(0, uid ? 2 : 3)
          ).map((tip) => (
            <div key={tip.id} className="tipCard">
              <div className="tipCardText">
                <div id="headerCard">
                  <h2>{tip.Name}</h2>
                  <p>{tip.Category}</p>
                </div>
                <p>{tip.Description}</p>
              </div>
              <div className="tipCardButtons">
                <div className="buttonsFirstRow">
                  {(uid === tip.Creator || admin) && (
                    // <div className="creatorIcons">
                    <>
                      <button
                        className="iconTip"
                        onClick={() => deleteTip(tip.id)}
                      >
                        <MdDelete size={20} />
                      </button>
                      <button
                        className="iconTip"
                        onClick={() => editTip(tip.id)}
                      >
                        <MdEdit size={20} />
                      </button>
                    </>
                  )}
                  <button
                    className="iconTip"
                    onClick={() => setOpenedComment(tip)}
                  >
                    <div style={{ position: "relative" }}>
                      <MdComment size={20} />
                      {commentCounts[tip.id] > 0 && (
                        <span className="commentCount">
                          {commentCounts[tip.id]}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
                <div
                  class={`likesTip ${tip.likes.includes(uid) ? "liked" : ""}`}
                >
                  <p>{tip.likes?.length || 0}</p>
                  <button
                    className="iconTip"
                    onClick={() => {
                      admin
                        ? alert("No puedes dar like.")
                        : uid
                        ? likeAnyTip(tip, "tips")
                        : alert("Tienes que iniciar sesión.");
                    }}
                  >
                    <FaHeart size={20} />
                  </button>
                </div>
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
                  maxLength={20}
                  onChange={(e) => handleTipInputChange(e, setNewTip)}
                  id="inputTip"
                  required
                />
                <textarea
                  name="Description"
                  placeholder="Descripción"
                  maxLength={100}
                  value={newTip.Description}
                  onChange={(e) => handleTipInputChange(e, setNewTip)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault(); // Prevents new line
                      handleAddOrUpdateTip(e); // Submit the form
                    }
                  }}
                  id="textareaTip"
                  required
                ></textarea>
                <select
                  id="selectTip"
                  name="Category"
                  value={newTip.Category}
                  onChange={(e) => handleTipInputChange(e, setNewTip)}
                  required
                >
                  <option value="" disabled>
                    Categoría
                  </option>
                  <option value="Bienestar emocional">
                    Bienestar Emocional
                  </option>
                  <option value="Relaciones">Relaciones</option>
                  <option value="Productividad">Productividad</option>
                  <option value="Autoestima">Autoestima </option>
                  <option value="Otro">Otro </option>
                </select>
                {/* Submit Button */}
                <button type="submit" id="submitFormTip">
                  {editingTipId ? "Guardar Cambios" : "Añadir Tip"}
                </button>
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
