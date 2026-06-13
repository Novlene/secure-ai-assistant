import logging
import time
import json
from datetime import datetime

# Configuration du logger
logging.basicConfig(
    filename="logs/app.log",
    level=logging.INFO,
    format="%(asctime)s - %(message)s"
)

logger = logging.getLogger(__name__)

def log_request(username: str, question: str, answer: str, response_time: float):
    """Log chaque requête avec tous les détails"""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "username": username,
        "question": question,
        "answer_length": len(answer),
        "response_time_seconds": round(response_time, 2)
    }
    logger.info(json.dumps(log_entry, ensure_ascii=False))
    return log_entry