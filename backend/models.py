from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base

# Association table for shared compounds
shared_compounds = Table(
    "shared_compounds",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("compound_id", Integer, ForeignKey("compounds.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    compounds = relationship("Compound", back_populates="owner")
    shared_compounds = relationship("Compound", secondary=shared_compounds, back_populates="shared_with")

class Compound(Base):
    __tablename__ = "compounds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    smiles_string = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="compounds")
    shared_with = relationship("User", secondary=shared_compounds, back_populates="shared_compounds")
