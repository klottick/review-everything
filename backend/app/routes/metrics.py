from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import CategoryMetric, Category
from app.schemas.schemas import MetricCreate, MetricResponse

router = APIRouter()

@router.get("/category/{category_id}", response_model=list[MetricResponse])
def get_metrics_by_category(category_id: int, db: Session = Depends(get_db)):
    return db.query(CategoryMetric).filter(CategoryMetric.category_id == category_id).all()

@router.post("", response_model=MetricResponse)
def create_metric(metric: MetricCreate, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == metric.category_id).first()
    if not category:
        return {"error": "Category not found"}
    
    db_metric = CategoryMetric(**metric.model_dump())
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

@router.get("/{metric_id}", response_model=MetricResponse)
def get_metric(metric_id: int, db: Session = Depends(get_db)):
    return db.query(CategoryMetric).filter(CategoryMetric.id == metric_id).first()

@router.delete("/{metric_id}")
def delete_metric(metric_id: int, db: Session = Depends(get_db)):
    metric = db.query(CategoryMetric).filter(CategoryMetric.id == metric_id).first()
    if metric:
        db.delete(metric)
        db.commit()
    return {"deleted": metric_id}