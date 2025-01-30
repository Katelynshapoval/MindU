import React, { useEffect, useState, useRef } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { MdComment } from "react-icons/md";
import "../css/tips.css";
import { FaCircleArrowUp } from "react-icons/fa6";
import { AiOutlineClose } from "react-icons/ai";

function Tips() {
  const [uid, setUid] = useState(null); // Store the user's UID
  const [tips, setTips] = useState([]);
  const [newTip, setNewTip] = useState({
    Name: "",
    Description: "",
    Creator: "",
  });
  const [editingTipId, setEditingTipId] = useState(null); // Track the tip being edited
  const [commentsVisible, setCommentsVisible] = useState(null);
  const [openedComment, setOpenedComment] = useState({});
  const [comments, setComments] = useState([]);

  // Ref for the comment input field
  const commentInputRef = useRef(null);
  const commentMenuRef = useRef(null);
  const [newComment, setNewComment] = useState("");
  // Track the user's authentication state and UID
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUid(user ? user.uid : null);
    });
    return () => unsubscribeAuth();
  }, []);

  // Listen for real-time updates to the "tips" collection
  useEffect(() => {
    const unsubscribeTips = onSnapshot(
      collection(db, "tips"),
      (querySnapshot) => {
        const tipsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTips(tipsList);
      },
      (error) => {
        console.error("Error listening for tips changes:", error);
      }
    );
    const unsubscribeComments = onSnapshot(
      query(collection(db, "comments"), orderBy("createdAt", "asc")),
      (querySnapshot) => {
        const commentsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsList);
      },
      (error) => {
        console.error("Error listening for comments changes:", error);
      }
    );

    const handleClickOutside = (event) => {
      if (
        commentMenuRef.current && // Ensure sidebar ref is initialized
        !commentMenuRef.current.contains(event.target) // Check if the click is outside the sidebar
      ) {
        setCommentsVisible(false); // Close the comments
      }
    };

    // Attach event listener to document
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      unsubscribeTips();
      unsubscribeComments();
      document.removeEventListener("mousedown", handleClickOutside);
    }; // Cleanup listener on unmount
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTip((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Focus the input field when the comment section is opened
  useEffect(() => {
    if (commentsVisible && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [commentsVisible]);

  // Handle adding or updating a tip
  const handleAddOrUpdateTip = async (e) => {
    e.preventDefault();

    // Ensure required fields are filled
    if (!uid) {
      alert("You must be logged in to add tips.");
      return;
    }

    if (!newTip.Name || !newTip.Description) {
      alert("Please fill out all fields!");
      return;
    }

    try {
      if (editingTipId) {
        // Update existing tip
        const tipRef = doc(db, "tips", editingTipId);
        await updateDoc(tipRef, { ...newTip, Creator: uid });
        setEditingTipId(null);
      } else {
        // Add new tip
        const tipWithCreator = { ...newTip, Creator: uid };
        await addDoc(collection(db, "tips"), tipWithCreator);
      }

      // Reset the form
      setNewTip({ Name: "", Description: "", Creator: "" });
    } catch (error) {
      console.error("Error adding/updating tip:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new lines in textarea
      handleAddOrUpdateTip(e);
    }
  };

  // Delete tip
  const deleteTip = async (id) => {
    try {
      await deleteDoc(doc(db, "tips", id));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const editTip = async (id) => {
    const tipToEdit = tips.find((tip) => tip.id === id);
    if (tipToEdit) {
      setNewTip({
        Name: tipToEdit.Name,
        Description: tipToEdit.Description,
        Creator: tipToEdit.Creator,
      });
      setEditingTipId(id);
    }
  };

  const sendComment = async (e) => {
    e.preventDefault(); // Prevent form default submission behavior
    if (newComment.trim() === "") {
      // Ensure comment is not empty
      alert("Enter valid comment");
      return;
    }
    const { uid, displayName, photoURL } = auth.currentUser;
    const localTimestamp = Timestamp.now();
    await addDoc(collection(db, "comments"), {
      text: newComment,
      createdAt: localTimestamp, // Temporary local timestamp
      uid: uid, // User ID
      tipId: openedComment.id,
    });
    setNewComment("");
  };

  return (
    <div className="tips">
      <h1>Tips</h1>
      <div className="tipCardContainer">
        {tips.length === 0 && !uid ? (
          <p>No tips available</p>
        ) : (
          tips.map((tip) => (
            <div key={tip.id} className="tipCard">
              <div className="tipCardText">
                <h2>{tip.Name}</h2>
                <p>{tip.Description}</p>
              </div>
              {uid === tip.Creator && (
                <div className="tipCardButtons">
                  <button className="iconTip" onClick={() => deleteTip(tip.id)}>
                    <MdDelete size={20} />
                  </button>
                  <button className="iconTip" onClick={() => editTip(tip.id)}>
                    <MdEdit size={20} />
                  </button>
                  <button
                    className="iconTip"
                    onClick={() => {
                      setCommentsVisible(true);
                      setOpenedComment(tip);
                    }}
                  >
                    <MdComment size={20} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        {uid && (
          <div className="addTip tipCard">
            <h2>{editingTipId ? "Edit Tip" : "Add a New Tip"}</h2>
            <form onSubmit={handleAddOrUpdateTip} autoComplete="off">
              <input
                type="text"
                name="Name"
                placeholder="Tip Name"
                value={newTip.Name}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown} // Listen for Enter key
              />

              <textarea
                name="Description"
                placeholder="Tip Description"
                value={newTip.Description}
                onChange={handleInputChange}
                maxLength={300}
                onKeyDown={handleKeyDown} // Listen for Enter key
              ></textarea>
            </form>
          </div>
        )}
      </div>
      {commentsVisible && (
        <div className="commentsContainer" ref={commentMenuRef}>
          <div className="commentsHeader">
            <p>{openedComment.Name}</p>
            <button
              id="closeComments"
              onClick={() => {
                setCommentsVisible(false);
                setOpenedComment(null);
              }}
            >
              <AiOutlineClose />
            </button>
          </div>
          <div className="chatComments">
            {comments
              ?.filter((comment) => comment.tipId === openedComment.id)
              .map((comment) => (
                <p key={comment.id}>{comment.text}</p>
              ))}
          </div>
          <form
            onSubmit={sendComment}
            className="commentInput"
            autoComplete="off"
          >
            <input
              ref={commentInputRef}
              onChange={(e) => setNewComment(e.target.value)}
              value={newComment}
            ></input>
            <button type="submit" id="sendComment">
              <FaCircleArrowUp />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Tips;
