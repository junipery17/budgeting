import schemas, models
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, APIRouter, Response
from database import get_db

account_router = APIRouter()

@account_router.get('/')
def get_accounts(db: Session = Depends(get_db), search: str = ''):
    accounts = db.query(models.Account).filter(
            models.Account.name.contains(search)).all()
    return {'status': 'success', 'accounts': accounts}

@account_router.get('/{accountId}')
def get_account(accountId: int, db: Session = Depends(get_db)):
    account = db.query(models.Account).filter(models.Account.account_id == accountId).first()
    if not account:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND,
                                detail = f"No account with this ID: {accountId} found")
    return {"status": "success", "account": account}

@account_router.post('/')
def create_account(payload: schemas.AccountsSchema, db: Session = Depends(get_db)):
    new_account = models.Account(**payload.model_dump())
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
