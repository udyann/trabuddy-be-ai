import os
import faiss
import numpy as np
import re
import json
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from typing import List
from google.generativeai import configure, GenerativeModel

# ✅ 환경변수 로드 - Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is not set in the .env file.")

# ✅ Gemini API 설정 - Configure Gemini API
configure(api_key=api_key)
gemini_model = GenerativeModel("models/gemini-1.5-flash")

# ✅ 임베딩 모델 로드 - Configure Gemini API
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# ✅ 설정 - Constants
INDEX_ROOT = "embeddings"
CATEGORIES = ["contents", "historical", "preparation"]

# ✅ 질문 임베딩 - Embed user question
def embed_query(text: str) -> np.ndarray:
    embedding = model.encode([text])[0]
    return np.array([embedding], dtype=np.float32)

# ✅ 유사 문서 검색 - Search for similar documents using FAISS
def search_similar_docs(query: str, category: str, top_k: int = 3) -> List[str]:
    index_path = os.path.join(INDEX_ROOT, f"{category}.index")
    path_txt = os.path.join(INDEX_ROOT, f"{category}_paths.txt")

    if not os.path.exists(index_path) or not os.path.exists(path_txt):
        raise FileNotFoundError(f"{category} index doesn't exist")

    index = faiss.read_index(index_path)
    with open(path_txt, "r", encoding="utf-8") as f:
        id_map = [line.strip() for line in f.readlines()]

    query_vec = embed_query(query)
    distances, indices = index.search(query_vec, top_k)

    results = []
    for idx in indices[0]:
        if idx < len(id_map):
            with open(id_map[idx], "r", encoding="utf-8") as f:
                results.append(f.read().strip())

    return results

# ✅ 질문 분류 - Classify the question
def classify_question_with_gemini(question: str) -> str:
    prompt = (
        "Classify the following travel-related question into one of the following categories:\n"
        "- 'historical': if the question is about history, culture, or the past of a location.\n"
        "- 'contents': if the question is about things to do, places to visit, food, attractions, or scenery.\n"
        "- 'preparation': if the question is about what to prepare, what to bring, or travel necessities.\n\n"
        "Respond with one of the following exact words only: contents, historical, preparation.\n\n"
        f"Question: {question}"
    )
    response = gemini_model.generate_content(prompt)
    category = response.text.strip().lower()

    if category not in CATEGORIES:
        raise ValueError(f"잘못된 카테고리 반환됨: {category}")
    return category

# ✅ 답변 생성 - Generate a detailed answer
def generate_answer_with_gemini(question: str, docs: List[str]) -> str:
    context = "\n---\n".join(docs)
    full_prompt = (
        "당신은 여행 도우미입니다. 아래 문서를 참고하여 사용자의 질문에 친절하고 유용하게 답변하세요.\n"
        "만약 주어진 문서에 해당 여행지에 관한 정보가 없다면, 문서를 참고하지 말고, 스스로 생각하여 답변을 생성하세요."

        f"[사용자 질문]\n{question}\n\n"
        f"[참고 문서]\n{context}"
    )
    response = gemini_model.generate_content(full_prompt)
    return response.text.strip()

# ✅ 요약 생성 - Generate summary
def generate_summary_with_gemini(answer: str) -> str:
    prompt = (
        "You are a travel assistant. Summarize the following content in 1 to 3 sentences. "
        "Avoid using markdown, and make sure the summary includes a characteristic feature of the location with an example.\n\n"
        f"Content: {answer}"
    )
    response = gemini_model.generate_content(prompt)
    return response.text.strip()

def clean_markdown(text: str) -> str:
    return text.replace("*", "").strip()


import json
import re

# 🔧 마크다운 코드블럭(```json ... ```)만 제거
def clean_code_block_json(text: str) -> str:
    return re.sub(r"^```json\s*|\s*```$", "", text.strip(), flags=re.IGNORECASE | re.DOTALL)

# 🔧 *만 제거 (historical용)
def clean_markdown(text: str) -> str:
    return text.replace("*", "").strip()

# ✅ message 구조화 함수
def format_message(category: str, answer: str) -> dict | str:
    if category == "historical":
        prompt = (
            "Organize the following historical content by era in JSON format. Use historically or culturally appropriate period names if possible. "
            "Each period should contain a brief explanation and at least 2 major events. The format should be:\n\n"
            "{\n"
            "  \"[Era Name]\": {\n"
            "    \"Description\": \"4-5 sentence summary of the era's background\",\n"
            "    \"Major Events\": [\n"
            "      {\"Title\": \"Event name\", \"Description\": \"Explanation of why the event is importan with 2-3 sentences\"},\n"
            "      ...\n"
            "    ]\n"
            "  },\n"
            "  ...\n"
            "}\n\n"
            "Output only valid JSON without markdown.\n\n"
            f"Content:\n{answer}"
        )
        response = gemini_model.generate_content(prompt)
        try:
            cleaned = clean_code_block_json(response.text)
            return json.loads(cleaned)
        except json.JSONDecodeError:
            print("❌ JSON parsing error (historical):\n", response.text)
            raise

    elif category == "contents":
        prompt = (
            "Convert the following travel information into JSON format. Each section must include at least 2 items. "
            "Do not include markdown or image URLs. Each item must have 'name' and 'information' fields. "
            "Information should be detailed, with at least 2 full sentences.\n"
            "Use this format:\n"
            "{\n"
            "  \"Place\": [ {\"name\": \"...\", \"information\": \"...\"}, ... ],\n"
            "  \"F&B\": [ {\"name\": \"...\", \"information\": \"...\"}, ... ],\n"
            "  \"Activity\": [ {\"name\": \"...\", \"information\": \"...\"}, ... ]\n"
            "}\n"
            f"\nContent:\n{answer}"
        )
        response = gemini_model.generate_content(prompt)
        try:
            cleaned = clean_code_block_json(response.text)
            return json.loads(cleaned)
        except json.JSONDecodeError:
            print("❌ JSON parsing error (contents):\n", response.text)
            raise

    elif category == "preparation":
        prompt = (
            "Convert the following travel preparation content into JSON format. Include at least 2 items under both Clothes and ETC. "
            "Each item must contain 'name' and 'information' fields, and exclude image URLs. "
            "Information should be written in detailed English with at least 2 full sentences.\n"
            "Format:\n"
            "{\n"
            "  \"Clothes\": [ {\"name\": \"...\", \"information\": \"...\"}, ... ],\n"
            "  \"ETC\": [ {\"name\": \"...\", \"information\": \"...\"}, ... ]\n"
            "}\n"
            f"\nContent:\n{answer}"
        )
        response = gemini_model.generate_content(prompt)
        try:
            cleaned = clean_code_block_json(response.text)
            return json.loads(cleaned)
        except json.JSONDecodeError:
            print("❌ JSON parsing error (preparation):\n", response.text)
            raise

    else:
        raise ValueError(f"Unknown category: {category}")



# ✅ 전체 처리
def handle_full_response(question: str) -> dict:
    category = classify_question_with_gemini(question)
    print(f"🧭 classified category: {category}")
    docs = search_similar_docs(question, category)
    answer = generate_answer_with_gemini(question, docs)
    message = format_message(category, answer)
    summary = generate_summary_with_gemini(answer)
    return {
        "category": category,
        "message": message,
        "summary": summary
    }

# ✅ 테스트 실행
if __name__ == "__main__":
    question = input("Please enter your travel-related question: ").strip()
    result = handle_full_response(question)
    print("\n📌 result:\n")
    print(json.dumps(result, indent=2, ensure_ascii=False))