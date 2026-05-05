import schemas, models
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import Depends, HTTPException, status, APIRouter, Response
from database import get_db

expense_calculator = APIRouter()
pie_chart_router = APIRouter()

@expense_calculator.get('/')
def get_total_expenses_for_month(accountId: int, month: int, year: int, db: Session = Depends(get_db)):
    total = 0
    info = db.query(models.Budget.budget_id).join(
        models.MonthlyTotals).join(
            models.Account).filter(models.MonthlyTotals.month == month).filter(
                                    models.MonthlyTotals.year == year).filter(
                                    models.Account.account_id == accountId).all()
    if info:
        total = db.query(func.sum(models.Expense.cost).label("expenses_cost")).filter(models.Expense.budget_id.in_(info[0])).scalar()
    if not total:
        total = 0
    return {"status": "success", "total": total}

@expense_calculator.get('/{totalId}')
def get_all_expenses_in_category_month(totalId: int, category: str = "", db: Session = Depends(get_db)):
    total = db.query(func.sum(models.Expense.cost).label("expenses_cost")).filter(models.Budget.total_id == totalId).filter(
                                                                                models.Budget.budget_type == category).filter(
                                                                                models.Expense.budget_id == models.Budget.budget_id).scalar()
    if not total:
        total = 0
    return {"status": "success", "total": total}

@pie_chart_router.get('/{accountId}')
def get_budget_and_expense(accountId: int, month:int = None, year: int = None, db: Session = Depends(get_db)):
    budget_expenses = {}
    # budgets = db.query(models.Budget).join(models.MonthlyTotals).filter((models.MonthlyTotals.account_id == accountId))
    if((year == None) and (month == None)):
        budgets_list = db.query(models.Budget).join(models.MonthlyTotals).filter((models.MonthlyTotals.account_id == accountId)).all()
    elif(month == None):
        budgets_list = db.query(models.Budget).join(models.MonthlyTotals).filter((models.MonthlyTotals.account_id == accountId)).filter(models.MonthlyTotals.year == year).all()
    elif(year == None):
        budgets_list = db.query(models.Budget).join(models.MonthlyTotals).filter((models.MonthlyTotals.account_id == accountId)).filter(models.MonthlyTotals.month == month).all() 
    else:
        budgets_list = db.query(models.Budget).join(models.MonthlyTotals).filter((models.MonthlyTotals.account_id == accountId)).filter(models.MonthlyTotals.month == month).filter(models.MonthlyTotals.year == year).all()
    if not budgets_list:
        return {"budget_dict": None}
    
    for category in budgets_list:
        if((year == None) and (month == None)):
            expense_total = db.query(func.sum(models.Expense.cost).label("expenses_total_cost")).join(models.Budget).filter(
                models.Budget.budget_type == category.budget_type).filter(models.Budget.budget_id == models.Expense.budget_id).scalar()
        else:
            expense_total = db.query(func.sum(models.Expense.cost).label("expenses_total_cost")).join(models.Budget).filter(
                models.Budget.budget_type == category.budget_type).filter(category.budget_id == models.Expense.budget_id).scalar()
        budget_expenses[category.budget_type] = expense_total
    return {"budget_dict": budget_expenses}
    
