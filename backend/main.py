from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from database import engine, Base, SessionLocal
import models # Import data models so they are registered
from sqlalchemy.orm import Session
from auth import hash_password, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM
from pydantic import BaseModel
from datetime import timedelta
from typing import List
from typing import Optional

# --- 1. App Initialization and Middleware ---

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)


# --- 2. Helpers/Dependencies ---

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Helper to get the current user from JWT
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(models.User).filter(models.User.username == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --- 3. Pydantic Models ---

# Pydantic models
class UserCreate(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class CompoundCreate(BaseModel):
    name: str
    smiles_string: str

    class Config:
        orm_mode = True  # Allows serialization of SQLAlchemy models

class CompoundResponse(BaseModel):
    id: int
    name: str
    smiles_string: str

    class Config:
        orm_mode = True  # Allows serialization of SQLAlchemy models

class ShareCompoundRequest(BaseModel):
    user_id: int


# --- 4. Routes ---

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Backend is running!"}

# Register a new user
@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = hash_password(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

# Login a user and return a JWT token
@app.post("/login")
def login(user: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": db_user.username}, expires_delta=access_token_expires)
    
    return {"access_token": access_token, "token_type": "bearer"}

# Protected Route: Fetch User's Compounds
@app.get("/compounds", response_model=List[CompoundResponse])
def get_user_compounds(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Fetch compounds owned by the current user
    owned_compounds = (
        db.query(models.Compound)
        .filter(models.Compound.owner_id == current_user.id)
        .all()
    )

    # Fetch compounds shared with the current user
    shared_compounds = (
        db.query(models.Compound)
        .join(models.shared_compounds, models.Compound.id == models.shared_compounds.c.compound_id)
        .filter(models.shared_compounds.c.user_id == current_user.id)
        .all()
    )

    # Combine results
    compounds = owned_compounds + shared_compounds

    return [
        CompoundResponse(
            id=compound.id,
            name=compound.name,
            smiles_string=compound.smiles_string,
        )
        for compound in compounds
    ]



# Save a Compound
@app.post("/compounds", response_model=CompoundResponse)
def save_compound(
    compound: CompoundCreate,  # Use CompoundCreate for input validation
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check if the compound already exists for this user
    existing_compound = (
        db.query(models.Compound)
        .filter(
            models.Compound.owner_id == current_user.id,
            models.Compound.smiles_string == compound.smiles_string,
        )
        .first()
    )
    if existing_compound:
        raise HTTPException(status_code=400, detail="Compound already exists.")

    # Create and save the new compound
    new_compound = models.Compound(
        name=compound.name,
        smiles_string=compound.smiles_string,
        owner_id=current_user.id,
    )
    db.add(new_compound)
    db.commit()
    db.refresh(new_compound)
    return new_compound

# Delete a Compound
@app.delete("/compounds/{compound_id}")
def delete_compound(
    compound_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Fetch the compound to ensure it exists and belongs to the current user
    compound = (
        db.query(models.Compound)
        .filter(models.Compound.id == compound_id, models.Compound.owner_id == current_user.id)
        .first()
    )
    if not compound:
        raise HTTPException(status_code=404, detail="Compound not found or not authorized to delete.")

    # Remove all shared access to this compound
    db.query(models.shared_compounds).filter(models.shared_compounds.c.compound_id == compound_id).delete()

    # Delete the compound itself
    db.delete(compound)
    db.commit()

    return {"message": "Compound and shared access deleted successfully!"}

# Share a Compound
@app.post("/compounds/{compound_id}/share")
def share_compound(
    compound_id: int,
    share_request: ShareCompoundRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Ensure the compound belongs to the current user
    compound = (
        db.query(models.Compound)
        .filter(models.Compound.id == compound_id, models.Compound.owner_id == current_user.id)
        .first()
    )
    if not compound:
        raise HTTPException(status_code=403, detail="You are not authorized to share this compound.")

    # Check if the target user already has the compound
    existing_share = db.query(models.shared_compounds).filter(
        models.shared_compounds.c.compound_id == compound_id,
        models.shared_compounds.c.user_id == share_request.user_id
    ).first()

    if existing_share:
        raise HTTPException(status_code=400, detail="User already has this compound.")

    # Share the compound with the target user
    target_user = db.query(models.User).filter(models.User.id == share_request.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found.")

    # Insert into shared_compounds table
    db.execute(
        models.shared_compounds.insert().values(compound_id=compound_id, user_id=share_request.user_id)
    )
    db.commit()

    return {"message": "Compound shared successfully!"}




# Return a list of users excluding the currently logged in user
@app.get("/users")
def get_all_users(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Exclude the current user from the results
    users = db.query(models.User).filter(models.User.id != current_user.id).all()
    return [{"id": user.id, "username": user.username} for user in users]


