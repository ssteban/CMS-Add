from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth_util import verify_access_token
from app.models.share_model import ShareProjectRequest
from app.db.share_query import shareQuery

router = APIRouter()


@router.post("/proyects/{proyect_id}/share")
async def share_proyect(proyect_id: int, body: ShareProjectRequest, user_id: int = Depends(verify_access_token)):
    if not shareQuery.verify_project_owner(proyect_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    invitee_result = shareQuery.get_user_by_email(body.email.strip())
    if invitee_result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=invitee_result.get("message")
        )

    invitee = invitee_result["user"]

    if invitee["id"] == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes compartir el proyecto contigo mismo"
        )

    if shareQuery.is_member(proyect_id, invitee["id"]):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este usuario ya tiene acceso al proyecto"
        )

    result = shareQuery.create_invitation(proyect_id, user_id, invitee["id"])
    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )

    return {
        "status": "success",
        "message": f"Invitación enviada a {invitee['username']}"
    }


@router.get("/notifications")
async def get_notifications(user_id: int = Depends(verify_access_token)):
    result = shareQuery.get_pending_invitations(user_id)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )

    return {"status": "success", "notifications": result.get("notifications")}


async def _respond(invitation_id: int, user_id: int, accept: bool):
    result = shareQuery.respond_invitation(invitation_id, user_id, accept)

    if result.get("status") == "error":
        code = result.get("code")
        if code == "not_found":
            http_status = status.HTTP_404_NOT_FOUND
        elif code == "answered":
            http_status = status.HTTP_409_CONFLICT
        else:
            http_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        raise HTTPException(
            status_code=http_status,
            detail=result.get("message")
        )

    return {
        "status": "success",
        "message": result.get("message"),
        "project_id": result.get("project_id")
    }


@router.post("/notifications/{invitation_id}/accept")
async def accept_notification(invitation_id: int, user_id: int = Depends(verify_access_token)):
    return await _respond(invitation_id, user_id, accept=True)


@router.post("/notifications/{invitation_id}/decline")
async def decline_notification(invitation_id: int, user_id: int = Depends(verify_access_token)):
    return await _respond(invitation_id, user_id, accept=False)
