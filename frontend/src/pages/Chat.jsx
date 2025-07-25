import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Connect to backend
const socket = io("http://localhost:3001");

export default function ChatApp() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const endRef = useRef();

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("message");
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (input.trim()) {
      socket.emit("message", input);
      setInput("");
    }
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>💬 Anonymous Chat</h2>
      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div key={i} style={styles.messageContainer}>
            <div style={styles.bubble}>{msg}</div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your message..."
        />
        <button onClick={send} style={styles.button}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "1rem",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "Segoe UI, sans-serif",
  },
  title: {
    textAlign: "center",
    color: "#444",
    marginBottom: "1rem",
  },
  chatBox: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "1rem",
    height: "300px",
    overflowY: "auto",
    backgroundColor: "#f2f2f2",
    marginBottom: "1rem",
  },
  messageContainer: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "0.5rem",
  },
  bubble: {
    maxWidth: "70%",
    padding: "0.6rem 1rem",
    backgroundColor: "#e0f7fa",
    borderRadius: "20px",
    fontSize: "1rem",
    color: "#333",
    wordBreak: "break-word",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  inputArea: {
    display: "flex",
    gap: "0.5rem",
  },
  input: {
    flex: 1,
    padding: "0.7rem",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    padding: "0.7rem 1.2rem",
    fontSize: "1rem",
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
