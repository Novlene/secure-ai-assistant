import { useState } from "react";

const API = "http://localhost:8000";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch(`${API}/token`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      onLogin(data.access_token);
    } else {
      setError("Identifiants incorrects");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🛡️ SecureAI Assistant</h1>
        <p style={styles.subtitle}>Enterprise Document Intelligence</p>
        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

function Chat({ token }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setUploadStatus(`✅ ${data.filename} indexé (${data.chunks} chunks)`);
    } else {
      setUploadStatus("❌ Erreur upload");
    }
  };

  const handleAsk = async () => {
    if (!question) return;
    setLoading(true);
    const userMsg = { role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");

    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.answer, time: data.response_time },
      ]);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatContainer}>
        <h2 style={styles.title}>🛡️ SecureAI Assistant</h2>

        {/* Upload */}
        <div style={styles.uploadBox}>
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
          <button style={styles.button} onClick={handleUpload}>Upload PDF</button>
          {uploadStatus && <p style={styles.uploadStatus}>{uploadStatus}</p>}
        </div>

        {/* Messages */}
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={msg.role === "user" ? styles.userMsg : styles.aiMsg}>
              <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.text}
              {msg.time && <span style={styles.time}> ({msg.time}s)</span>}
            </div>
          ))}
          {loading && <div style={styles.aiMsg}>AI is thinking...</div>}
        </div>

        {/* Input */}
        <div style={styles.inputRow}>
          <input
            style={{ ...styles.input, flex: 1 }}
            placeholder="Ask a question about your documents..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          />
          <button style={styles.button} onClick={handleAsk}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  return token ? <Chat token={token} /> : <Login onLogin={setToken} />;
}

const styles = {
  container: { minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" },
  card: { background: "#1e293b", padding: 40, borderRadius: 12, width: 380, display: "flex", flexDirection: "column", gap: 16 },
  chatContainer: { background: "#1e293b", padding: 24, borderRadius: 12, width: 700, display: "flex", flexDirection: "column", gap: 16 },
  title: { color: "#f1f5f9", textAlign: "center", margin: 0 },
  subtitle: { color: "#94a3b8", textAlign: "center", margin: 0 },
  input: { padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9", fontSize: 14, outline: "none" },
  button: { padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
  error: { color: "#ef4444", margin: 0 },
  uploadBox: { display: "flex", gap: 12, alignItems: "center", background: "#0f172a", padding: 12, borderRadius: 8 },
  uploadStatus: { color: "#94a3b8", margin: 0, fontSize: 13 },
  messages: { minHeight: 300, maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 },
  userMsg: { background: "#3b82f6", color: "white", padding: "10px 14px", borderRadius: 8, alignSelf: "flex-end", maxWidth: "80%" },
  aiMsg: { background: "#334155", color: "#f1f5f9", padding: "10px 14px", borderRadius: 8, alignSelf: "flex-start", maxWidth: "80%" },
  inputRow: { display: "flex", gap: 12 },
  time: { fontSize: 11, opacity: 0.7 },
};