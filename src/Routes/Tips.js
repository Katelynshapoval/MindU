import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import "../css/tips.css";

function Tips() {
  const [tips, setTips] = useState([]);
  const [newTip, setNewTip] = useState({ Name: "", Description: "" });
  const [editingTipId, setEditingTipId] = useState(null); // Track the tip being edited

  // Fetch tips from Firestore
  useEffect(() => {
    const fetchTips = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tips"));
        const tipsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTips(tipsList);
      } catch (error) {
        console.error("Error fetching tips:", error);
      }
    };

    fetchTips();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTip((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle adding a new tip
  const handleAddOrUpdateTip = async (e) => {
    e.preventDefault();

    if (!newTip.Name || !newTip.Description) {
      alert("Please fill out all fields!");
      return;
    }

    try {
      if (editingTipId) {
        // Update existing tip
        const tipRef = doc(db, "tips", editingTipId);
        await updateDoc(tipRef, newTip);
        setTips((prev) =>
          prev.map((tip) =>
            tip.id === editingTipId ? { ...tip, ...newTip } : tip
          )
        );
        setEditingTipId(null);
      } else {
        // Add new tip
        const docRef = await addDoc(collection(db, "tips"), newTip);
        setTips((prev) => [...prev, { id: docRef.id, ...newTip }]);
      }

      // Reset form
      setNewTip({ Name: "", Description: "" });
    } catch (error) {
      console.error("Error adding/updating tip:", error);
    }
  };

  return (
    <div className="tips">
      <h1>Tips</h1>
      <div className="tipCardContainer">
        {tips.length === 0 ? (
          <p>No tips available</p>
        ) : (
          tips.map((tip) => (
            <div key={tip.id} className="tipCard">
              <h2>{tip.Name}</h2>
              <p>{tip.Description}</p>
            </div>
          ))
        )}

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
            ></textarea>
            <button type="submit">
              {editingTipId ? "Update Tip" : "Add Tip"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Tips;
