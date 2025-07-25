from pydantic import BaseModel,field_validator
from typing import Any

class JWTToken(BaseModel):
    access_token: str


class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    

class UserAuth(BaseModel):
    email: str
    password : str
    
class RegisterUser(UserBase):
    password: str
    confirm_password: str
    
    @field_validator("confirm_password")
    @classmethod
    def check_passwords_match(cls, v: str,info):
        if v != info.data.get("password"):
            raise ValueError("Passwords do not match")
        return v    
