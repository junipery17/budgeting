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
    budget_type: str
    date_time: datetime
    amount: float
    spent: float
    
    class Config:
        from_attributes = True
        validate_by_name = True
        arbitrary_types_allowed = True

class PostBudgetsSchema(BaseModel):
    total_id: int
    budget_type: str
    date_time: datetime
    amount: float

class ListBudgetsResponse(BaseModel):
    status: str
    budgets: List[BudgetsSchema]

class ExpensesSchema(BaseModel):
    expense_id: int | None = None
    budget_id: int
    cost: float
    description: str
    timestamp: datetime

