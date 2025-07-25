from fastapi import FastAPI
from fastapi import APIRouter
from app.config.settings import settings
from app.routers.auth import router as UserRouter
app = FastAPI(
    title="Notes Management API",
    version="1.0.0")


router = APIRouter(
    prefix = ''
)

@router.get("/")
async def hello():
    return {"message": "Hello from router!"}

app.include_router(router)
app.include_router(UserRouter,prefix='/api')

