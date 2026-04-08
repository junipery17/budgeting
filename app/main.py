from fastapi import FastAPI, APIRouter
from database import engine, Base
import accounts, budgets, expenses

Base.metadata.create_all(bind = engine)

app = FastAPI()

@app.get("/")
def main():
    return {"message": "Hello World"}

app.include_router(accounts.account_router, tags=['Accounts'], prefix='/api/accounts')
app.include_router(budgets.budget_router, tags = ["Budgets"], prefix= "/api/budgets")
app.include_router(expenses.expenses_router, tags = ['Expenses'], prefix = '/api/expenses')
