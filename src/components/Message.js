import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, deleteDoc, setDoc } from "firebase/firestore";
import { MdEdit, MdDelete, MdBlock } from "react-icons/md";
import { getAdminEmails } from "./getAdminEmails";

const Message = ({ message, onEdit }) => {
  // User-related states
  const [user] = useAuthState(auth);
  const isUserMessage = user?.uid === message.uid;

  // Admin status
  const [admin, setAdmin] = useState(false);

  // Fetch admin list and check if user is an admin
  useEffect(() => {
    const fetchAdmins = async () => {
      if (user) {
        const adminList = await getAdminEmails();
        setAdmin(adminList.includes(user.email));
      }
    };
    fetchAdmins();
  }, [user]);

  // Function to delete the message
  const deleteMessage = async () => {
    if (window.confirm("¿Seguro que quieres borrar este mensaje?")) {
      try {
        await deleteDoc(doc(db, "messages", message.id));
      } catch (error) {
        console.error("Error deleting message: ", error);
      }
    }
  };

  // Function to mute a user for 1 minute
  const muteUser = async (userId) => {
    if (!admin) return;

    const muteDocRef = doc(db, "mutedUsers", userId);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 1);

    await setDoc(muteDocRef, {
      uid: userId,
      expiresAt: expiresAt,
    });

    alert("El usuario ha sido silenciado por 1 minuto.");
  };

  // Function to handle editing the message
  const editMessage = () => {
    if (onEdit) {
      onEdit(message);
    }
  };

  return (
    <div className={`chat-bubble ${isUserMessage ? "right" : ""}`}>
      {(isUserMessage || admin) && (
        <div className="message-actions">
          <button onClick={editMessage}>
            <MdEdit />
          </button>
          <button onClick={deleteMessage}>
            <MdDelete />
          </button>
          {admin && !isUserMessage && (
            <button onClick={() => muteUser(message.uid)}>
              <MdBlock />
            </button>
          )}
        </div>
      )}
      <div className="chat-bubble__right">
        <p className="user-name">{message.name}</p>
        <p className="user-message">{message.text}</p>
      </div>
    </div>
  );
};

export default Message;
