from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth_util import verify_access_token, create_api_key, hash_api_key, mask_api_key, mask_key_hash
from app.models.proyect_model import CreateProyect, UpdateProyect, CreateApiKeyRequest
from app.models.user_model import UpdateProfileRequest, changePasswordRequest
from app.db.proyect_query import proyectQuery
from app.db.api_key_query import apiKeyQuery
from app.db.auth_query import AuthQuery

router = APIRouter()


@router.get("/proyects")
async def get_proyects(user_id: int = Depends(verify_access_token)):
    result = proyectQuery.get_proyects_by_user(user_id)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )

    return {"status": "success", "proyects": result.get("proyects")}


@router.post("/create-proyects")
async def create_proyects(proyect: CreateProyect, user_id: int = Depends(verify_access_token)):
    result = proyectQuery.create_proyect(proyect.name, proyect.url, user_id)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )

    return {
        "status": "success",
        "message": "Proyecto creado exitosamente",
        "proyect": result.get("proyect")
    }


@router.put("/proyects/{proyect_id}")
async def update_proyect(proyect_id: int, proyect: UpdateProyect, user_id: int = Depends(verify_access_token)):
    result = proyectQuery.update_proyect(proyect_id, proyect.name, proyect.url, user_id)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )

    return {
        "status": "success",
        "message": "Proyecto actualizado exitosamente",
        "proyect": result.get("proyect")
    }


@router.post("/proyects/{proyect_id}/api-keys")
async def create_api_key_endpoint(proyect_id: int, body: CreateApiKeyRequest, user_id: int = Depends(verify_access_token)):
    if not apiKeyQuery.verify_project_ownership(proyect_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    plain_key = create_api_key()
    key_hash = hash_api_key(plain_key)
    masked = mask_api_key(plain_key)

    result = apiKeyQuery.create_key(proyect_id, body.key_name, key_hash)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )

    return {
        "status": "success",
        "id": result["key"]["id"],
        "key_name": result["key"]["key_name"],
        "plain_key": plain_key,
        "masked_key": masked,
        "created_at": result["key"]["created_at"]
    }


@router.get("/proyects/{proyect_id}/api-keys")
async def get_api_keys(proyect_id: int, user_id: int = Depends(verify_access_token)):
    if not apiKeyQuery.verify_project_ownership(proyect_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    result = apiKeyQuery.get_keys_by_project(proyect_id)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )

    keys = []
    for k in result.get("keys", []):
        keys.append({
            "id": k["id"],
            "key_name": k["key_name"],
            "masked_key": mask_key_hash(k["api_key_hash"]),
            "created_at": k["created_at"]
        })

    return {"status": "success", "keys": keys}


@router.delete("/proyects/{proyect_id}/api-keys/{key_id}")
async def revoke_api_key(proyect_id: int, key_id: int, user_id: int = Depends(verify_access_token)):
    if not apiKeyQuery.verify_project_ownership(proyect_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    result = apiKeyQuery.delete_key(key_id, proyect_id)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )

    return {"status": "success", "message": "Llave revocada exitosamente"}


@router.get("/profile")
async def get_profile(user_id: int = Depends(verify_access_token)):
    result = AuthQuery.get_profile(user_id)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )

    return {"status": "success", "profile": result["profile"]}


@router.put("/profile")
async def update_profile(body: UpdateProfileRequest, user_id: int = Depends(verify_access_token)):
    result = AuthQuery.update_profile(user_id, body.username, body.email)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message")
        )

    return {"status": "success", "profile": result["profile"]}


@router.delete("/proyects/{proyect_id}")
async def delete_proyect(proyect_id: int, user_id: int = Depends(verify_access_token)):
    result = proyectQuery.delete_proyect(proyect_id, user_id)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )

    return {"status": "success", "message": result["message"]}


@router.post("/change-password")
async def change_password(body: changePasswordRequest, user_id: int = Depends(verify_access_token)):
    result = AuthQuery.change_password(user_id, body.password, body.new_password)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message")
        )

    return {"status": "success", "message": result["message"]}
