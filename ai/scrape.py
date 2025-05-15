import requests
import os


# 2. Gemini API 키를 여기에 붙여넣으세요
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# 1️⃣ Wikipedia 요약 요청 (History 중심)
def get_wikipedia_summary(city):
    page_title = f"History_of_{city}"
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{page_title}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data.get("extract", "No summary available.")
    else:
        return "Wikipedia 요청 실패 또는 문서가 존재하지 않습니다."

# 2️⃣ Gemini 요약 요청 (gemini-2.0-flash 모델 사용, 한국어 질문)
def get_gemini_summary(city, api_key):
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {"Content-Type": "application/json"}

    prompt = f"{city}에 여행하기 전에 챙겨야 할 준비물에 대해 정리해 주세요. 해당 지역의 온도, 강수량 등을 고려해서 옷차림을 설명해주고, 보편적으로 챙겨야 하는 준비물(여벌 옷, 환전한 돈, 지도 등)이 아닌, 해당 지역에서만 필요한 특수한 준비물으로 이유와 함께 설명해주세요."

    data = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    params = {"key": api_key}
    response = requests.post(url, headers=headers, params=params, json=data)

    if response.status_code == 200:
        try:
            return response.json()["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError):
            return "Gemini 응답 처리 실패 (내용 없음)."
    else:
        return f"Gemini API 요청 실패: {response.status_code}"

# 3️⃣ 결과를 .txt 파일로 저장
def save_to_file(city, wiki_text, gemini_text):
    folder_path = os.path.join("docs", "preparation")
    os.makedirs(folder_path, exist_ok=True)  # 폴더 없으면 생성

    filename = os.path.join(folder_path, f"{city}_preparation.txt")
    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"[한글 위키백과 - {city}]\n{wiki_text}\n\n")
        f.write(f"[Gemini 요약 - {city}]\n{gemini_text}")
    print(f"✅ '{filename}' 에 저장되었습니다.")


# 1. 여행지 이름을 여기에 입력하세요
CITY_NAME = ["Kyoto", "Eiffel tower", "Seoul", "Rome"]  # 도시 이름 (예: "Seoul", "Istanbul", "Rome")


# 🔄 실행
for i in CITY_NAME:
    wiki_summary = get_wikipedia_summary(i)
    gemini_summary = get_gemini_summary(i, GEMINI_API_KEY)
    save_to_file(i, wiki_summary, gemini_summary)