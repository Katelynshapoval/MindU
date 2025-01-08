import "../css/tips.css";
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

function Tips() {
  const [tips, setTips] = useState([]);
  const [newTip, setNewTip] = useState({
    Name: "",
    Description: "",
  });
  const [editingTipId, setEditingTipId] = useState(null); // To track the movie being edited
  return (
    <div className="tips">
      <h1>Tips</h1>
      <div className="tipCardContainer">
        <div className="tipCard">
          <h2>Name</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime
            mollitia, molestiae quas vel sint commodi repudiandae consequuntur
            voluptatum laborum numquam blanditiis harum quisquam eius sed odit
            fugiat iusto fuga praesentium optio, eaque rerum! Provident
            similique accusantium nemo autem.
          </p>
        </div>

        <div className="addTip tipCard">
          <h2>Add a New Tip</h2>
          <form>
            <input
              type="text"
              name="Name"
              placeholder="Tip Name"
              value={newTip.Name}
            />
            <textarea
              name="Description"
              placeholder="Tip Description"
              value={newTip.Description}
            ></textarea>
            <button type="submit">Add Tip</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Tips;
