import React from "react";
import { auth } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const Message = ({ message }) => {
  const [user] = useAuthState(auth); // Get current authenticated user
  return (
    // Conditionally apply "right" class if the message is from the current user
    <div className={`chat-bubble ${message.uid === user.uid ? "right" : ""}`}>
      <div className="chat-bubble__right">
        {/* Display the name of the message sender */}
        <p className="user-name">{message.name}</p>
        {/* Display the message content */}
        <p className="user-message">{message.text}</p>
      </div>
    </div>
  );
};

export default Message;
