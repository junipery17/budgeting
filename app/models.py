from database import Base
from sqlalchemy import Column, Integer, String, Boolean, Float, Time, ForeignKey

class Account(Base):
    __tablename__ = "accounts"
    
    account_id = Column(Integer, primary_key = True)
    name = Column(String(50), nullable = False)
class MonthlyTotals(Base):
    __tablename__ = "monthly_totals"
    
    total_id = Column(Integer, primary_key = True, nullable = False)
    account_id = Column(Integer, ForeignKey(Account.account_id), nullable = False)
    month = Column(Integer, nullable = False)
    year = Column(Integer, nullable = False)
    total_expenses = Column(Float)
    monthly_budget = Column(Float)
    
class Budget(Base):
    __tablename__ = "budgets"

    budget_id = Column(Integer, primary_key = True, nullable = False)
    total_id = Column(Integer, ForeignKey(MonthlyTotals.total_id), nullable = False)
    budget_type = Column(String(50), nullable = False)
    date_time = Column(Time, nullable = False)
    amount = Column(Float)
    spent = Column(Float)

class Expense(Base):
    __tablename__ = "expenses"
    
    expense_id = Column(Integer, primary_key = True, nullable = False)
    budget_id = Column(Integer, ForeignKey(Budget.budget_id), nullable = False)
    cost = Column(Float, nullable = False)
    description = Column(String(75))
    timestamp = Column(Time, nullable = False)

