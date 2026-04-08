from datetime import datetime
from pydantic import BaseModel
from typing import List

class AccountsSchema(BaseModel):
    account_id: int | None = None
    name: str
    budget: float
    
    class Config:
        from_attributes = True
        validate_by_name = True
        arbitrary_types_allowed = True

class ListAccountsResponse(BaseModel):
    status: str
    accounts: List[AccountsSchema]

class BudgetsSchema(BaseModel):
    budget_id: int | None = None
    account_id: int
    budget_type: str
    monthly: bool
    amount: float
    time_period: datetime
    
    class Config:
        from_attributes = True
        validate_by_name = True
        arbitrary_types_allowed = True

class ListBudgetsResponse(BaseModel):
    status: str
    account: str
    budgets: List[BudgetsSchema]

class ExpensesSchema(BaseModel):
    expense_id: int | None = None
    budget_id: int
    cost: float
    budget_type: str
    description: str
    timestamp: datetime
