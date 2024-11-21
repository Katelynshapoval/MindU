import React, { useState } from "react";
import { auth, db } from "../firebase/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FaCircleArrowUp } from "react-icons/fa6";

const SendMessage = ({ scroll }) => {
  const [message, setMessage] = useState(""); // State to store the message

  // Function to handle sending the message
  const sendMessage = async (event) => {
    event.preventDefault(); // Prevent form default submission behavior
    if (message.trim() === "") {
      // Ensure message is not empty
      alert("Enter valid message");
      return;
    }
    // Get current user's details from Firebase Authentication
    const { uid, displayName, photoURL } = auth.currentUser;
    // Add the message to Firestore
    await addDoc(collection(db, "messages"), {
      text: message,
      name: displayName,
      avatar: photoURL,
      createdAt: serverTimestamp(), // Timestamp for when the message was sent
      uid, // User ID
    });
    setMessage(""); // Clear the input field
    scroll.current.scrollIntoView({ behavior: "smooth" }); // Scroll to latest message
  };
  return (
    <form onSubmit={(event) => sendMessage(event)} className="send-message">
      <div className="inputContainer">
        <input
          id="userInput"
          name="messageInput"
          type="text"
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)} // Update message state on change
        />
        <button type="submit" id="submit">
          <FaCircleArrowUp /> {/* Send icon */}
        </button>
      </div>
    </form>
  );
};

export default SendMessage;
