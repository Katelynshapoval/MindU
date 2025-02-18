import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { MdBlock } from "react-icons/md";
import { admins } from "../firebase/firebase";

const Message = ({ message, onEdit }) => {
  const [user] = useAuthState(auth); // Get current authenticated user
  const isUserMessage = message.uid === user.uid;
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    // Check if admin is logged in
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setAdmin(user ? admins.includes(user.email) : false);
    });
    return () => unsubscribeAuth();
  });
  // Function to delete the message from Firestore
  const deleteMessage = async () => {
    try {
      await deleteDoc(doc(db, "messages", message.id)); // Delete message by id
    } catch (error) {
      console.error("Error deleting message: ", error);
    }
  };

  // Function to mute a user for 1 minute
  const muteUser = async (userId) => {
    if (!admin) return; // Only admins can mute

    const muteDocRef = doc(db, "mutedUsers", userId);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 1); // Mute for 1 minute

    await setDoc(muteDocRef, {
      uid: userId,
      expiresAt: expiresAt, // Store expiration timestamp
    });

    alert("El usuario ha sido silenciado por 1 minuto.");
  };

  // Function to handle editing the message
  const editMessage = () => {
    if (onEdit) {
      onEdit(message); // Trigger the edit callback passed from the parent
    }
  };

  return (
    <div className={`chat-bubble ${isUserMessage ? "right" : ""}`}>
      {(isUserMessage || admin) && (
        <div className="message-actions">
          <button onClick={editMessage}>
            <MdEdit />
          </button>
          <button onClick={deleteMessage}>
            <MdDelete />
          </button>
          {admin && !isUserMessage && (
            <button onClick={() => muteUser(message.uid)}>
              <MdBlock />
            </button>
          )}
        </div>
      )}
      <div className="chat-bubble__right">
        <p className="user-name">{message.name}</p>
        <p className="user-message">{message.text}</p>
      </div>
    </div>
  );
};

export default Message;
