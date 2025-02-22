import React, { useEffect, useRef, useState } from "react";
import { FaCircleArrowUp } from "react-icons/fa6";
import {
  addDoc,
  collection,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase.js";
import { Timestamp } from "firebase/firestore";

const SendMessage = ({
  scroll,
  editMessageData,
  setEditMessageData,
  nickname,
}) => {
  // User-related states
  const [uid, setUid] = useState(null);

  // Message-related states
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Ref for input field
  const inputRef = useRef(null);

  // List of sensitive words
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
    "La vida no merece la pena",
    "sufrir",
    "Estoy cansado de luchar",
    "terminar",
    "carga",
    "no puedo más",
    "infierno",
    "Oigo voces que me dicen 'hazlo'",
    "demonios",
    "cobarde",
    "cuchillo",
  ];

  // Autofocus on input when component mounts
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  // Load message in input when editing
  useEffect(() => {
    if (editMessageData) {
      setMessage(editMessageData.text);
      inputRef.current?.focus();
    }
  }, [editMessageData]);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUid(user ? user.uid : null);
    });
    return () => unsubscribeAuth();
  }, []);

  // Function to check if a user is muted
  const isUserMuted = async (userId) => {
    const muteDocRef = doc(db, "mutedUsers", userId);
    const muteDoc = await getDoc(muteDocRef);

    if (!muteDoc.exists()) return false;

    const { expiresAt } = muteDoc.data();
    const now = new Date();

    if (now > expiresAt.toDate()) {
      await deleteDoc(muteDocRef); // Remove expired mute
      return false;
    }

    return true;
  };

  // Function to check if the message contains sensitive words
  const containsSensitiveWords = (text) => {
    const lowerCaseMessage = text.toLowerCase();
    return sensitiveWords.some((word) => lowerCaseMessage.includes(word));
  };

  // Function to send or update a message
  const sendMessage = async (event) => {
    event.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions

    if (!message.trim()) {
      alert("Introduzca un mensaje válido.");
      return;
    }

    if (await isUserMuted(auth.currentUser.uid)) {
      alert("Estás temporalmente bloqueado. Por favor, espera (1 minuto).");
      return;
    }

    if (containsSensitiveWords(message)) {
      setShowWarning(true);
      return;
    }

    setIsSubmitting(true);
    const { uid } = auth.currentUser;

    try {
      if (editMessageData) {
        // Updating an existing message
        const messageRef = doc(db, "messages", editMessageData.id);
        await updateDoc(messageRef, {
          text: message,
          updatedAt: serverTimestamp(),
        });
        setEditMessageData(null);
      } else {
        // Sending a new message
        await addDoc(collection(db, "messages"), {
          text: message,
          name: nickname,
          createdAt: Timestamp.now(),
          uid,
        });
      }

      setMessage("");
      scroll.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setIsSubmitting(false);
  };

  return (
    <div id="sendMessageBlock">
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
