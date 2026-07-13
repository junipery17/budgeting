from fastapi import FastAPI
from database import engine, Base
import accounts, budgets, expenses, otherServices, costCalculations, categories
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind = engine)

app = FastAPI()

origins = ["http://localhost:3000", "http://localhost:8000", "http://localhost:5174", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(accounts.account_router, tags=['Accounts'], prefix='/api/accounts')
app.include_router(budgets.budget_router, tags = ["Budgets"], prefix= "/api/budgets")
app.include_router(expenses.expenses_router, tags = ['Expenses'], prefix = '/api/expenses')
app.include_router(otherServices.page_into_router, tags=['main_page_populate'], prefix="/api/mainpage")
app.include_router(costCalculations.expense_calculator, tags=["calculate_expense"], prefix="/api/calculate")
app.include_router(costCalculations.pie_chart_router, tags=["pie_chart_data"], prefix="/api/charts")
app.include_router(categories.category_router, tags=['Categories'], prefix='/api/categories')
app.include_router(costCalculations.top_cat_router, tags=["Top_Category"], prefix='/api/top_category')
