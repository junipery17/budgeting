from database import Base
from sqlalchemy import Column, Integer, String, Boolean, Float, Time, ForeignKey

class Account(Base):
    __tablename__ = "accounts"
    
    account_id = Column(Integer, primary_key = True)
    name = Column(String(50), nullable = False)
    username = Column(String(50), nullable=False)
    password = Column(String(75), nullable=False)
    email = Column(String(50), nullable=False)

class Category(Base):
    __tablename__ = "categories"
    
    category_id = Column(Integer, primary_key= True, nullable = False)
    name = Column(String(50), nullable = False)
    account_id = Column(Integer, ForeignKey(Account.account_id), nullable=False)
    
class Budget(Base):
    __tablename__ = "budgets"

    budget_id = Column(Integer, primary_key = True, nullable = False)
    category_id = Column(Integer, ForeignKey(Category.category_id), nullable=False)
    amount = Column(Float)
    month = Column(Integer, nullable= False)
    year = Column(Integer, nullable = False)
    account_id = Column(Integer, ForeignKey(Account.account_id), nullable = False)
    
class Expense(Base):
    __tablename__ = "expenses"
    
    expense_id = Column(Integer, primary_key = True, nullable = False)
    budget_id = Column(Integer, ForeignKey(Budget.budget_id))
    account_id = Column(Integer, ForeignKey(Account.account_id), nullable = False)
    cost = Column(Float, nullable = False)
    description = Column(String(75))
    date = Column(Time)

