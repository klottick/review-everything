from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import Category, Item
from app.schemas.schemas import CategoryCreate, CategoryResponse

router = APIRouter()

@router.get("", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    # Add item count to each category
    for cat in categories:
        cat.item_count = db.query(Item).filter(Item.category_id == cat.id).count()
    return categories

@router.post("", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    print(f"Creating category: {category}")
    try:
        db_category = Category(**category.model_dump())
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        print(f"Created: {db_category}")
        return db_category
    except Exception as e:
        print(f"Error: {e}")
        raise

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if category:
        category.item_count = db.query(Item).filter(Item.category_id == category_id).count()
    return category

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if category:
        db.delete(category)
        db.commit()
    return {"deleted": category_id}