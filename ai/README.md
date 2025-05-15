# 🧳 AI 기반 여행 정보 추천 시스템

여행 관련 질문을 입력하면,  
자동으로 질문을 분류하고 관련 정보를 찾아  
텍스트 답변과 이미지를 함께 제공해주는 스마트한 여행 도우미입니다.  
Google Gemini API와 Pexels API, Sentence Transformers 기반으로 작동합니다.

---

## 🚀 주요 기능

- ✅ **질문 분류**: Gemini API로 `contents`, `historical`, `preparation` 중 하나로 자동 분류
- 🔍 **문서 검색**: Sentence Transformers + FAISS로 유사 문서 검색
- 🧠 **답변 생성**: 문서를 기반으로 Gemini가 친절하고 자연스럽게 답변 생성
- 🖼️ **이미지 검색**: Pexels API로 관련 이미지 자동 검색 및 제공
- 🔒 **환경 변수로 API 키 보안 처리 (`.env`)**

---

## 📦 사용 기술

| 영역 | 기술 |
|------|------|
| 임베딩 모델 | `sentence-transformers/all-MiniLM-L6-v2` |
| 대화형 AI | Google `Gemini API` (generativeai) |
| 이미지 검색 | `Pexels API` |
| 벡터 검색 | `FAISS` |
| 환경 변수 로딩 | `python-dotenv` |
| 기타 | `requests`, `numpy`, `os` 등 |

---


## 🔑 필요한 API 키

### 1. 🔮 Google Gemini API
- [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) 에서 API 키 생성
- 생성 후 `.env` 파일에 `GEMINI_API_KEY=`에 붙여넣기

### 2. 📷 Pexels API
- [https://www.pexels.com/api/](https://www.pexels.com/api/) 에서 회원가입 후 API 키 발급
- `.env` 파일에 `PEXELS_API_KEY=`에 붙여넣기

---

## 🛠️ 설치 방법

```bash
git clone https://github.com/YourUsername/YourRepositoryName.git
cd YourRepositoryName

# 가상환경 생성 및 활성화
python -m venv venv
venv\Scripts\activate        # Windows 기준

# 패키지 설치
pip install -r requirements.txt
