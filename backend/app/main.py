from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import categories, items, reviews, users, metrics
from app.models.database import engine, Base
from app.services.google_places import router as google_router
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Review Everything API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
app.include_router(items.router, prefix="/api/items", tags=["items"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(google_router, prefix="/api/google", tags=["google"])

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/api/health")
def health():
    return {"status": "healthy"}