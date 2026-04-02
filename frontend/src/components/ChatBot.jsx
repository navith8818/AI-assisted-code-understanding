import { useEffect, useRef, useState } from "react";
import aiIcon from "../assets/icon-AI.png";
import sendMailIcon from "../assets/send-mail.svg";

// Function to render markdown-like formatting
const renderMessageContent = (text) => {
  // Split by lines first
  const lines = text.split("\n");
  const elements = [];

  lines.forEach((line, lineIndex) => {
    // Handle headers (##, ###, etc.)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const fontSize = 16 - level;
      elements.push(
        <div key={`header-${lineIndex}`} style={{ marginTop: "8px", marginBottom: "4px" }}>
          <strong style={{ fontSize: `${fontSize}px`, color: "#E34D00" }}>
            {headerMatch[2]}
          </strong>
        </div>
      );
      return;
    }

    // Handle code blocks (```code```)
    if (line.trim().startsWith("```") || line.trim().endsWith("```")) {
      elements.push(
        <div
          key={`code-${lineIndex}`}
          style={{
            background: "#0a0a0d",
            padding: "4px 6px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "0.85rem",
            color: "#00ff00",
            marginBottom: "4px",
            overflowX: "auto",
          }}
        >
          {line.replace(/```/g, "")}
        </div>
      );
      return;
    }

    // Handle bullet points
    if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
      elements.push(
        <div key={`bullet-${lineIndex}`} style={{ marginLeft: "16px", marginBottom: "4px" }}>
          {line}
        </div>
      );
      return;
    }

    // Handle bold text (**text**)
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const lineParts = parts.map((part, partIndex) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={`${lineIndex}-${partIndex}`} style={{ color: "#E34D00" }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    // Add line with proper spacing
    if (line.trim() === "") {
      elements.push(<div key={`empty-${lineIndex}`} style={{ height: "8px" }} />);
    } else {
      elements.push(
        <div key={`line-${lineIndex}`} style={{ marginBottom: "6px", lineHeight: "1.5" }}>
          {lineParts}
        </div>
      );
    }
  });

  return elements;
};

const initialMessages = [
  {
    id: 1,
    sender: "gemini",
    text: "Hi there! I'm FlowGen Assistant, powered by Gemini AI. Ask me anything about this platform, code analysis, or how to use our visualization tools!",
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsOpen(true);
    setIsLoading(true);
    setError(null);

    try {
      // Call backend chat endpoint (no authentication required)
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: userMessage.text,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      const botMessage = {
        id: Date.now() + 1,
        sender: "gemini",
        text: data.response || "Sorry, I couldn't process that request.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorText = err.message || "Failed to get response from AI assistant";
      setError(errorText);
      const errorMessage = {
        id: Date.now() + 1,
        sender: "gemini",
        text: `❌ Error: ${errorText}. Please check your connection and try again.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadingMessage = () => {
    if (isLoading) {
      return (
        <div style={{ ...styles.message, ...styles.geminiBubble }}>
          <span style={styles.sender}>Gemini</span>
          <span style={styles.text}>
            <span style={styles.loadingDot}>●</span>
            <span style={styles.loadingDot}>●</span>
            <span style={styles.loadingDot}>●</span>
          </span>
        </div>
      );
    }
    return null;
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
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          style={{
            ...styles.bottomSendButton,
            ...(isSendHover ? styles.bottomSendButtonHover : {}),
            ...(isLoading ? styles.bottomSendButtonDisabled : {}),
          }}
          onMouseEnter={() => !isLoading && setIsSendHover(true)}
          onMouseLeave={() => setIsSendHover(false)}
          disabled={isLoading}
        >
          <img src={sendMailIcon} alt="Send" style={styles.sendIcon} />
        </button>
      </form>

      {isOpen && (
        <div style={styles.overlay}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span>FlowGen AI Assistant</span>
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
                  <div style={styles.text}>
                    {message.sender === "gemini"
                      ? renderMessageContent(message.text)
                      : message.text}
                  </div>
                </div>
              ))}
              {handleLoadingMessage()}
              <div ref={messagesEndRef} />
            </div>
            <form style={styles.form} onSubmit={handleSend}>
              <input
                style={styles.input}
                type="text"
                value={input}
                placeholder="Ask about the site..."
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" style={{
                ...styles.button,
                ...(isLoading ? styles.buttonDisabled : {}),
              }} disabled={isLoading}>
                {isLoading ? "..." : "Send"}
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
    wordWrap: "break-word",
    overflowWrap: "break-word",
  },
  userBubble: {
    alignSelf: "flex-end",
    background: "#e34c00e1",
    color: "#fff",
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
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
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
    background: "#E34D00",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "bold",
    padding: "0 16px",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  bottomSendButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  loadingDot: {
    animation: "pulse 1.4s infinite",
    marginRight: "2px",
  },
};
