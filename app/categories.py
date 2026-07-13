import schemas, models
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, APIRouter, Response
from database import get_db

category_router = APIRouter()

@category_router.get('/{accountId}')
def get_categories(accountId: int, db: Session = Depends(get_db)):
    categories = db.query(models.Category).filter(models.Category.account_id == accountId).all()
    category_dict = {}
    if(categories):
        for category in categories:
            category_dict[category.category_id] = category.name
    return {'status': 'success', 'categories': category_dict}

@category_router.get('/{accountId}/{categoryId}')
def get_category(accountId: int, categoryId: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.category_id == categoryId).filter(models.Category.account_id == accountId).first()
    if not category:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND,
                                detail = f"No category with this ID: {categoryId} found")
    return {"status": "success", "category": category}

@category_router.post('/')
def create_category(payload: schemas.PostCategorySchema, db: Session = Depends(get_db)):
    new_category = models.Category(**payload.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return {"status": "success", "category": new_category}

@category_router.patch('/{categoryId}')
def update_category(categoryId: int, payload: schemas.CategoriesSchema, db: Session = Depends(get_db)):
    category_query = db.query(models.Category).filter(models.Category.category_id == categoryId)
    db_category = category_query.first()

    if not db_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f'No category with this id: {categoryId} found')
    update_data = payload.model_dump(exclude_unset=True)
    category_query.filter(models.Category.category_id == categoryId).update(update_data,
                                                       synchronize_session=False)
    db.commit()
    db.refresh(db_category)
    return {"status": "success", "category": db_category}

@category_router.delete('/{categoryId}')
def delete_category(categoryId: int, db: Session = Depends(get_db)):
    category_query = db.query(models.Category).filter(models.Category.category_id == categoryId)
    category = category_query.first()
    if not category:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND,
                            detail = f"No category with this id: {categoryId} found")
    category_query.delete(synchronize_session = False)
    db.commit()
    return Response(status_code = status.HTTP_204_NO_CONTENT)
