from pydantic import BaseModel


class CreateUser(BaseModel):
    username: str
    email: str
    password: str

class ViewUser(BaseModel):
    id: int
    username: str
    email: str
    created_at: str
    updated_at: str

class AuthenticatedUser(BaseModel):
    email: str
    password: str

class PasswordRecoveryRequest(BaseModel):
    email: str

class changePasswordRequest(BaseModel):
    password: str
    new_password: str
