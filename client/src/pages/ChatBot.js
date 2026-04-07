import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import { FaRobot } from "react-icons/fa";

function ChatBotMUI() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initVoiceRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support voice input.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = { type: "user", text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVICE_URL || 'http://localhost:5001'}/generate_response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await response.json();

      if (response.ok) {
        const botMessage = { type: "bot", text: data.text };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: isMobile ? "95%" : "80%",
        margin: "20px auto",
        padding: isMobile ? 1 : 2,
        display: "flex",
        flexDirection: "column",
        height: isMobile ? "85vh" : "80vh",
        maxHeight: "90vh",
        fontFamily: "'Roboto', sans-serif", // Changed font
      }}
    >
      <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: 2, textAlign: "center", fontFamily: "'Roboto', sans-serif" }}>
        <FaRobot style={{ verticalAlign: "middle", marginRight: 8 }} />
        Chat Here
      </Typography>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          mb: 2,
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? 0.5 : 1,
        }}
      >
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.type === "user" ? "#1976d2" : "#e0e0e0",
              color: msg.type === "user" ? "white" : "black",
              borderRadius: 2,
              padding: isMobile ? 1 : 1.5,
              maxWidth: "75%",
              wordBreak: "break-word",
              fontSize: isMobile ? "0.9rem" : "1rem",
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            {msg.text}
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 1, fontSize: isMobile ? "0.85rem" : "1rem" }}>
          {error}
        </Typography>
      )}

      {/* Chat Input aligned straight */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          multiline
          maxRows={4}
          variant="outlined"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          fullWidth
          size={isMobile ? "small" : "medium"}
          sx={{ fontFamily: "'Roboto', sans-serif" }}
        />
        <IconButton onClick={initVoiceRecognition} color="primary" size={isMobile ? "small" : "medium"}>
          <MicIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
        <Button
          variant="contained"
          endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          onClick={handleSend}
          disabled={loading}
          size={isMobile ? "small" : "medium"}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
}

export default ChatBotMUI;
