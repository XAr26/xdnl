from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

class UrlRequest(BaseModel):
    url: str

@app.get("/")
async def root():
    return {"message": "API jalan 🚀"}

@app.post("/info")
async def get_info(req: UrlRequest):
    # Basic validation
    if not req.url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="URL tidak valid. Harus dimulai dengan http atau https.")

    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "format": "best",
        "no_warnings": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            logger.info(f"Extracting info for: {req.url}")
            info = ydl.extract_info(req.url, download=False)

            if not info:
                raise HTTPException(status_code=404, detail="Media tidak ditemukan atau tidak didukung.")

            return {
                "title": info.get("title"),
                "thumbnail": info.get("thumbnail"),
                "duration": info.get("duration"),
                "url": info.get("url"),
                "ext": info.get("ext"),
                "uploader": info.get("uploader")
            }
    except Exception as e:
        logger.error(f"Error extracting info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data: {str(e)}")