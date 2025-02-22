import React, { useEffect, useRef, useState } from "react";
import {
  query,
  collection,
  orderBy,
  onSnapshot,
  limit,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase.js";
import Message from "./Message";
import SendMessage from "./SendMessage";
import { getAdminEmails } from "../components/getAdminEmails";

const ChatBox = () => {
  // User-related states
  const [uid, setUid] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [admin, setAdmin] = useState(false);

  // Chat-related states
  const [messages, setMessages] = useState([]);
  const [editMessageData, setEditMessageData] = useState(null);
  const scroll = useRef(); // Ref to scroll to the bottom

  // Nickname-related states
  const [nickname, setNickname] = useState("Anonymous");

  // Fetch admin emails on mount
  useEffect(() => {
    const fetchAdmins = async () => {
      const adminList = await getAdminEmails();
      setAdmins(adminList);
    };
    fetchAdmins();
  }, []);

  // Check if logged-in user is an admin
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
        const isAdmin = admins.includes(user.email);
        setAdmin(isAdmin);
        fetchNickname(user.uid, isAdmin); // Fetch nickname
      } else {
        setUid(null);
        setAdmin(false);
        setNickname("Anonymous");
      }
    });

    return () => unsubscribeAuth();
  }, [admins]); // Runs when `admins` updates

  // Fetch nickname from Firestore (or set to "Admin" if user is admin)
  const fetchNickname = async (userUid, isAdmin) => {
    if (isAdmin) {
      setNickname("Admin");
      return;
    }

    const nicknameDocRef = doc(db, "nicknames", userUid);
    const nicknameDoc = await getDoc(nicknameDocRef);

    if (nicknameDoc.exists()) {
      setNickname(nicknameDoc.data().nickname);
    } else {
      setNickname("Anonymous"); // Set to default
      await setDoc(nicknameDocRef, { nickname: "Anonymous" }); // Save to Firestore
    }
  };

  // Fetch messages from Firestore in real-time
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, []);

  // Scroll to the bottom when messages update
  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle message editing
  const handleEditMessage = (message) => {
    setEditMessageData(message);
  };

  // Handle nickname change
  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  // Save nickname to Firestore on "Enter"
  const handleNicknameKeyPress = async (e) => {
    if (e.key === "Enter" && nickname.trim() !== "") {
      e.preventDefault();
      if (nickname === "Admin") {
        alert("No puedes poner ese nickname.");
        return;
      }

      const nicknameDocRef = doc(db, "nicknames", uid);
      await setDoc(nicknameDocRef, { nickname }, { merge: true });

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
          maxLength={20}
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
