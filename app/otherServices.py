import schemas, models
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, APIRouter, Response
from database import get_db

page_into_router = APIRouter()

@page_into_router.get('/{accountId}')
def get_page_info(accountId: int, db: Session = Depends(get_db), year: int = None, month: int = None):

    total = db.query(models.MonthlyTotals).filter(
        (models.MonthlyTotals.account_id == accountId) and
        (models.MonthlyTotals.year == year) and
        (models.MonthlyTotals.month == month)).first()
    
    all_totals = db.query(models.MonthlyTotals).filter(
        (models.MonthlyTotals.account_id == accountId)).all()
    
    all_categories = db.query(models.Budget).filter(
        models.Budget.total_id == total.total_id).all()

    all_budgets = [x.budget_id for x in all_categories]
    all_related_expenses = db.query(models.Expense).filter(
        models.Expense.budget_id in all_budgets).all()
    return {"status": "success", "current_total": total, "all_totals": all_totals, "categories": all_categories, "expenses": all_related_expenses}

@page_into_router.post('/{totalId}')
def add_budget_category(totalId: int, db: Session = Depends(get_db)):
    pass

@page_into_router.post("/{totalId}/{subCategory}")
def add_expense_and_update_category(totalId: int, subCategory: str, db: Session = Depends(get_db)):
    pass
