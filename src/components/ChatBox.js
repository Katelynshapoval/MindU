import { React, useEffect, useRef, useState } from "react";
import {
  query,
  collection,
  orderBy,
  onSnapshot,
  limit,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase.js";
import Message from "./Message";
import SendMessage from "./SendMessage";
import { admins } from "../firebase/firebase";

const ChatBox = () => {
  const [messages, setMessages] = useState([]); // State to hold the list of messages
  const [editMessageData, setEditMessageData] = useState(null); // State for the message being edited
  const [nickname, setNickname] = useState("Anonymous"); // Default to "Anonymous"
  const scroll = useRef(); // Reference to scroll to the bottom of the chat
  const [uid, setUid] = useState(null);
  const [admin, setAdmin] = useState(false);

  // Authentication state
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUid(user ? user.uid : null);
      if (user) {
        // Fetch the nickname from Firestore when user logs in
        fetchNickname(user.uid);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch nickname from Firestore
  const fetchNickname = async (userUid) => {
    if (admin) {
      setNickname("Admin");
      return;
    }
    const nicknameDocRef = doc(db, "nicknames", userUid);
    const nicknameDoc = await getDoc(nicknameDocRef);
    if (nicknameDoc.exists()) {
      setNickname(nicknameDoc.data().nickname);
    } else {
      setNickname("Anonymous"); // Set to "Anonymous" if no nickname found
      await setDoc(nicknameDocRef, { nickname: "Anonymous" }); // Create entry in Firestore
    }
  };

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

  useEffect(() => {
    // Check if admin is logged in
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setAdmin(user ? admins.includes(user.email) : false);
    });
    return () => unsubscribeAuth();
  });

  // Function to handle message editing
  const handleEditMessage = (message) => {
    setEditMessageData(message); // Set message data to be edited
  };

  // Function to handle nickname change
  const handleNicknameChange = (e) => {
    setNickname(e.target.value); // Update nickname state
  };

  // Save nickname to Firestore when "Enter" is pressed
  const handleNicknameKeyPress = async (e) => {
    if (e.key === "Enter" && nickname.trim() !== "") {
      e.preventDefault(); // Prevent form submission

      // Update nickname in Firestore for the user
      const nicknameDocRef = doc(db, "nicknames", uid);
      await setDoc(nicknameDocRef, { nickname }, { merge: true });

      // Save nickname to localStorage for persistence
      localStorage.setItem("nickname", nickname);

      alert(`Tu nombre ha sido cambiado a ${nickname}.`);
    }
  };

  return (
    <main className="chat-box">
      {/* Nickname Input Form */}
      <form className="nickname-form">
        <label htmlFor="nickname">Nickname: </label>
        <input
          type="text"
          id="nickname"
          value={nickname}
          onChange={handleNicknameChange} // Allow user to change nickname
          onKeyDown={handleNicknameKeyPress} // Detect Enter key press to save nickname
          placeholder="Anonymous"
          disabled={admin}
        />
      </form>

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

      {/* SendMessage Component with nickname as a prop */}
      <SendMessage
        scroll={scroll}
        editMessageData={editMessageData} // Pass the edit data to SendMessage
        setEditMessageData={setEditMessageData} // Pass the setter to reset after editing
        nickname={nickname} // Pass nickname down to SendMessage
      />
    </main>
  );
};

export default ChatBox;
