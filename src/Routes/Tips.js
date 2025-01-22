import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import "../css/tips.css";

function Tips() {
  const [uid, setUid] = useState(null); // Store the user's UID
  const [tips, setTips] = useState([]);
  const [newTip, setNewTip] = useState({
    Name: "",
    Description: "",
    Creator: "",
  });
  const [editingTipId, setEditingTipId] = useState(null); // Track the tip being edited

  // Track the user's authentication state and UID
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUid(user ? user.uid : null);
    });
    return () => unsubscribeAuth();
  }, []);

  // Listen for real-time updates to the "tips" collection
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
        console.error("Error listening for tips changes:", error);
      }
    );

    return () => unsubscribeTips(); // Cleanup listener on unmount
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTip((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle adding or updating a tip
  const handleAddOrUpdateTip = async (e) => {
    e.preventDefault();

    // Ensure required fields are filled
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
        // Update existing tip
        const tipRef = doc(db, "tips", editingTipId);
        await updateDoc(tipRef, { ...newTip, Creator: uid });
        setEditingTipId(null);
      } else {
        // Add new tip
        const tipWithCreator = { ...newTip, Creator: uid };
        await addDoc(collection(db, "tips"), tipWithCreator);
      }

      // Reset the form
      setNewTip({ Name: "", Description: "", Creator: "" });
    } catch (error) {
      console.error("Error adding/updating tip:", error);
    }
  };

  // Delete tip
  const deleteTip = async (id) => {
    try {
      await deleteDoc(doc(db, "tips", id));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const editTip = async (id) => {
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
              {uid === tip.Creator && (
                <div className="tipCardButtons">
                  <button className="iconTip" onClick={() => deleteTip(tip.id)}>
                    <MdDelete size={20} />
                  </button>
                  <button className="iconTip" onClick={() => editTip(tip.id)}>
                    <MdEdit size={20} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        {uid && (
          <div className="addTip tipCard">
            <h2>{editingTipId ? "Edit Tip" : "Add a New Tip"}</h2>
            <form onSubmit={handleAddOrUpdateTip}>
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
                maxLength={300}
              ></textarea>
              <button type="submit" id="submit">
                {editingTipId ? "Update Tip" : "Add Tip"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tips;
