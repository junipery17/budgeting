from database import Base
from sqlalchemy import Column, Integer, String, Boolean, Float, Time

class Account(Base):
    __tablename__ = "accounts"
    
    account_id = Column(Integer, primary_key = True, nullable = False)
    name = Column(String(50), nullable = False)
    budget = Column(Float, nullable = False)

class Budget(Base):
    __tablename__ = "budgets"
    
    budget_id = Column(Integer, primary_key = True, nullable = False)
    account_id = Column(Integer, nullable = False)
    budget_type = Column(String(50), nullable = False)
    monthly = Column(Boolean)
    amount = Column(Float)
    time_period = Column(String(50))

class Expense(Base):
    __tablename__ = "expenses"
    
    expense_id = Column(Integer, primary_key = True, nullable = False)
    budget_id = Column(Integer, nullable = False)
    cost = Column(Float, nullable = False)
    budget_type = Column(String(50), nullable = False)
    description = Column(String(75))
    timestamp = Column(Time, nullable = False)
