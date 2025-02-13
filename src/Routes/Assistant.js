import { useState, useEffect, useRef } from "react";
import { FaCircleArrowUp } from "react-icons/fa6";
import "../css/assistant.css";

function Assistant() {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [chatInputs, setChatInputs] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple submissions
  const scrollToEnd = useRef(null); // Reference to scroll to the bottom of the chat feed
  const sendMessageInputRef = useRef(null); // for autofocus

  const createNewChat = () => {
    setMessage(null);
    setValue(""); // Clear the input value
    setCurrentTitle(null);
  };

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    // Set the input value to the previously stored value for the selected chat
    setValue(chatInputs[uniqueTitle] || "");
  };

  const getMessages = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    if (!value.trim()) {
      alert("Introduzca un mensaje válido.");
      return;
    } // Prevent sending empty messages

    setIsSubmitting(true); // Disable further submissions

    const options = {
      method: "POST",
      body: JSON.stringify({
        message: value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(
        "http://localhost:8000/completions",
        options
      );
      const data = await response.json();

      // Handle new message
      const newMessage = data.choices[0].message;

      // Set the message and append it to the previous chats
      setMessage(newMessage);

      // Update previous chats
      setPreviousChats((prevChats) => [
        ...prevChats,
        { title: currentTitle || value, role: "user", content: value },
        {
          title: currentTitle || value,
          role: newMessage.role,
          content: newMessage.content,
        },
      ]);

      // Save the chat input and clear the input field for the current session
      setChatInputs((prevInputs) => ({
        ...prevInputs,
        [currentTitle || value]: "", // Store empty value after sending
      }));

      setCurrentTitle((prevTitle) => prevTitle || value); // Update the title

      // Clear the value to reset the input
      setValue(""); // Clear the input field after submitting the message
    } catch (error) {
      console.error(error);
    }

    setIsSubmitting(false); // Re-enable submission after sending
  };

  useEffect(() => {
    // Debugging logs
    console.log("Current Title:", currentTitle);
    console.log("Value:", value);
    console.log("Message:", message);
    console.log("Previous Chats:", previousChats);
  }, [message, currentTitle]);

  useEffect(() => {
    // Scroll to the bottom of the chat feed whenever messages update
    if (scrollToEnd.current) {
      scrollToEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [previousChats]); // Depend on previousChats state to trigger scrolling when a new message is added

  // Autofocus on input
  useEffect(() => {
    sendMessageInputRef.current.focus();
  }, []);

  const currentChat = previousChats.filter(
    (previousChat) => previousChat.title === currentTitle
  );

  const uniqueTitles = Array.from(
    new Set(previousChats.map((previousChat) => previousChat.title))
  );

  return (
    <div className="assistant">
      {/* <section className="side-bar-assistant">
        <button id="newChat" onClick={createNewChat}>
          New chat
        </button>
        <ul className="history">
          {uniqueTitles?.map((uniqueTitle, index) => (
            <li key={index} onClick={() => handleClick(uniqueTitle)}>
              {uniqueTitle}
            </li>
          ))}
        </ul>
      </section> */}
      <section className="main">
        {!currentTitle && (
          <h1 style={{ color: "#000000" }}>¡Hola, soy Anima!</h1>
        )}
        <ul className="feed">
          {currentChat?.map((chatMessage, index) => (
            <li key={index}>
              <p className="role">
                {chatMessage.role === "user" ? "Tú" : "Anima"}
              </p>
              <p>{chatMessage.content}</p>
            </li>
          ))}
          <div ref={scrollToEnd}></div> {/* The scroll reference */}
        </ul>
        <div className="bottom-section">
          <div className="inputContainer">
            <input
              id="userInput"
              placeholder="¿Cómo te sientes hoy?"
              autoComplete="off"
              maxLength={300}
              value={value} // Bind the value of input to the state
              onChange={(e) => setValue(e.target.value)} // Update state on change
              onKeyDown={(e) => {
                if (e.key === "Enter") getMessages(); // Allow submitting on Enter
              }}
              ref={sendMessageInputRef}
            />
            <div id="submit" onClick={getMessages}>
              <FaCircleArrowUp />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Assistant;
