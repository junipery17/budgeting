import schemas, models
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, APIRouter, Response
from database import get_db
import os
from dotenv import load_dotenv
import hashlib

account_router = APIRouter()

@account_router.get('/')
def get_accounts(db: Session = Depends(get_db), search: str = ''):
    accounts = db.query(models.Account).filter(
            models.Account.name.contains(search)).order_by(models.Account.account_id.asc()).all()
    return {'status': 'success', 'accounts': accounts}

@account_router.get('/{accountId}')
def get_account(accountId: int, db: Session = Depends(get_db)):
    account = db.query(models.Account).filter(models.Account.account_id == accountId).first()
    if not account:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND,
                                detail = f"No account with this ID: {accountId} found")
    return {"status": "success", "account": account}

@account_router.get('/pass/{username}')
def get_password(username: str, input_password: str, db: Session = Depends(get_db)):
    load_dotenv()
    salt = os.getenv("salt")
    input_password += salt
    encrypted_test = hashlib.sha256(input_password.encode())
    saved_password = db.query(models.Account).filter(models.Account.username == username).first()
    if(encrypted_test.hexdigest() == saved_password.password):
        return {"status": "success", "id": saved_password.account_id, "name": saved_password.name}
    else:
        return {"status": "fail"}

@account_router.post('/')
def create_account(payload: schemas.PostAccountSchema, db: Session = Depends(get_db)):
    if(find_username(payload.username, db)):
        return {"status": "fail"}
    load_dotenv()
    salt = os.getenv("salt")
    password = payload.password + salt
    encrypted_password = hashlib.sha256(password.encode())
    new_account = models.Account(name= payload.name, username= payload.username, password=encrypted_password.hexdigest(), email=payload.email)
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    return {"status": "success", "account": new_account}

@account_router.patch('/{accountId}')
def update_account(accountId: int, payload: schemas.AccountsSchema, db: Session = Depends(get_db)):
    account_query = db.query(models.Account).filter(models.Account.account_id == accountId)
    db_account = account_query.first()

    if not db_account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f'No account with this id: {accountId} found')
    update_data = payload.model_dump(exclude_unset=True)
    account_query.filter(models.Account.account_id == accountId).update(update_data,
                                                       synchronize_session=False)
    db.commit()
    db.refresh(db_account)
    return {"status": "success", "account": db_account}

@account_router.delete('/{accountId}')
def delete_account(accountId: int, db: Session = Depends(get_db)):
    account_query = db.query(models.Account).filter(models.Account.account_id == accountId)
    account = account_query.first()
    if not account:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND,
                            detail = f"No account with this id: {accountId} found")
    account_query.delete(synchronize_session = False)
    db.commit()
    return Response(status_code = status.HTTP_204_NO_CONTENT)

def find_username(username: str, db: Session = Depends(get_db)):
    accounts = db.query(models.Account).filter(models.Account.username == username).all()
    if(accounts):
        return True
    else:
        return False
