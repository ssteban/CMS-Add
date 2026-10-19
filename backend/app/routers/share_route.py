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


def _require_owner(proyect_id: int, user_id: int):
    if not shareQuery.verify_project_owner(proyect_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )


@router.get("/proyects/{proyect_id}/members")
async def get_members(proyect_id: int, user_id: int = Depends(verify_access_token)):
    _require_owner(proyect_id, user_id)
    result = shareQuery.get_project_members(proyect_id)
    if result.get("status") == "error":
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result.get("message"))
    return {"status": "success", "members": result.get("members")}


@router.delete("/proyects/{proyect_id}/members/{member_user_id}")
async def remove_member(proyect_id: int, member_user_id: int, user_id: int = Depends(verify_access_token)):
    _require_owner(proyect_id, user_id)
    result = shareQuery.remove_member(proyect_id, member_user_id)
    if result.get("status") == "error":
        http_status = status.HTTP_404_NOT_FOUND if result.get("code") == "not_found" else status.HTTP_500_INTERNAL_SERVER_ERROR
        raise HTTPException(status_code=http_status, detail=result.get("message"))
    return {"status": "success", "message": result.get("message")}


@router.get("/proyects/{proyect_id}/invitations")
async def get_project_invitations(proyect_id: int, user_id: int = Depends(verify_access_token)):
    _require_owner(proyect_id, user_id)
    result = shareQuery.get_project_invitations(proyect_id)
    if result.get("status") == "error":
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result.get("message"))
    return {"status": "success", "invitations": result.get("invitations")}


@router.delete("/proyects/{proyect_id}/invitations/{invitation_id}")
async def delete_project_invitation(proyect_id: int, invitation_id: int, user_id: int = Depends(verify_access_token)):
    _require_owner(proyect_id, user_id)
    result = shareQuery.delete_invitation(proyect_id, invitation_id)
    if result.get("status") == "error":
        code = result.get("code")
        http_status = status.HTTP_404_NOT_FOUND if code == "not_found" else (
            status.HTTP_409_CONFLICT if code == "answered" else status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        raise HTTPException(status_code=http_status, detail=result.get("message"))
    return {"status": "success", "message": result.get("message")}
