from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

class AccountsSchema(BaseModel):
    account_id: int | None
    name: str
    username: str
    email: str
    
    class Config:
        from_attributes = True
        validate_by_name = True
        arbitrary_types_allowed = True

class PostAccountSchema(BaseModel):
    name: str
    username: str
    password: str
    email: str
    
    class Config:
        from_attributes = True
        validate_by_name = True
        arbitrary_types_allowed = True

class ListAccountsResponse(BaseModel):
    status: str
    accounts: List[AccountsSchema]

class BudgetsSchema(BaseModel):
    budget_id: int | None
    category_id: int
    amount: float
    account_id: int
    month: int
    year: int
    
    class Config:
        from_attributes = True
        validate_by_name = True
        arbitrary_types_allowed = True

class EditBudgetsSchema(BaseModel):
    budget_id: int
    category_id: int
    amount: float

class EditAllBudgetsSchema(BaseModel):
    budget_id: int
    amount: float

class PostBudgetsSchema(BaseModel):
    category_id: int
    amount: float
    month: int
    year: int
    account_id: int

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
    budget_id: int | None = None
    account_id: int
    cost: float
    description: str
    date: datetime

class PostExpensesSchema(BaseModel):
    budget_id: int | None = None
    account_id: int
    description: str
    cost: float
    date: datetime

class ExpenseToCategorySchema(BaseModel):
    category_id: int
    name: str
    expense_id: int
