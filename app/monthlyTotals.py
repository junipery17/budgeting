import schemas, models
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, APIRouter, Response
from database import get_db

totals_router = APIRouter()

@totals_router.get('/{accountId}')
def get_all_totals(accountId: int, db: Session = Depends(get_db), year: int = None, month: int = None):
    totals = ""
    if year == None:
        totals = db.query(models.MonthlyTotals).filter(
            models.MonthlyTotals.account_id == accountId).all()
    elif month == None:
        totals = db.query(models.MonthlyTotals).filter(
            (models.MonthlyTotals.account_id == accountId) and
            (models.MonthlyTotals.year == year)).all()
    else:
        totals = db.query(models.MonthlyTotals).filter(
            (models.MonthlyTotals.account_id == accountId) and
            (models.MonthlyTotals.year == year) and
            (models.MonthlyTotals.month == month)).all()
    return {'status': 'success', 'totals': totals}

@totals_router.post('/')
def create_monthly_total(payload: schemas.MonthlyTotalsPostSchema, db: Session = Depends(get_db)):
    new_monthly_total = models.MonthlyTotals(**payload.model_dump())
    db.add(new_monthly_total)
    db.commit()
    db.refresh(new_monthly_total)
    return {"status": "success", "monthly_total": new_monthly_total}

@totals_router.patch('/{totalId}')
def update_monthly_total(totalId: int, payload: schemas.MonthlyTotalsSchema, db: Session = Depends(get_db)):
    monthly_total_query = db.query(models.MonthlyTotals).filter(models.MonthlyTotals.total_id == totalId)
    monthly_total = monthly_total_query.first()
    
    if not monthly_total:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail=f"No monthly total with this id found: {totalId}")
    update_data = payload.model_dump(exclude_unset=True)
    monthly_total_query.filter(models.MonthlyTotals.total_id == totalId).update(update_data,
                                                                                synchronize_session=False)
    db.commit()
    db.refresh(monthly_total)
    return {"status": "success", "monthly_total": monthly_total}

@totals_router.delete('/{totalId}')
def delete_monthly_total(totalId: int, db: Session = Depends(get_db)):
    monthly_total_query = db.query(models.MonthlyTotals).filter(models.MonthlyTotals.total_id == totalId)
    monthly_total = monthly_total_query.first()
    if not monthly_total:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail= f"No monthly total with this id found: {totalId}")
    monthly_total_query.delete(synchronize_session = False)
    db.commit()
    return Response(status_code= status.HTTP_204_NO_CONTENT)
