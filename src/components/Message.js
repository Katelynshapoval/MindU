import React, { useState } from "react";
import { auth, db } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";

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
      {isUserMessage && (
        <div className="message-actions">
          <button onClick={editMessage}>
            <MdEdit />
          </button>
          <button onClick={deleteMessage}>
            <MdDelete />
          </button>
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
