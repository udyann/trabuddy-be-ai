import os
import requests
from dotenv import load_dotenv
from google.generativeai import configure, GenerativeModel

# ✅ 환경 변수 로드
# ✅ Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")

if not GEMINI_API_KEY or not PEXELS_API_KEY:
    raise ValueError("API keys are not set in the .env file.")

# ✅ Gemini 설정
# ✅ Configure Gemini API
configure(api_key=GEMINI_API_KEY)
gemini = GenerativeModel("models/gemini-1.5-flash")

# 🔤 이미지 검색용 짧고 명확한 영어 쿼리 생성
# 🔤 Generate a concise English search query for image search
def generate_image_search_query(user_input: str) -> str:
    prompt = (
        "Convert the following travel-related input into a concise English search query suitable for finding images. "
        "Use short, clear noun phrases. For example:\n"
        "- 'Things to do in Kyoto' → 'Kyoto sightseeing'\n"
        "- 'Famous food in Bangkok' → 'Bangkok street food'\n\n"
        f"Input: {user_input}\nSearch Query:"
    )
    response = gemini.generate_content(prompt)
    return response.text.strip().strip('"')

# 🖼️ Pexels에서 이미지 검색
# 🖼️ Search for images using the Pexels API
def get_pexels_image(query: str, access_key: str) -> str:
    url = "https://api.pexels.com/v1/search"
    headers = {"Authorization": access_key}
    params = {"query": query, "per_page": 1, "orientation": "landscape"}
    res = requests.get(url, headers=headers, params=params)

    if res.status_code == 200:
        data = res.json()
        if data['photos']:
            return data['photos'][0]['src']['medium']
    return None

# 🎯 전체 통합 함수
# 🎯 Main wrapper function: generate image query and fetch image
def get_image_for_input(user_input: str) -> str:
    query = generate_image_search_query(user_input)
    print(f"🔍 Generated image search query: {query}")
    image_url = get_pexels_image(query, PEXELS_API_KEY)
    return image_url

# ▶ 테스트
# ▶ Manual test
if __name__ == "__main__":
    user_input = input("Enter a travel-related phrase to search for an image: ").strip()
    image_url = get_image_for_input(user_input)
    if image_url:
        print(f"📷 Image URL: {image_url}")
    else:
        print("❌ No relevant image found.")