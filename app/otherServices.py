import schemas, models
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import Depends, HTTPException, status, APIRouter, Response
from database import get_db

page_into_router = APIRouter()

@page_into_router.get('/{accountId}')
def get_page_info(accountId: int, db: Session = Depends(get_db), year: int = None, month: int = None):
    #get displayed monthly total
    total = db.query(models.MonthlyTotals).filter(
        models.MonthlyTotals.account_id == accountId).filter(
        models.MonthlyTotals.year == year).filter(
        models.MonthlyTotals.month == month).one()
    #get other totals of account
    all_totals = db.query(models.MonthlyTotals).filter(
        (models.MonthlyTotals.account_id == accountId)).order_by(models.MonthlyTotals.year.desc(), models.MonthlyTotals.month.desc()).all()
    #get all categories for displayed month
    all_categories = db.query(models.Budget).join(models.MonthlyTotals).filter(
        models.Budget.total_id == total.total_id).all()
    #get all budget_ids for displayed month
    all_budgets = [x.budget_id for x in all_categories]
    #get most recent 10 to display on main page
    all_related_expenses = db.query(models.Expense).filter(
        models.Expense.budget_id.in_(all_budgets)).order_by(models.Expense.expense_id.desc()).limit(10).all()
    
    # get total amount allocated grab sum of budget amounts of monthly total
    currently_allocated = db.query(func.sum(models.Budget.amount).label("total_allocated")).filter(models.Budget.total_id == total.total_id).scalar()
    
    expense_to_budget_name = {}
    for expense in all_related_expenses:
        expense_to_budget_name[expense.budget_id] = [value.budget_type for i, value in enumerate(all_categories) if value.budget_id == expense.budget_id][0]
    
    return {"status": "success", "current_total": total,
            "all_totals": all_totals, "categories": all_categories,
            "expenses": all_related_expenses, "expense_relations": expense_to_budget_name,
            "currently_allocated": currently_allocated}

# @page_into_router.post("/{totalId}/{subCategory}")
# def add_expense_and_update_category(totalId: int, subCategory: str, payload: schemas.ExpensesSchema, db: Session = Depends(get_db)):
#     #make new expense
#     new_expense = models.Expense(**payload.model_dump())
#     db.add(new_expense)
#     db.commit()
#     db.refresh(new_expense)
    
#     update_category_from_expense(totalId, subCategory, new_expense.cost, db)
#     # update totals (total_expenses)
#     update_monthly_total_from_expense(totalId, new_expense.cost, db)
    
# def update_category_from_expense(totalId: int, category: str, cost: float, db: Session = Depends(get_db)):
#     budget_query = db.query(models.Budget).filter(
#                                                 models.Budget.total_id == totalId).filter(
#                                                 models.Budget.budget_type == category)
#     selected_budget = budget_query.first()
#     if not selected_budget:
#         raise HTTPException(status_code = status.HTTP_404_NOT_FOUND,
#                             detail = "No budget found for this")
    
#     update_budget_data = selected_budget.spent + cost
#     copy_of_selected_budget = selected_budget
#     copy_of_selected_budget.spent = update_budget_data
#     budget_query.filter(models.Budget.budget_id == selected_budget.budget_id).update(copy_of_selected_budget,
#                                                                                      synchronize_session=False)
#     db.commit()
#     db.refresh(selected_budget)

# def update_monthly_total_from_expense(totalId: int, cost: float, db: Session = Depends(get_db)):
#     monthly_query = db.query(models.MonthlyTotals).filter(models.MonthlyTotals.total_id == totalId)
#     selected_monthly_total = monthly_query.first()
    
#     updated_total_expense = selected_monthly_total.total_expenses + cost
#     selected_monthly_total.total_expenses = updated_total_expense
#     monthly_query.filter(models.MonthlyTotals.total_id == totalId).update(selected_monthly_total,
#                                                                           synchronize_session= False)
#     db.commit()
#     db.refresh(selected_monthly_total)

# @page_into_router.patch('/{expenseId}')
# def update_expense_and_total_spent(expenseId: int, payload: schemas.ExpensesSchema, db: Session = Depends(get_db)):
    
#     expense_query = db.query(models.Expense).filter(models.Expense.expense_id == expenseId)
#     selected_expense = expense_query.first()
    
#     if not selected_expense:
#         raise HTTPException(status_code = status.HTTP_404_NOT_FOUND,
#                             detail = f"No Expense with this ID: {expenseId} found")
#     update_data = payload.model_dump(exclude_unset=True)
#     cost_difference = payload.cost - selected_expense.cost
#     expense_query.filter(models.Expense.expense_id == expenseId).update(update_data,
#                                                                         synchronize_session= False)
#     db.commit()
#     db.refresh(selected_expense)
    
#     if cost_difference != 0:
#         selected_budget = db.query(models.Budget).filter(models.Budget.budget_id == selected_expense.budget_id).first()
#         update_category_from_expense(selected_budget.total_id, selected_budget.budget_type, cost_difference, db)
#         update_monthly_total_from_expense(selected_budget.total_id, cost_difference, db)

