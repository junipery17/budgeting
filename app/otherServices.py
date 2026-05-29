import schemas, models
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import func
from fastapi import Depends, HTTPException, status, APIRouter, Response
from database import get_db
from datetime import datetime, timedelta;

page_into_router = APIRouter()

class PageInfo(BaseModel):
    status: str
    current_total: schemas.MonthlyTotalsSchema
    all_totals: list[schemas.MonthlyTotalsSchema]
    categories: list[schemas.BudgetsSchema]
    expenses: list[schemas.ExpensesSchema]
    expense_relations: dict
    currently_allocated: float
    category_to_expenses: list[schemas.ExpenseToCategorySchema]
    category_names: dict
    
    class Config:
        from_attributes = True
        validate_by_name = True
        arbitrary_types_allowed = True

@page_into_router.get('/{accountId}', response_model=PageInfo)
def get_page_info(accountId: int, db: Session = Depends(get_db), year: int = None, month: int = None, type= ""):
    #get displayed monthly total
    total = db.query(models.MonthlyTotals).filter(
        models.MonthlyTotals.account_id == accountId).filter(
        models.MonthlyTotals.year == year).filter(
        models.MonthlyTotals.month == month).first()
    #get other totals of account
    all_totals = db.query(models.MonthlyTotals).filter(
        (models.MonthlyTotals.account_id == accountId)).order_by(models.MonthlyTotals.year.desc(), models.MonthlyTotals.month.desc()).all()
    #get all categories for displayed month
    all_categories = db.query(models.Budget).join(models.MonthlyTotals).filter(
        models.Budget.total_id == total.total_id).all()
    #get all budget_ids for displayed month
    all_budgets = [x.budget_id for x in all_categories]
        
    if(type == "week"):
        day_of_week = datetime.now().weekday() + 1
        all_related_expenses = db.query(models.Expense).filter(
            models.Expense.date.between((datetime.now() - timedelta(days= day_of_week)), (datetime.now() + timedelta(days = (7 - day_of_week))))).order_by(models.Expense.expense_id.desc()).all()
    elif(type == "year"):
        current_year = datetime.now().year
        #get all categories for displayed month
        all_categories = db.query(models.Budget).join(models.MonthlyTotals).filter(
            models.MonthlyTotals.account_id == accountId).filter(models.MonthlyTotals.year == current_year).all()
        #get all budget_ids for displayed month
        all_budgets = [x.budget_id for x in all_categories]
        
        all_related_expenses = db.query(models.Expense).filter(
            models.Expense.budget_id.in_(all_budgets)).order_by(models.Expense.expense_id.desc()).all()
    else:
        #get most recent 10 to display on main page
        all_related_expenses = db.query(models.Expense).filter(
            models.Expense.budget_id.in_(all_budgets)).order_by(models.Expense.expense_id.desc()).all()
    
    # get total amount allocated grab sum of budget amounts of monthly total
    currently_allocated = db.query(func.sum(models.Budget.amount).label("total_allocated")).filter(models.Budget.total_id == total.total_id).scalar()
    if (not currently_allocated):
        currently_allocated = 0
    
    category_to_expenses = db.query(models.Category.category_id, models.Category.name, models.Expense.expense_id).join(
                                        models.Budget, models.Budget.category_id == models.Category.category_id).join(
                                        models.Expense, models.Expense.budget_id == models.Budget.budget_id).filter(
                                                                                                models.Category.account_id == accountId).all()
    
    all_made_category_names = db.query(models.Category).filter(models.Category.account_id == accountId).all()
    category_name_dict = {}
    for name in all_made_category_names:
        category_name_dict[name.category_id] = name.name
    
    expense_to_budget_name = {}
    for expense in all_related_expenses:
        expense_to_budget_name[expense.budget_id] = [(value.name, value.category_id) for _, value in enumerate(category_to_expenses) if value.expense_id == expense.expense_id][0]
    
    return {"status": "success", "current_total": total,
            "all_totals": all_totals, "categories": all_categories,
            "expenses": all_related_expenses, "expense_relations": expense_to_budget_name,
            "currently_allocated": currently_allocated,
            "category_to_expenses": category_to_expenses,
            "category_names": category_name_dict}

@page_into_router.post("/{accountId}/{categoryName}")
def create_new_category_and_budget(payload: schemas.PostBudgetsSchema, accountId: int, categoryName: str, db: Session = Depends(get_db)):
    new_category = models.Category(account_id= accountId, name= categoryName)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    new_cat_id = db.query(models.Category).filter(models.Category.account_id == accountId).filter(models.Category.name == categoryName).first().category_id
    budget_dict = payload.model_dump()
    budget_dict["category_id"] = new_cat_id
    new_budget = models.Budget(**budget_dict)
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return {"status": "success", "category": new_category, "budget": new_budget}
