import React, { useEffect, useRef, useState } from "react";
import { FaCircleArrowUp } from "react-icons/fa6";
import {
  addDoc,
  collection,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase.js";
import { Timestamp } from "firebase/firestore";

const SendMessage = ({
  scroll,
  editMessageData,
  setEditMessageData,
  nickname,
}) => {
  const [message, setMessage] = useState(""); // State to store the message
  const [showWarning, setShowWarning] = useState(false); // State to control the warning div
  const inputRef = useRef(null); // Create a ref to the input field

  // Sensitive words list (in Spanish)
  const sensitiveWords = [
    "suicidio",
    "muerte",
    "muerto",
    "matar",
    "morir",
    "ahorcarse",
    "depresion",
    "tristeza",
    "desesperacion",
    "deseo de morir",
  ];

  // If there is an edit message data, pre-fill the input field
  useEffect(() => {
    if (editMessageData) {
      setMessage(editMessageData.text); // Set the message to be edited
      inputRef.current?.focus(); // Focus on the input field after editing
    }
  }, [editMessageData]);

  // Autofocus on input
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  // Function to handle sending or updating the message
  const sendMessage = async (event) => {
    event.preventDefault(); // Prevent form default submission behavior
    if (message.trim() === "") {
      alert("Enter valid message");
      return;
    }

    // Check if the message contains any sensitive words
    const messageLowerCase = message.toLowerCase();
    const containsSensitiveWords = sensitiveWords.some((word) =>
      messageLowerCase.includes(word)
    );

    if (containsSensitiveWords) {
      setShowWarning(true); // Show the warning div if sensitive words are found
    } else {
      setShowWarning(false); // Hide the warning div if no sensitive words
    }

    const { uid } = auth.currentUser;

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
        name: nickname, // Use the nickname here
        createdAt: localTimestamp, // Temporary local timestamp
        uid, // User ID
      });
    }

    setMessage(""); // Clear the input field
    scroll.current.scrollIntoView({ behavior: "smooth" }); // Scroll to latest message
  };

  return (
    <div>
      {/* Warning div for sensitive words */}
      {showWarning && (
        <div className="warning-div">
          <p>If you need help, call XXX.</p>
          <button onClick={() => setShowWarning(false)}>OK</button>
        </div>
      )}

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
    </div>
  );
};

export default SendMessage;
