import { useState, useEffect, useRef } from "react";
import { FaCircleArrowUp } from "react-icons/fa6";
import "../css/assistant.css";
import DOMPurify from "dompurify"; // Sanitize HTML, prevent from running scripts

function Assistant() {
  // Message states
  const [value, setValue] = useState("");
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [chatInputs, setChatInputs] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for scrolling and input autofocus
  const scrollToEnd = useRef(null);
  const sendMessageInputRef = useRef(null);

  // Create a new chat session
  const createNewChat = () => {
    setMessage(null);
    setValue("");
    setCurrentTitle(null);
  };

  // Handle clicking on a previous chat title
  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setValue(chatInputs[uniqueTitle] || "");
  };

  // Fetch assistant response
  const getMessages = async () => {
    if (isSubmitting || !value.trim()) {
      alert("Introduzca un mensaje válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://us-central1-mindu-app-4f9f4.cloudfunctions.net/api/completions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: value }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();

      if (!data.message) throw new Error("Invalid response structure");

      setMessage(data.message);
      setPreviousChats((prevChats) => [
        ...prevChats,
        { title: currentTitle || value, role: "user", content: value },
        {
          title: currentTitle || value,
          role: "assistant",
          content: data.message,
        },
      ]);

      setValue("");
      setCurrentTitle((prevTitle) => prevTitle || value);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Hubo un problema con la respuesta del asistente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Log debugging information
  useEffect(() => {
    console.log("Current Title:", currentTitle);
    console.log("Value:", value);
    console.log("Message:", message);
    console.log("Previous Chats:", previousChats);
  }, [message, currentTitle]);

  // Scroll to the latest message when messages update
  useEffect(() => {
    if (scrollToEnd.current) {
      scrollToEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [previousChats]);

  // Autofocus input on mount
  useEffect(() => {
    sendMessageInputRef.current.focus();
  }, []);

  // Get the current chat history
  const currentChat = previousChats.filter(
    (previousChat) => previousChat.title === currentTitle
  );

  // Get unique chat titles
  const uniqueTitles = Array.from(
    new Set(previousChats.map((previousChat) => previousChat.title))
  );

  // Function to parse and render messages
  const parseMessage = (messageContent) => {
    // Convert **text** to bold
    const boldText = messageContent.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

    // Convert URLs to clickable links
    const linkifiedText = boldText.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );

    // Sanitize HTML to prevent XSS attacks
    return DOMPurify.sanitize(linkifiedText);
  };

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
              <p
                dangerouslySetInnerHTML={{
                  __html: parseMessage(chatMessage.content),
                }}
              ></p>
            </li>
          ))}
          {isSubmitting && (
            <li className="loading-message">
              <p className="role">Anima</p>
              <p>Pensando...</p>
            </li>
          )}
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
