from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.models.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    color = Column(String, default="#6366F1")
    
    reviews = relationship("Review", back_populates="user")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    
    metrics = relationship("CategoryMetric", back_populates="category", cascade="all, delete-orphan")
    items = relationship("Item", back_populates="category", cascade="all, delete-orphan")

class CategoryMetric(Base):
    __tablename__ = "category_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String, nullable=False)
    metric_type = Column(String, default="star")  # star, boolean, number, range
    min_value = Column(Integer, default=1)
    max_value = Column(Integer, default=5)
    label = Column(String, nullable=True)
    options = Column(JSON, nullable=True)  # For range: {"low": "$", "high": "$$$$"}
    
    category = relationship("Category", back_populates="metrics")

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String, nullable=False)
    external_id = Column(String, nullable=True)  # Google place_id
    reference = Column(String, nullable=True)
    address = Column(String, nullable=True)
    google_rating = Column(String, nullable=True)
    url = Column(String, nullable=True)
    what_i_got = Column(String, nullable=True)  # What you ordered/had
    image_url = Column(String, nullable=True)  # Uploaded image URL
    to_try = Column(Boolean, default=False)  # Mark as "want to try"
    to_try_reason = Column(String, nullable=True)  # Why you want to try it
    lat = Column(String, nullable=True)  # Cached latitude
    lng = Column(String, nullable=True)  # Cached longitude
    
    category = relationship("Category", back_populates="items")
    reviews = relationship("Review", back_populates="item", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scores = Column(JSON, nullable=False)  # {metric_id: value, ...}
    notes = Column(String, nullable=True)
    public = Column(Boolean, default=True)
    image_url = Column(String, nullable=True)  # Review photo
    
    item = relationship("Item", back_populates="reviews")
    user = relationship("User", back_populates="reviews")