from fastapi import Depends, HTTPException, status
from fastapi import APIRouter
from sqlalchemy.orm import Session
from app.schemaes.auth import UserAuth
from app.schemaes.auth import RegisterUser
from app.config.db import get_db
from app.helper import create_access_token,get_password_hash,verify_password,oauth2_scheme,decode_access_token
from app.models.auth import User

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)




@router.get("/me")
def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return {
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }

@router.post("/login")
def login(
    UserSchema : UserAuth,
    db: Session = Depends(get_db)
):
    """
    Endpoint for user login.
    """
    user  = db.query(
        User
    ).filter(
        User.email == UserSchema.email
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(UserSchema.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
     
    access_token = create_access_token(data={"sub": user.email, "user_id": str(user.id)})

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register")
def register(
    user_create: RegisterUser,
    db: Session = Depends(get_db)):
    
    existing_user = db.query(User).filter(User.email == user_create.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    hashed_password = get_password_hash(user_create.password)
    new_user = User(
        email=user_create.email,
        first_name=user_create.first_name,
        last_name=user_create.last_name,
        password=hashed_password,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully",
            "user_id": new_user.id}

