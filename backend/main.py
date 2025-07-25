from fastapi import FastAPI
from fastapi import APIRouter


app = FastAPI(
    title="Notes Management API",
    version="1.0.0")





router = APIRouter()

@router.get("/")
async def hello():
    return {"message": "Hello from router!"}

app.include_router(router)

