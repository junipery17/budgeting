from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

class AccountsSchema(BaseModel):
    account_id: int | None
    name: str
    
    class Config:
        from_attributes = True
        validate_by_name = True
        arbitrary_types_allowed = True

class PostAccountSchema(BaseModel):
    name: str

class ListAccountsResponse(BaseModel):
    status: str
    accounts: List[AccountsSchema]

class MonthlyTotalsSchema(BaseModel):
    total_id: int | None
    account_id: int
    month: int
    year: int
    total_expenses: float
    monthly_budget: float
    
    class Config:
        from_attributes = True
        validate_by_name = True
        arbitrary_types_allowed = True

class MonthlyTotalsListSchema(BaseModel):
    status: str 
    totals: List[MonthlyTotalsSchema]

class MonthlyTotalsPostSchema(BaseModel):
    account_id: int
    month: int
    year: int
    total_expenses: float
    monthly_budget: float

class BudgetsSchema(BaseModel):
    budget_id: int | None
    total_id: int
    category_id: int
    amount: float
    spent: float
    
    class Config:
        from_attributes = True
        validate_by_name = True
        arbitrary_types_allowed = True

class EditBudgetsSchema(BaseModel):
    budget_id: int
    category_id: int
    amount: float

class PostBudgetsSchema(BaseModel):
    total_id: int
    category_id: int
    amount: float
    spent: float

class CategoriesSchema(BaseModel):
    category_id: int
    name: str
    account_id: int
    
    class Config:
        from_attributes = True
        validate_by_name = True
        arbitrary_types_allowed = True

class PostCategorySchema(BaseModel):
    name: str
    account_id: int
    
class ListBudgetsResponse(BaseModel):
    status: str
    budgets: List[BudgetsSchema]

class ExpensesSchema(BaseModel):
    expense_id: int | None = None
    budget_id: int
    account_id: int
    cost: float
    description: str
    date: datetime

class PostExpensesSchema(BaseModel):
    budget_id: int
    account_id: int
    description: str
    cost: float
    date: datetime

class ExpenseToCategorySchema(BaseModel):
    category_id: int
    name: str
    expense_id: int
