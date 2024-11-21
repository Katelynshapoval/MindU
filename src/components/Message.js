import React, { useState } from "react";
import { auth, db } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";

const Message = ({ message, onEdit }) => {
  const [user] = useAuthState(auth); // Get current authenticated user
  const isUserMessage = message.uid === user.uid;

  // Function to delete the message from Firestore
  const deleteMessage = async () => {
    try {
      await deleteDoc(doc(db, "messages", message.id)); // Delete message by id
    } catch (error) {
      console.error("Error deleting message: ", error);
    }
  };

  // Function to handle editing the message
  const editMessage = () => {
    if (onEdit) {
      onEdit(message); // Trigger the edit callback passed from the parent
    }
  };

  return (
    <div className={`chat-bubble ${isUserMessage ? "right" : ""}`}>
      <div className="chat-bubble__right">
        <p className="user-name">{message.name}</p>
        <p className="user-message">{message.text}</p>

        {isUserMessage && (
          <div className="message-actions">
            <button onClick={editMessage}>Edit</button>
            <button onClick={deleteMessage}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
