from fastapi import APIRouter, HTTPException, status
from app.utils.auth_util import hash_password, create_access_token
from app.models.user_model import CreateUser, AuthenticatedUser
from app.db.auth_query import AuthQuery

router = APIRouter()

@router.post("/register")
async def register(user: CreateUser):
    # Encriptamos la contraseña
    user.password = hash_password(user.password)
    
    # Intentamos registrar en BD
    request = AuthQuery.register_user(user.username, user.email, user.password)
    
    # Si hay error (ej. IntegrityError por correo duplicado)
    if request.get("status") == "error":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=request.get("message"))
        
    return {"status": "success", "message": "Usuario Registrado exitosamente", "id": request.get("id")}


@router.post("/login")
async def login(user: AuthenticatedUser):
    request = AuthQuery.authenticate_user(user.email, user.password)
    
    if request.get("status") == "error":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=request.get("message"))
        
    token = create_access_token({"id": request.get("id"), "email": user.email})
    
    return {
        "status": "success", 
        "message": "Usuario autenticado exitosamente", 
        "username": request.get("username"), 
        "token": token
    }
