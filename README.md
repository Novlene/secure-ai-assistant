# 🛡️ SecureAI Assistant

> Production-ready Enterprise AI Assistant with Hybrid RAG, JWT Authentication, and Advanced Logging.

## 🔗 Live Demo
- **API Docs**: http://localhost:8000/docs (run locally)

## 🎯 What it does

SecureAI Assistant is a secure AI-powered document assistant for enterprises.
Upload internal documents (PDFs) and ask questions — the system retrieves relevant
passages and generates accurate answers using LLaMA via Groq.

**No hallucination** — answers are strictly based on your documents.

## 🏗️ Architecture
## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| Vector Store | FAISS |
| Embeddings | HuggingFace (all-MiniLM-L6-v2) |
| LLM | Groq LLaMA-3.3-70b |
| Auth | JWT (python-jose + bcrypt) |
| Logging | Python logging (JSON format) |
| Containerization | Docker |

## 🔐 Security

- JWT token authentication on all endpoints
- Password hashing with bcrypt
- PDF-only file validation
- Logs track every request (user, question, response time)

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Novlene/secure-ai-assistant.git
cd secure-ai-assistant
```

### 2. Create virtual environment
```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3. Create .env file
### 4. Run the server
```bash
cd backend
uvicorn main:app --reload
```

### 5. Or run with Docker
```bash
docker build -t secureai .
docker run -p 8000:8000 --env-file .env secureai
```

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /token | ❌ | Login → get JWT token |
| GET | /me | ✅ | Get current user |
| POST | /upload | ✅ | Upload and index a PDF |
| POST | /chat | ✅ | Ask a question |
| GET | /health | ❌ | Health check |

## 📊 Logging

Every request is logged in `backend/logs/app.log`:
```json
{
  "timestamp": "2026-06-13T18:02:44",
  "username": "admin",
  "question": "What are the skills of this person?",
  "answer_length": 817,
  "response_time_seconds": 6.2
}
```

## 👩‍💻 Author

**Nouvlaine Ghzaiel** — AI Engineer  
[LinkedIn](https://linkedin.com/in/nouvlaine-ghzaiel) · [GitHub](https://github.com/Novlene)