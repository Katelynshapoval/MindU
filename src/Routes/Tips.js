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
} from "firebase/firestore";
import { MdEdit, MdDelete, MdComment } from "react-icons/md";
import "../css/tips.css";
import Comments from "./TipsComments";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";

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
        "Que consiste en cada 20/30 mins intentar ponerlos de pie y hacer algún movimiento articular, andar o hacer incluso alguna sentadilla o lo que queramos.",
      id: 1,
    },
    {
      Name: "Actividad física",
      Description:
        "Hay que priorizar la actividad física incluso las semanas de exámenes, para oxigenar y limpiar el cerebro, y mover las estructuras del cuerpo.",
      id: 2,
    },
    {
      Name: "⁠Higiene postural",
      Description:
        "No es que existan posturas malas ni buenas, lo malo son posturas mantenidas, así que cada cierto tiempo cambiar de posición.",
      id: 3,
    },
    {
      Name: "Ergonomía ",
      Description:
        "Ergonomía en el escritorio, en cuanto a altura de sillas, ratón, teclado, pantalla central alineada con nuestro cuerpo.",
      id: 4,
    },
    {
      Name: "⁠Higiene del sueño",
      Description:
        "Muy importante organizar y respetar el descanso, para tener mayor retención de lo que hayamos estudiado, y también para que los tejidos que puedan estar bajo estrés mecánico, que descansen.",
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
    const unsubscribeTips = onSnapshot(
      collection(db, "tips"),
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

    if (!uid) {
      alert("You must be logged in to add tips.");
      return;
    }
    if (!newTip.Name || !newTip.Description) {
      alert("Please fill out all fields!");
      return;
    }

    try {
      if (editingTipId) {
        await updateDoc(doc(db, "tips", editingTipId), {
          ...newTip,
          Creator: uid,
        });
        setEditingTipId(null);
      } else {
        await addDoc(collection(db, "tips"), { ...newTip, Creator: uid });
      }
      setNewTip({ Name: "", Description: "", Creator: "" });
    } catch (error) {
      console.error("Error adding/updating tip:", error);
    }
  };

  // Delete a tip
  const deleteTip = async (id) => {
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
      <div className="tipSection">
        <h2
          onClick={() => setShowProTips(!showProTips)}
          className="dropdownTitle"
        >
          Tips by professionals{" "}
          {showProTips ? <FaCaretDown /> : <FaCaretRight />}
        </h2>
        {showProTips && (
          <div className="tipCardContainer">
            {professionalTips.map((tip) => (
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
            ))}
          </div>
        )}
      </div>

      <hr width="95%" color="black" />
      <div className="tipSection">
        <h2
          onClick={() => setShowUserTips(!showUserTips)}
          className="dropdownTitle"
        >
          Tips by users {showUserTips ? <FaCaretDown /> : <FaCaretRight />}
        </h2>
        {showUserTips && (
          <div className="tipCardContainer">
            {tips.length === 0 && !uid ? (
              <p>No tips available</p>
            ) : (
              tips.map((tip) => (
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
                        <button
                          className="iconTip"
                          onClick={() => editTip(tip.id)}
                        >
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
              ))
            )}
            {uid && (
              <div className="addTip tipCard">
                <h2>{editingTipId ? "Edit Tip" : "Add a New Tip"}</h2>
                <form onSubmit={handleAddOrUpdateTip} autoComplete="off">
                  <input
                    type="text"
                    name="Name"
                    placeholder="Tip Name"
                    value={newTip.Name}
                    onChange={handleInputChange}
                  />
                  <textarea
                    name="Description"
                    placeholder="Tip Description"
                    value={newTip.Description}
                    onChange={handleInputChange}
                  ></textarea>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
      {openedComment && (
        <Comments tip={openedComment} onClose={() => setOpenedComment(null)} />
      )}
    </div>
  );
}

export default Tips;
