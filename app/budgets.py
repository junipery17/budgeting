import schemas, models
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, APIRouter, Response
from database import get_db

budget_router = APIRouter()

@budget_router.get('/{accountId}')
def get_budgets(accountId: int, db: Session = Depends(get_db)):
    budgets = db.query(models.Budget).filter(models.Budget.account_id == accountId).all()
    return {"status": "success", "budgets": budgets}

@budget_router.get('/{accountId}/{budgetId}')
def get_budget(accountId: int, budgetId: int, db: Session = Depends(get_db)):
    budget = db.query(models.Budget).filter((models.Budget.account_id == accountId) and 
                                             (models.Budget.budget_id == budgetId)).first()
    return {"status": "success", "budgets": budget}

@budget_router.post('/')
def create_budget(payload: schemas.PostBudgetsSchema, db: Session = Depends(get_db)):
    new_budget = models.Budget(**payload.model_dump())
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return {"status": "success", "budget": new_budget}

@budget_router.patch('/{budgetId}')
def update_budget(budgetId: int, payload: schemas.BudgetsSchema, db: Session = Depends(get_db)):
    budget_query = db.query(models.Budget).filter(models.Budget.budget_id == budgetId)
    selected_budget = budget_query.first()
    
    if not selected_budget:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND,
                            detail= f'No budget with this ID: {budgetId} found')
    update_data = payload.model_dump(exclude_unset = True)
    budget_query.filter(models.Budget.budget_id == budgetId).update(update_data,
                                                                    synchronize_session= False)
    db.commit()
    db.refresh(selected_budget)
    return {"status": "success", "budget": selected_budget}

@budget_router.delete('/{budgetId}')
def delete_budget(budgetId: int, db: Session = Depends(get_db)):
    budget_query = db.query(models.Budget).filter(models.Budget.budget_id == budgetId)
    budget = budget_query.first()
    if not budget:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND,
                            detail = f"No budget with this ID: {budgetId} found")
    budget_query.delete(synchronize_session = False)
    db.commit()
    return Response(status_code = status.HTTP_204_NO_CONTENT)
