import { useEffect, useRef, useState } from "react";
import aiIcon from "../assets/icon-AI.png";
import sendMailIcon from "../assets/send-mail.svg";

const initialMessages = [
  {
    id: 1,
    sender: "gemini",
    text: "Hi there! I’m Gemini Free Chat. Ask me anything about this website.",
  },
];

const getBotResponse = (input) => {
  const normalized = input.trim().toLowerCase();
  if (!normalized) {
    return "Please type a question so I can help you.";
  }
  if (/(feature|capability|what can you do)/i.test(normalized)) {
    return "This site analyzes source code and provides rapid insights in a dashboard. Use the upload and visualize sections to inspect functions, dependencies, and metrics.";
  }
  if (/(upload|file|source|code)/i.test(normalized)) {
    return "You can upload code files (or whole folders) in the Upload section, then the analyzer extracts structure and metrics automatically.";
  }
  if (/(auth|login|register)/i.test(normalized)) {
    return "For account actions, go to Login/Register pages. Login allows access to saved projects and history.";
  }
  if (/(support|help|docs)/i.test(normalized)) {
    return "Use the Help page to see guides. For developer questions, you can reach out through the app contact section if available.";
  }
  if (/(speed|performance)/i.test(normalized)) {
    return "Analysis is designed to be fast with incremental parsing. Large projects may take a few moments, but you’ll see results in seconds for typical web codebases.";
  }

  return "Gemini says: I’m a local free helper. This site parses code; try asking about uploads, features, or how to use the dashboard.";
};

export default function ChatBot() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSendHover, setIsSendHover] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsOpen(true);

    const botText = getBotResponse(input);
    const botMessage = { id: Date.now() + 1, sender: "gemini", text: botText };
    setTimeout(() => {
      setMessages((prev) => [...prev, botMessage]);
    }, 300);
  };

  return (
    <>
      <form style={styles.bottomBar} onSubmit={handleSend}>
        <div style={styles.bottomInputWrapper}>
          <img src={aiIcon} alt="AI" style={styles.bottomIcon} />
          <input
            style={styles.bottomInput}
            type="text"
            value={input}
            placeholder="Ask about the site..."
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <button
          type="submit"
          style={{
            ...styles.bottomSendButton,
            ...(isSendHover ? styles.bottomSendButtonHover : {}),
          }}
          onMouseEnter={() => setIsSendHover(true)}
          onMouseLeave={() => setIsSendHover(false)}
        >
          <img src={sendMailIcon} alt="Send" style={styles.sendIcon} />
        </button>
      </form>

      {isOpen && (
        <div style={styles.overlay}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span>Gemini Free Chat</span>
              <button
                style={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Minimize chat"
              >
                —
              </button>
            </div>
            <div style={styles.messageWindow}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={
                    message.sender === "user"
                      ? { ...styles.message, ...styles.userBubble }
                      : { ...styles.message, ...styles.geminiBubble }
                  }
                >
                  <span style={styles.sender}>
                    {message.sender === "user" ? "You" : "Gemini"}
                  </span>
                  <span style={styles.text}>{message.text}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form style={styles.form} onSubmit={handleSend}>
              <input
                style={styles.input}
                type="text"
                value={input}
                placeholder="Ask about the site..."
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" style={styles.button}>
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  bottomBar: {
    position: "fixed",
    bottom: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "80%",
    height: "60px",
    zIndex: 9999,
    background: "#0f0f13",
    border: "1px solid #333333fb",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    boxSizing: "border-box",
  },
  bottomInputWrapper: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    marginRight: "8px",
  },
  bottomIcon: {
    width: "20px",
    height: "20px",
    marginRight: "4px",
  },
  bottomInput: {
    flex: 1,
    height: "55px",
    minHeight: "16px",
    border: "none",
    borderRadius: "6px",
    background: "#0f0f13",
    color: "#fff",
    fontSize: "15px",
    padding: "2px 10px",
    outline: "none",
  },
  bottomSendButton: {
    marginLeft: "8px",
    height: "25px",
    minWidth: "45px",
    border: "2px solid transparent",
    borderRadius: "6px",
    background: "#E34D00",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "border 0.25s ease, box-shadow 0.25s ease",
  },
  bottomSendButtonHover: {
    border: "2px solid rgba(255,255,255,0.95)",
  },
  sendIcon: {
    width: "14px",
    height: "14px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9998,
    padding: "20px",
  },
  panel: {
    width: "100%",
    maxWidth: "620px",
    height: "80vh",
    background: "#1f1f23",
    border: "1px solid #333",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "#111",
    borderBottom: "1px solid #2d2d33",
    color: "#f6f6f6",
    fontWeight: "bold",
  },
  closeButton: {
    border: "none",
    background: "transparent",
    color: "#f6f6f6",
    fontSize: "20px",
    cursor: "pointer",
    lineHeight: 1,
  },
  messageWindow: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    background: "#101014",
  },
  message: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "10px",
    padding: "8px 10px",
    borderRadius: "10px",
    maxWidth: "85%",
  },
  userBubble: {
    alignSelf: "flex-end",
    background: "#44d7b6",
    color: "#111",
  },
  geminiBubble: {
    alignSelf: "flex-start",
    background: "#292b32",
    color: "#f6f6f6",
  },
  sender: {
    fontSize: "0.7rem",
    marginBottom: "4px",
    opacity: 0.8,
  },
  text: {
    fontSize: "0.95rem",
    lineHeight: 1.4,
  },
  form: {
    display: "flex",
    gap: "8px",
    padding: "10px",
    borderTop: "1px solid #2d2d33",
    background: "#111",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #333",
    borderRadius: "8px",
    background: "#0f0f13",
    color: "#fff",
    outline: "none",
  },
  button: {
    background: "#44d7b6",
    border: "none",
    borderRadius: "8px",
    color: "#111",
    fontWeight: "bold",
    padding: "0 16px",
    cursor: "pointer",
  },
};
