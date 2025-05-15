from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from main import handle_full_response
from scrape_picture import get_image_for_input

app = FastAPI()

# ✅ Request schema
class QueryRequest(BaseModel):
    question: str

# ✅ Response schema
class QueryResponse(BaseModel):
    response: dict

# ✅ Add image URLs to message data
def enrich_message_with_images(message: dict, category: str) -> dict:
    if category == "contents":
        for section in ["Place", "F&B", "Activity"]:
            for item in message.get(section, []):
                image_url = get_image_for_input(item["name"])
                item["imageurl"] = image_url

    elif category == "preparation":
        for section in ["Clothes", "ETC"]:
            for item in message.get(section, []):
                image_url = get_image_for_input(item["name"])
                item["imageurl"] = image_url

    return message

# ✅ Main endpoint
@app.post("/ask", response_model=QueryResponse)
def ask_question(request: QueryRequest):
    question = request.question
    try:
        core = handle_full_response(question)
        category = core["category"]

        if category in ["contents", "preparation"]:
            core["message"] = enrich_message_with_images(core["message"], category)
            image_url = None
        elif category == "historical":
            image_url = get_image_for_input(question)
        else:
            image_url = None

        return {
            "response": {
                **core,
                "imageurl": image_url
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Root
@app.get("/")
def root():
    return {"message": "Welcome to the Travel Assistant API. Send a POST request to /ask with your question."}