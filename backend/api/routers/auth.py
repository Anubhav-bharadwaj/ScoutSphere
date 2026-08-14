from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

from backend.core.database import get_db
from backend.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from backend.models.user import User
from backend.schemas.user import UserCreate
from backend.schemas.token import Token

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=Token)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    hashed_pwd = hash_password(user_in.password)
    new_user = User(
        email=user_in.email,
        password_hash=hashed_pwd
    )
    db.add(new_user)
    try:
        await db.commit()
        await db.refresh(new_user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")

    access_token = create_access_token(str(new_user.id), new_user.role)
    refresh_token = create_refresh_token(str(new_user.id))

    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/login", response_model=Token)
async def login(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(str(user.id), user.role)
    refresh_token = create_refresh_token(str(user.id))

    return Token(access_token=access_token, refresh_token=refresh_token)
