import React, { useEffect, useState, useRef } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { AiOutlineClose } from "react-icons/ai";
import { FaCircleArrowUp } from "react-icons/fa6";

function Comments({ tip, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const commentInputRef = useRef(null);
  const commentMenuRef = useRef(null);
  const [uid, setUid] = useState(null);
  const scroll = useRef(); // Reference to scroll to the bottom of the chat

  // Fetch comments in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "comments"), orderBy("createdAt", "asc")),
      (querySnapshot) => {
        const commentsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsList);
      },
      (error) => {
        console.error("Error fetching comments:", error);
      }
    );
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUid(user ? user.uid : null);
    });

    return () => {
      unsubscribe();
      unsubscribeAuth();
    };
  }, []);

  // Effect to scroll to the bottom when messages update
  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]); // Depend on messages state

  // Close comments when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        commentMenuRef.current &&
        !commentMenuRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Focus input field when comments open
  useEffect(() => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, []);

  // Handle sending comment
  const sendComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") {
      alert("Enter a valid comment");
      return;
    }

    const { uid } = auth.currentUser;
    await addDoc(collection(db, "comments"), {
      text: newComment,
      createdAt: Timestamp.now(),
      uid,
      tipId: tip.id,
    });

    setNewComment("");
  };

  return (
    <div className="commentsContainer" ref={commentMenuRef}>
      <div className="commentsHeader">
        <p>{tip.Name}</p>
        <button id="closeComments" onClick={onClose}>
          <AiOutlineClose />
        </button>
      </div>
      <div className="chatComments">
        {comments
          .filter((comment) => comment.tipId === tip.id)
          .map((comment) => (
            <p
              key={comment.id}
              className={`comment-bubble ${
                comment.uid === uid ? "right-comment" : ""
              }`}
            >
              {comment.text}
            </p>
          ))}
        <div ref={scroll}></div>
      </div>
      <form onSubmit={sendComment} className="commentInput" autoComplete="off">
        <input
          ref={commentInputRef}
          onChange={(e) => setNewComment(e.target.value)}
          value={newComment}
        />
        <button type="submit" id="sendComment">
          <FaCircleArrowUp />
        </button>
      </form>
    </div>
  );
}

export default Comments;
