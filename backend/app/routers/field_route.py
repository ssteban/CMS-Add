from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth_util import verify_access_token
from app.models.field_model import SaveFieldsRequest
from app.db.field_query import fieldQuery
from app.db.proyect_query import proyectQuery

router = APIRouter()


@router.get("/proyects/{proyect_id}/fields")
async def get_fields(proyect_id: int, user_id: int = Depends(verify_access_token)):
    if not fieldQuery.verify_project_ownership(proyect_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    result = fieldQuery.get_fields_by_project(proyect_id)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )

    return {"status": "success", "fields": result.get("fields")}


@router.put("/proyects/{proyect_id}/fields")
async def save_fields(proyect_id: int, body: SaveFieldsRequest, user_id: int = Depends(verify_access_token)):
    if not fieldQuery.verify_project_ownership(proyect_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    fields_data = [f.model_dump() for f in body.fields]
    result = fieldQuery.save_fields(proyect_id, fields_data)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )

    return {"status": "success", "fields": result.get("fields")}


@router.post("/proyects/{proyect_id}/publish")
async def publish_fields(proyect_id: int, user_id: int = Depends(verify_access_token)):
    if not fieldQuery.verify_project_ownership(proyect_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    fields_result = fieldQuery.get_fields_by_project(proyect_id)

    if fields_result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=fields_result.get("message")
        )

    proyects_result = proyectQuery.get_proyects_by_user(user_id)

    project_name = "Proyecto"
    for p in proyects_result.get("proyects", []):
        if p["id"] == proyect_id:
            project_name = p["name"]
            break

    fields = fields_result.get("fields", [])
    data = []
    for f in fields:
        data.append({
            "key": f["key_name"],
            "value": f["key_value"],
            "type": f["key_type"]
        })

    json_output = {
        "website": project_name,
        "total_fields": len(data),
        "data": data
    }

    import json
    json_str = json.dumps(json_output, ensure_ascii=False)

    publish_result = fieldQuery.publish_json(proyect_id, json_str)

    if publish_result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=publish_result.get("message")
        )

    return {"status": "success", "published_json": json_output}


@router.get("/proyects/{proyect_id}/published-json")
async def get_published_json(proyect_id: int, user_id: int = Depends(verify_access_token)):
    if not fieldQuery.verify_project_ownership(proyect_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    result = fieldQuery.get_published_json(proyect_id)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )

    if result["published_json"] is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El contenido aún no ha sido publicado"
        )

    return result["published_json"]
