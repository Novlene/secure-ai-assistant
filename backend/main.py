import os
import shutil
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from auth.auth import authenticate_user, create_access_token, get_current_user
from rag.rag import index_pdf, load_vector_store

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="SecureAI Assistant",
    description="Enterprise AI Assistant with RAG",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str

@app.get("/")
def root():
    return {"message": "SecureAI Assistant is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects"
        )
    token = create_access_token(data={"sub": user["username"]})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me")
def read_me(current_user: str = Depends(get_current_user)):
    return {"username": current_user}

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Fichier PDF uniquement")
    
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    num_chunks = index_pdf(file_path)
    return {
        "message": f"PDF indexé avec succès",
        "filename": file.filename,
        "chunks": num_chunks
    }
@app.post("/chat")
async def chat(
    request: QuestionRequest,
    current_user: str = Depends(get_current_user)
):
    import time
    from monitoring.logger import log_request
    
    start_time = time.time()
    
    try:
        from rag.rag import answer_question
        result = answer_question(request.question)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    response_time = time.time() - start_time
    
    log_request(
        username=current_user,
        question=request.question,
        answer=result["answer"],
        response_time=response_time
    )
    
    result["response_time"] = round(response_time, 2)
    return result