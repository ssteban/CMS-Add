from fastapi import APIRouter, HTTPException, status, Query
from app.utils.auth_util import hash_api_key
from app.db.public_query import publicQuery

router = APIRouter()


@router.get("/content")
async def get_public_content(api_key: str = Query(..., description="API Key del proyecto")):
    key_hash = hash_api_key(api_key)

    result = publicQuery.get_content_by_api_key(key_hash)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )

    return result["published_json"]
