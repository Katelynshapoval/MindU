import React, { useEffect, useRef, useState } from "react";
import {
  query,
  collection,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/firebase.js";
import Message from "./Message";
import SendMessage from "./SendMessage";

const ChatBox = () => {
  const [messages, setMessages] = useState([]); // State to hold the list of messages
  const [editMessageData, setEditMessageData] = useState(null); // State for the message being edited
  const scroll = useRef(); // Reference to scroll to the bottom of the chat

  // Query to fetch messages ordered by creation time, limiting to 50
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc"),
      limit(50)
    );

    // Set up real-time listener for Firestore data changes
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      const fetchedMessages = [];
      QuerySnapshot.forEach((doc) => {
        // Push each document data to fetchedMessages array
        fetchedMessages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(fetchedMessages); // Update state with sorted messages
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once when component mounts

  // Effect to scroll to the bottom when messages update
  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Depend on messages state

  // Function to handle message editing
  const handleEditMessage = (message) => {
    setEditMessageData(message); // Set message data to be edited
  };

  return (
    <main className="chat-box">
      <div
        className="messages-wrapper"
        style={{ overflowY: "auto", height: "80vh" }}
      >
        {messages?.map((message) => (
          <Message
            key={message.id}
            message={message}
            onEdit={handleEditMessage}
          />
        ))}
        <div ref={scroll}></div>
      </div>
      <SendMessage
        scroll={scroll}
        editMessageData={editMessageData} // Pass the edit data to SendMessage
        setEditMessageData={setEditMessageData} // Pass the setter to reset after editing
      />{" "}
      {/* SendMessage with edit functionality */}
    </main>
  );
};

export default ChatBox;
