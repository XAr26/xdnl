from fastapi import FastAPI
from pydantic import BaseModel
import yt_dlp

app = FastAPI()

class UrlRequest(BaseModel):
    url: str

@app.get("/")
async def root():
    return {"message": "API jalan 🚀"}

@app.post("/info")
async def get_info(req: UrlRequest):
    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "format": "best"
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(req.url, download=False)

        return {
            "title": info.get("title"),
            "thumbnail": info.get("thumbnail"),
            "duration": info.get("duration"),
            "url": info.get("url")
        }