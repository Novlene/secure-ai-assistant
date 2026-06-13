import os
import pickle
from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

VECTORS_PATH = "rag/vectors"

def extract_text_from_pdf(file_path: str) -> str:
    """Lit le PDF et extrait tout le texte"""
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def split_text(text: str) -> list:
    """Découpe le texte en morceaux de 500 caractères"""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    return splitter.split_text(text)

def create_vector_store(chunks: list):
    """Transforme les morceaux en vecteurs et les stocke dans FAISS"""
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )
    vector_store = FAISS.from_texts(chunks, embeddings)
    os.makedirs(VECTORS_PATH, exist_ok=True)
    vector_store.save_local(VECTORS_PATH)
    return vector_store

def load_vector_store():
    """Charge les vecteurs depuis le disque"""
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )
    return FAISS.load_local(
        VECTORS_PATH, 
        embeddings,
        allow_dangerous_deserialization=True
    )

def index_pdf(file_path: str):
    """Fonction principale : PDF → vecteurs"""
    text = extract_text_from_pdf(file_path)
    chunks = split_text(text)
    create_vector_store(chunks)
    return len(chunks)

from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

def answer_question(question: str) -> dict:
    """Cherche dans FAISS et génère une réponse avec Groq"""
    vector_store = load_vector_store()
    docs = vector_store.similarity_search(question, k=3)
    context = "\n".join([doc.page_content for doc in docs])
    
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "Tu es un assistant qui répond uniquement basé sur le contexte fourni. Si la réponse n'est pas dans le contexte, dis-le clairement."
            },
            {
                "role": "user",
                "content": f"Contexte:\n{context}\n\nQuestion: {question}"
            }
        ]
    )
    
    return {
        "question": question,
        "answer": response.choices[0].message.content,
        "source_chunks": len(docs)
    }