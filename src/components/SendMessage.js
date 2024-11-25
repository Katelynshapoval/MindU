import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase/firebase";
import {
  addDoc,
  collection,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { FaCircleArrowUp } from "react-icons/fa6";
import { Timestamp } from "firebase/firestore";

const SendMessage = ({ scroll, editMessageData, setEditMessageData }) => {
  const [message, setMessage] = useState(""); // State to store the message
  const inputRef = useRef(null); // Create a ref to the input field

  // If there is an edit message data, pre-fill the input field
  useEffect(() => {
    if (editMessageData) {
      setMessage(editMessageData.text); // Set the message to be edited
      inputRef.current?.focus(); // Focus on the input field after editing
    }
  }, [editMessageData]); // Only run when editMessageData changes
  // Autofocus on input
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  // Function to handle sending or updating the message
  const sendMessage = async (event) => {
    event.preventDefault(); // Prevent form default submission behavior
    if (message.trim() === "") {
      // Ensure message is not empty
      alert("Enter valid message");
      return;
    }

    const { uid, displayName, photoURL } = auth.currentUser;

    if (editMessageData) {
      // If we are editing, update the existing message
      const messageRef = doc(db, "messages", editMessageData.id);
      await updateDoc(messageRef, {
        text: message,
        updatedAt: serverTimestamp(),
      });

      // Reset the edit state after updating the message
      setEditMessageData(null);
    } else {
      // Otherwise, create a new message
      const localTimestamp = Timestamp.now();
      await addDoc(collection(db, "messages"), {
        text: message,
        name: displayName,
        createdAt: localTimestamp, // Temporary local timestamp
        uid, // User ID
      });
    }

    setMessage(""); // Clear the input field
    scroll.current.scrollIntoView({ behavior: "smooth" }); // Scroll to latest message
  };

  return (
    <form onSubmit={sendMessage} autoComplete="off" className="send-message">
      <div className="inputContainer">
        <input
          id="userInput"
          name="messageInput"
          type="text"
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)} // Update message state on change
          ref={inputRef} // Attach the ref to the input field + autofocus
        />
        <button type="submit" id="submit">
          <FaCircleArrowUp /> {/* Send icon */}
        </button>
      </div>
    </form>
  );
};

export default SendMessage;
