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
  // State management
  const [comments, setComments] = useState([]); // Stores fetched comments
  const [newComment, setNewComment] = useState(""); // Stores input field value
  const [uid, setUid] = useState(null); // Stores user ID
  const [loading, setLoading] = useState(false); // New state to prevent multiple submissions

  // Refs for UI interactions
  const commentInputRef = useRef(null);
  const commentMenuRef = useRef(null);
  const scroll = useRef(null);

  // Fetch comments in real-time
  useEffect(() => {
    const commentsQuery = query(
      collection(db, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribeComments = onSnapshot(
      commentsQuery,
      (querySnapshot) => {
        const commentsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsList);
      },
      (error) => console.error("Error fetching comments:", error)
    );

    const unsubscribeAuth = auth.onAuthStateChanged((user) =>
      setUid(user ? user.uid : null)
    );

    return () => {
      unsubscribeComments();
      unsubscribeAuth();
    };
  }, []);

  // Scroll to the latest comment
  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

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
    commentInputRef.current?.focus();
  }, []);

  // Handle sending comment
  const sendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || loading) {
      alert("Ingrese un comentario válido.");
      return;
    }
    setLoading(true); // Prevent multiple clicks

    try {
      await addDoc(collection(db, "comments"), {
        text: newComment,
        createdAt: Timestamp.now(),
        uid,
        tipId: tip.id,
      });

      setNewComment(""); // Clear input field after submitting
    } catch (error) {
      console.error("Error al enviar el comentario:", error);
    }
    setLoading(false); // Re-enable after submission
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
        {comments.filter((comment) => comment.tipId === tip.id).length === 0 ? (
          <p id="noCommentsText">No hay comentarios</p>
        ) : (
          comments
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
            ))
        )}
        <div ref={scroll}></div>
      </div>
      {uid && (
        <form
          onSubmit={sendComment}
          className="commentInput"
          autoComplete="off"
        >
          <input
            ref={commentInputRef}
            onChange={(e) => setNewComment(e.target.value)}
            value={newComment}
            maxLength={300}
            placeholder="Escribe tu comentario..."
          />
          <button type="submit" id="sendComment">
            <FaCircleArrowUp />
          </button>
        </form>
      )}
    </div>
  );
}

export default Comments;
