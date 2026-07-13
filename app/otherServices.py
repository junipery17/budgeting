import schemas, models
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import func, distinct, extract
from fastapi import Depends, HTTPException, status, APIRouter, Response
from database import get_db
from datetime import datetime, timedelta;

page_into_router = APIRouter()

class PageInfo(BaseModel):
    status: str
    categories: list[schemas.BudgetsSchema]
    total: float
    expenses: list[schemas.ExpensesSchema]
    expense_relations: dict
    category_to_expenses: list[schemas.ExpenseToCategorySchema]
    category_names: dict
    
    class Config:
        from_attributes = True
        validate_by_name = True
        arbitrary_types_allowed = True

@page_into_router.get('/{accountId}', response_model=PageInfo)
def get_page_info(accountId: int, db: Session = Depends(get_db), year: int = None, month: int = None, type= ""):
    #get all categories for displayed month
    all_categories = db.query(models.Budget).filter(models.Budget.month == month).filter(models.Budget.year == year).filter(models.Budget.account_id == accountId).all()
        
    if(type == "week"):
        day_of_week = datetime.now().weekday() + 1
        all_related_expenses = db.query(models.Expense).filter(
            models.Expense.date.between(
                (datetime.now() - timedelta(days= day_of_week)), (datetime.now() + timedelta(days = (7 - day_of_week))))).filter(
                    models.Expense.account_id == accountId).order_by(models.Expense.expense_id.desc()).all()
        #idk if this works
        total = db.query(func.sum(distinct(models.Budget.amount))).join(models.Expense).filter(
                                                                    models.Expense.date.between(
                                                                    (datetime.now() - timedelta(days= day_of_week)), (datetime.now() + timedelta(days = (7 - day_of_week))))).filter(
                                                                        models.Expense.account_id == accountId).scalar()
    elif(type == "year"):
        current_year = datetime.now().year
        #get all categories for displayed month
        all_categories = db.query(models.Budget).filter(
            models.Budget.account_id == accountId).filter(models.Budget.year == current_year).order_by(models.Budget.budget_id.asc()).all()
        
        all_related_expenses = db.query(models.Expense).filter(
            extract("YEAR", models.Expense.date) == year).filter(models.Expense.account_id == accountId).order_by(models.Expense.expense_id.desc()).all()
        total = db.query(func.sum(models.Budget.amount)).filter(models.Budget.account_id == accountId).filter(
                                                                models.Budget.year == year).scalar()
    else:
        all_related_expenses = db.query(models.Expense).filter(
            extract("YEAR", models.Expense.date) == year).filter(extract("MONTH", models.Expense.date) == month).filter(models.Expense.account_id == accountId).order_by(models.Expense.expense_id.desc()).all()
        total = db.query(func.sum(models.Budget.amount)).filter(models.Budget.account_id == accountId).filter(
                                                                models.Budget.month == month).filter(
                                                                models.Budget.year == year).scalar()
    
    if not total:
        total = 0
    
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
        if(expense.budget_id):
            item = [(value.name, value.category_id) for _, value in enumerate(category_to_expenses) if value.expense_id == expense.expense_id]
            if item:
                expense_to_budget_name[expense.budget_id] = item[0]
    
    return {"status": "success", "categories": all_categories, "total": total,
            "expenses": all_related_expenses, "expense_relations": expense_to_budget_name,
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
