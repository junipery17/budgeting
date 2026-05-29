import schemas, models
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import Depends, HTTPException, status, APIRouter, Response
from database import get_db
from datetime import datetime, timedelta

expense_calculator = APIRouter()
pie_chart_router = APIRouter()

@expense_calculator.get('/')
def get_total_expenses_for_month(accountId: int, month: int, year: int, type: str, db: Session = Depends(get_db)):
    total = 0
    
    info = db.query(models.Budget).join(
        models.MonthlyTotals).join(
            models.Account).filter(models.MonthlyTotals.month == month).filter(
                                    models.MonthlyTotals.year == year).filter(
                                    models.Account.account_id == accountId).all()
    if(type == "year"):
        info = db.query(models.Budget).join(
            models.MonthlyTotals).join(
                models.Account).filter(models.MonthlyTotals.year == year).filter(
                                        models.Account.account_id == accountId).all()
                
    if info:
        all_budget_ids = [x.budget_id for x in info]
        if(type == "week"):
            day_of_week = datetime.now().weekday() + 1
            total = db.query(func.sum(models.Expense.cost).label("expenses_cost")).filter(models.Expense.budget_id.in_(all_budget_ids)).filter(
                            models.Expense.date.between((datetime.now() - timedelta(days= day_of_week)), (datetime.now() + timedelta(days = (7 - day_of_week))))).scalar()
        else:
            total = db.query(func.sum(models.Expense.cost).label("expenses_cost")).filter(models.Expense.budget_id.in_(all_budget_ids)).scalar()
    if not total:
        total = 0
    return {"status": "success", "total": total}

@expense_calculator.get('/{budgetId}')
def get_all_expenses_in_category_month(budgetId: int, db: Session = Depends(get_db)):
    total = db.query(func.sum(models.Expense.cost).label("expenses_cost")).filter(models.Expense.budget_id == budgetId).scalar()
    if not total:
        total = 0
    return {"status": "success", "total": total}

@pie_chart_router.get('/{accountId}')
def get_budget_and_expense(accountId: int, month:int = None, year: int = None, db: Session = Depends(get_db)):
    budget_expenses = {}
    monthly_budgets = {}
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
    
    all_made_category_names = db.query(models.Category).filter(models.Category.account_id == accountId).all()
    category_name_dict = {}
    for name in all_made_category_names:
        category_name_dict[name.category_id] = name.name
    
    for category in budgets_list:
        if((year == None) and (month == None)):
            expense_total = db.query(func.sum(models.Expense.cost).label("expenses_total_cost")).join(models.Budget).filter(
                models.Budget.category_id == category.category_id).filter(models.Budget.budget_id == models.Expense.budget_id).scalar()
        else:
            expense_total = db.query(func.sum(models.Expense.cost).label("expenses_total_cost")).join(models.Budget).filter(
                models.Budget.category_id == category.category_id).filter(category.budget_id == models.Expense.budget_id).scalar()
        budget_expenses[(category_name_dict[category.category_id])] = expense_total
        monthly_budgets[(category_name_dict[category.category_id])] = category.amount
    return {"budget_dict": budget_expenses, "categories": monthly_budgets}
    
@pie_chart_router.get('/{accountId}/{monthlyTotalId}')
def get_monthly_expenses_total(accountId: int, monthlyTotalId: int, db: Session = Depends(get_db)):
    sum_of_related_expenses = db.query(func.sum(models.Expense.cost).label("all_expenses")).join(
                                                                                    models.Budget).join(
                                                                                    models.MonthlyTotals).filter(
                                                                                    models.MonthlyTotals.account_id == accountId).filter(
                                                                                    models.Budget.total_id == monthlyTotalId).scalar()
    monthlyTotal = db.query(models.MonthlyTotals).filter(models.MonthlyTotals.total_id == monthlyTotalId).first()
    
    sum_of_alltime_expenses = db.query(func.sum(models.Expense.cost).label("all_expenses")).join(
                                                                                    models.Budget).join(
                                                                                    models.MonthlyTotals).filter(
                                                                                    models.MonthlyTotals.account_id == accountId).scalar()
    alltime_budget_total = db.query(func.sum())
    return {"monthly_total": monthlyTotal, "expenses_sum": sum_of_related_expenses}
    
