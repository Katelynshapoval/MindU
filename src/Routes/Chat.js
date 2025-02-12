import React from "react";
import "../css/chat.css";
import { FaCircleArrowUp } from "react-icons/fa6";
import ChatBox from "../components/ChatBox";
import { auth } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import SignIn from "../components/SignIn";

function Chat() {
  const [user] = useAuthState(auth);
  return (
    <div className="chat">
      <h1>Chat</h1>
      {/* <ChatBox /> */}
      {/* <div className="inputContainer">
        <input id="userInput" placeholder="Enter your prompt" />
        <div id="submit">
          <FaCircleArrowUp />
        </div>
      </div> */}
      {!user ? (
        <div id="sigInChat">
          <p>Tienes que iniciar sesión para entrar.</p>
          {/* <SignIn /> */}
        </div>
      ) : (
        <>
          <ChatBox />
        </>
      )}
    </div>
  );
}

export default Chat;
