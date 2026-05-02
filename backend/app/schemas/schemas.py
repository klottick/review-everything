from pydantic import BaseModel
from typing import Optional, List, Any

class UserBase(BaseModel):
    name: str
    color: str = "#6366F1"

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    metrics: List["MetricResponse"] = []
    item_count: int = 0
    
    class Config:
        from_attributes = True

class MetricBase(BaseModel):
    name: str
    metric_type: str = "star"  # star, boolean, number, range
    min_value: int = 1
    max_value: int = 5
    label: Optional[str] = None
    options: Optional[dict] = None  # For range: {"1": "$", "2": "$$", "3": "$$$", "4": "$$$$"}

class MetricCreate(MetricBase):
    category_id: int

class MetricResponse(MetricBase):
    id: int
    category_id: int
    
    class Config:
        from_attributes = True

class ItemBase(BaseModel):
    name: str
    category_id: int
    external_id: Optional[str] = None
    reference: Optional[str] = None
    address: Optional[str] = None
    google_rating: Optional[str] = None
    url: Optional[str] = None
    what_i_got: Optional[str] = None
    image_url: Optional[str] = None
    to_try: bool = False
    to_try_reason: Optional[str] = None
    lat: Optional[str] = None
    lng: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int
    reviews: List["ReviewResponse"] = []
    average_scores: Optional[dict] = None
    
    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    item_id: int
    user_id: int
    scores: dict  # {metric_id: value, ...} - value can be int or {"low": x, "high": y} for range
    notes: Optional[str] = None
    public: bool = True
    image_url: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    
    class Config:
        from_attributes = True

CategoryResponse.model_rebuild()
MetricResponse.model_rebuild()
ItemResponse.model_rebuild()