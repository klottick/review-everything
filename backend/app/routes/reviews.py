from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import Review
from app.schemas.schemas import ReviewCreate, ReviewResponse

router = APIRouter()

@router.get("", response_model=list[ReviewResponse])
def get_reviews(item_id: int = None, user_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Review)
    if item_id:
        query = query.filter(Review.item_id == item_id)
    if user_id:
        query = query.filter(Review.user_id == user_id)
    return query.all()

@router.post("", response_model=ReviewResponse)
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    # Check if user already reviewed this item
    existing = db.query(Review).filter(
        Review.item_id == review.item_id,
        Review.user_id == review.user_id
    ).first()
    if existing:
        # Update existing review
        existing.scores = review.scores
        existing.notes = review.notes
        existing.public = review.public
        db.commit()
        db.refresh(existing)
        return existing
    db_review = Review(**review.model_dump())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(review_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.id == review_id).first()

@router.delete("/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if review:
        db.delete(review)
        db.commit()
    return {"deleted": review_id}