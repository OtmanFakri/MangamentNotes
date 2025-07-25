from fastapi import FastAPI
from fastapi import APIRouter
from app.routers.auth import router as UserRouter
from app.routers.note import router as NoteRouter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Notes Management API",
    version="1.0.0")


origins = [
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(
    prefix = ''
)

@router.get("/")
async def hello():
    return {"message": "Hello from router!"}

app.include_router(router)
app.include_router(UserRouter,prefix='/api')
app.include_router(NoteRouter,prefix='/api')