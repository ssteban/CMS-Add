import jwt
import datetime
import bcrypt
import hashlib
from dotenv import load_dotenv
import os
import secrets
from fastapi import Header, HTTPException, status

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key_para_desarrollo")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def create_access_token(data: dict):
    payload = {
        "user_id": data.get("id"),
        "email": data.get("email"),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_access_token(authorization: str = Header(None)):
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no proporcionado"
        )
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Formato de token inválido"
        )
    token = authorization[7:]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise Exception("Token expirado")
    except jwt.InvalidTokenError:
        raise Exception("Token inválido")

def create_api_key():
    return secrets.token_urlsafe(32)

def hash_api_key(plain_key: str) -> str:
    return hashlib.sha256(plain_key.encode()).hexdigest()

def mask_api_key(plain_key: str) -> str:
    last4 = plain_key[-4:] if len(plain_key) >= 4 else plain_key
    return f"{'•' * (len(plain_key) - 4)}{last4}"

def mask_key_hash(key_hash: str) -> str:
    first8 = key_hash[:8] if len(key_hash) >= 8 else key_hash
    last4 = key_hash[-4:] if len(key_hash) >= 4 else key_hash
    return f"{first8}••••••{last4}"


