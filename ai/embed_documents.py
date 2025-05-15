from sentence_transformers import SentenceTransformer
import os
import glob
import faiss
import numpy as np
from tqdm import tqdm

# ✅ 로컬 임베딩 모델 로드
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# 폴더 설정
DOC_ROOT = "docs"
CATEGORIES = ["contents", "historical", "preparation"]
INDEX_ROOT = "embeddings"
os.makedirs(INDEX_ROOT, exist_ok=True)

# 텍스트를 벡터로 변환
def embed_text(text: str) -> np.ndarray:
    embedding = model.encode([text])[0]
    return np.array(embedding, dtype=np.float32)

# 카테고리별 문서 처리
for category in CATEGORIES:
    folder_path = os.path.join(DOC_ROOT, category)
    index = None
    id_map = []

    print(f"\n📂 {category.upper()} 폴더 처리 중...")

    for file_path in tqdm(glob.glob(os.path.join(folder_path, "*.txt"))):
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read().strip()
            if not text:
                continue

            embedding = embed_text(text)

            if index is None:
                dim = embedding.shape[0]
                index = faiss.IndexFlatL2(dim)

            index.add(np.array([embedding]))
            id_map.append(file_path)

    if index is not None:
        faiss.write_index(index, os.path.join(INDEX_ROOT, f"{category}.index"))
        with open(os.path.join(INDEX_ROOT, f"{category}_paths.txt"), "w", encoding="utf-8") as f:
            for path in id_map:
                f.write(path + "\n")

        print(f"✅ {category} 인덱스 저장 완료. ({len(id_map)}개 문서)")
    else:
        print(f"⚠️ {category}에 처리할 문서가 없습니다.")
