import React from "react";
import "../css/chat.css";
import { FaCircleArrowUp } from "react-icons/fa6";

function Chat() {
  return (
    <div className="chat">
      <h1>Chat</h1>
      <ul className="feed"></ul>
      <div className="inputContainer">
        <input id="userInput" placeholder="Enter your prompt" />
        <div id="submit">
          <FaCircleArrowUp />
        </div>
      </div>
    </div>
  );
}

export default Chat;
