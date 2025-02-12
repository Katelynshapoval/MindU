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
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple submissions
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

    if (isSubmitting) return; // Prevent multiple submissions

    if (message.trim() === "") {
      alert("Introduzca un mensaje válido.");
      return;
    }

    setIsSubmitting(true); // Disable further submissions

    // Check if the message contains any sensitive words
    const messageLowerCase = message.toLowerCase();
    const containsSensitiveWords = sensitiveWords.some((word) =>
      messageLowerCase.includes(word)
    );

    if (containsSensitiveWords) {
      setShowWarning(true); // Show the warning div if sensitive words are found
      setIsSubmitting(false); // Re-enable submission if warning is shown
      return;
    } else {
      setShowWarning(false); // Hide the warning div if no sensitive words
    }

    const { uid } = auth.currentUser;

    try {
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
        await addDoc(collection(db, "messages"), {
          text: message,
          name: nickname, // Use the nickname here
          createdAt: Timestamp.now(), // Temporary local timestamp
          uid, // User ID
        });
      }

      setMessage(""); // Clear the input field
      scroll.current.scrollIntoView({ behavior: "smooth" }); // Scroll to latest message
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setIsSubmitting(false); // Re-enable submission after sending
  };

  return (
    <div>
      {/* Warning div for sensitive words */}
      {showWarning && (
        <div className="warning-div">
          <p>
            Si necesitas ayuda, llama <a href="tel:024">024</a>. <br /> Nunca
            estás solo.
          </p>

          <button
            autoFocus
            onClick={() => {
              setShowWarning(false);
              inputRef.current?.focus(); // Refocus on input after closing warning
            }}
          >
            OK
          </button>
        </div>
      )}

      <form onSubmit={sendMessage} autoComplete="off" className="send-message">
        <div className="inputContainer">
          <input
            id="userInput"
            name="messageInput"
            type="text"
            placeholder="Escribe tu mensaje..."
            value={message}
            maxLength={500}
            onChange={(e) => setMessage(e.target.value)} // Update message state on change
            ref={inputRef} // Attach the ref to the input field + autofocus
          />
          <button type="submit" id="submit" disabled={isSubmitting}>
            <FaCircleArrowUp /> {/* Send icon */}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendMessage;
