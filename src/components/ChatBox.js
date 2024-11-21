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
  const scroll = useRef(); // Reference to scroll to the bottom of the chat

  // Query to fetch messages ordered by creation time, limiting to 50
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    // Set up real-time listener for Firestore data changes
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      const fetchedMessages = [];
      QuerySnapshot.forEach((doc) => {
        // Push each document data to fetchedMessages array
        fetchedMessages.push({ ...doc.data(), id: doc.id });
      });
      // Sort messages by createdAt to display them in correct order
      const sortedMessages = fetchedMessages.sort(
        (a, b) => a.createdAt - b.createdAt
      );
      setMessages(sortedMessages); // Update state with sorted messages
    });

    // Cleanup listener on component unmount
    return () => unsubscribe;
  }, []); // Empty dependency array means this runs once when component mounts

  // Effect to scroll to the bottom when messages update
  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Depend on messages state

  return (
    <main className="chat-box">
      <div
        className="messages-wrapper"
        style={{ overflowY: "auto", height: "80vh" }}
      >
        {messages?.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        <div ref={scroll}></div>
      </div>
      <SendMessage scroll={scroll} /> {/* component for new messages */}
    </main>
  );
};

export default ChatBox;
