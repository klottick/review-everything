from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import Item, Review, CategoryMetric
from app.schemas.schemas import ItemCreate, ItemResponse

router = APIRouter()

def calculate_averages(item_id: int, db: Session) -> dict:
    """Calculate average scores for an item, handling backwards compatibility"""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        return {}
    
    # Get all metrics for this category
    metrics = db.query(CategoryMetric).filter(CategoryMetric.category_id == item.category_id).all()
    
    # Get all reviews for this item
    reviews = db.query(Review).filter(Review.item_id == item_id).all()
    
    if not reviews or not metrics:
        return {}
    
    averages = {}
    for metric in metrics:
        values = []
        for review in reviews:
            # Handle backwards compatibility: if metric not in scores, skip
            score = review.scores.get(str(metric.id)) or review.scores.get(metric.id)
            if score is not None:
                if metric.metric_type == "range" and isinstance(score, dict):
                    # For range, average the low and high values
                    avg = (score.get("low", 0) + score.get("high", 0)) / 2
                    values.append(avg)
                else:
                    values.append(score)
        
        if values:
            averages[str(metric.id)] = sum(values) / len(values)
    
    return averages

@router.get("", response_model=list[ItemResponse])
def get_items(category_id: int = None, db: Session = Depends(get_db)):
    items = db.query(Item).all()
    if category_id:
        items = [i for i in items if i.category_id == category_id]
    
    # Add averages to each item
    for item in items:
        item.average_scores = calculate_averages(item.id, db)
    
    return items

@router.post("", response_model=ItemResponse)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    db_item = Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if item:
        item.average_scores = calculate_averages(item_id, db)
    return item

@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"deleted": item_id}