from dotenv import load_dotenv
import os

load_dotenv()
print("🔐 GEMINI_API_KEY:", os.getenv("GEMINI_API_KEY"))
print("🔐 PEXELS_API_KEY:", os.getenv("PEXELS_API_KEY"))
