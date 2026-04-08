import schemas, models
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, APIRouter, Response
from database import get_db

expenses_router = APIRouter()

@expenses_router.get('/{budgetId}')
def get_expenses(budgetId: int, db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).filter(models.Expense.budget_id == budgetId).all()
    return {"status": "success", "expenses": expenses}

@expenses_router.get('/{expenseId}')
def get_expense(expenseId: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.expense_id == expenseId).first()
    
@expenses_router.post('/')
def create_expense(payload: schemas.ExpensesSchema, db: Session = Depends(get_db)):
    new_expense = models.Expense(**payload.model_dump())
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return {"status": "success", "expense": new_expense}

@expenses_router.patch('/{expenseId}')
def update_expense(expenseId: int, payload: schemas.ExpensesSchema, db: Session = Depends(get_db)):
    expense_query = db.query(models.Expense).filter(models.Expense.expense_id == expenseId)
    selected_expense = expense_query.first()
    
    if not selected_expense:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND,
                            detail = f"No Expense with this ID: {expenseId} found")
    update_data = payload.model_dump(exclude_unset = True)
    expense_query.filter(models.Expense.expense_id == expenseId).update(update_data,
                                                                        synchronize_session= False)
    db.commit()
    db.refresh(selected_expense)
    return {"status": "success", "expense": selected_expense}

@expenses_router.delete('/{expenseId}')
def delete_expense(expenseId: int, db: Session = Depends(get_db)):
    expense_query = db.query(models.Expense).filter(models.Expense.expense_id == expenseId)
    expense = expense_query.first()
    if not expense:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND,
                            detail = f"No expense with this ID: {expenseId} found")
    expense_query.delete(synchronize_session= False)
    db.commit()
    return Response(status_code = status.HTTP_204_NO_CONTENT)
