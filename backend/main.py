from fastapi import FastAPI
from database import engine, Base  # Import Base and engine
import models # Import data models so they are registered

app = FastAPI()

# Create database tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}