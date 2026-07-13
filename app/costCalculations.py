import schemas, models
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, extract, desc
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status, APIRouter, Response
from database import get_db
from datetime import datetime, timedelta

expense_calculator = APIRouter()
pie_chart_router = APIRouter()
top_cat_router = APIRouter()

@expense_calculator.get('/')
def get_total_expenses_for_month(accountId: int, month: int, year: int, type: str, db: Session = Depends(get_db)):
    total = 0
    if(type == "week"):
        day_of_week = datetime.now().weekday() + 1
        total = db.query(func.sum(models.Expense.cost).label("expenses_cost")).filter(models.Expense.account_id == accountId).filter(
                        models.Expense.date.between((datetime.now() - timedelta(days= day_of_week)), (datetime.now() + timedelta(days = (7 - day_of_week))))).scalar()
    elif(type == "year"):
        total = db.query(func.sum(models.Expense.cost).label("expenses_cost")).filter(models.Expense.account_id == accountId).filter(extract("YEAR", models.Expense.date) == year).scalar()
    else:
        total = db.query(func.sum(models.Expense.cost).label("expenses_cost")).filter(
                                                                                models.Expense.account_id == accountId).filter(
                                                                                extract("YEAR", models.Expense.date) == year).filter(
                                                                                extract("MONTH", models.Expense.date) == month).scalar()
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
 
    if((year == None) and (month == None)):
        budgets_list = db.query(models.Budget).filter((models.Budget.account_id == accountId)).all()
    elif(month == None):
        budgets_list = db.query(models.Budget).filter((models.Budget.account_id == accountId)).filter(models.Budget.year == year).all()
    elif(year == None):
        budgets_list = db.query(models.Budget).filter((models.Budget.account_id == accountId)).filter(models.Budget.month == month).all() 
    else:
        budgets_list = db.query(models.Budget).filter((models.Budget.account_id == accountId)).filter(
                                                                                                models.Budget.month == month).filter(
                                                                                                models.Budget.year == year).all()
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
    
@pie_chart_router.get('/{accountId}/{month}/{year}')
def get_monthly_expenses_total(accountId: int, month: int, year: int, db: Session = Depends(get_db)):
    sum_of_related_expenses = db.query(func.sum(models.Expense.cost).label("all_expenses")).filter(
                                                                                    models.Expense.account_id == accountId).filter(
                                                                                    extract("MONTH", models.Expense.date) == month).filter(
                                                                                    extract("YEAR", models.Expense.date) == year).scalar()
    monthlyTotal = db.query(func.sum(models.Budget.amount).label("all_of_budget")).filter(
                                                                                    models.Budget.month == month).filter(
                                                                                    models.Budget.year == year).scalar()
    
    sum_of_alltime_expenses = db.query(func.sum(models.Expense.cost).label("all_expenses")).filter(
                                                                                    models.Expense.account_id == accountId).scalar()
    alltime_budget_total = db.query(func.sum(models.Budget.amount).label("alltime_budget_total")).filter(models.Budget.account_id == accountId).scalar()

    return {"monthly_total": monthlyTotal, "expenses_sum": sum_of_related_expenses, 
            "all_expense_sum": sum_of_alltime_expenses, "all_budgets_total": alltime_budget_total}
    
class TopCat(BaseModel):
    category_id: int
    name: str
    expense_sum: float
    
    class Config:
        from_attributes = True
        validate_by_name = True
        arbitrary_types_allowed = True

@top_cat_router.get('/{accountId}/{year}', response_model=TopCat)
def get_top_cat_of_month(accountId: int, year: int, month: int = None, db: Session = Depends(get_db)):
    if(month == None):
        subquery1 = db.query(models.Category.category_id, models.Category.name, func.sum(models.Expense.cost).label("expense_sum")).select_from(models.Expense).join(models.Budget).join(models.Category).filter(
                                                                    models.Expense.account_id == accountId).filter(
                                                                    extract("YEAR", models.Expense.date) == year).group_by(models.Category.category_id).subquery()
    else:
        subquery1 = db.query(models.Category.category_id, models.Category.name, func.sum(models.Expense.cost).label("expense_sum")).select_from(models.Expense).join(models.Budget).join(models.Category).filter(
                                                                    models.Expense.account_id == accountId).filter(
                                                                    extract("MONTH", models.Expense.date) == month).filter(
                                                                    extract("YEAR", models.Expense.date) == year).group_by(models.Category.category_id).subquery()
    
    top_monthly_cat = db.query(models.Category.category_id, models.Category.name, func.max(subquery1.c.expense_sum).label("max_sum")).select_from(models.Category).join(
        subquery1, subquery1.c.category_id == models.Category.category_id).group_by(models.Category.category_id).order_by(desc("max_sum")).first()
    if(top_monthly_cat):
        return {"category_id": top_monthly_cat[0], "name": top_monthly_cat[1], "expense_sum": top_monthly_cat[2]}
    else:
        return {"category_id": -1, "name": "", "expense_sum": 0}
