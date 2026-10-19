from app.db.init import DatabaseConnection


class shareQuery:
    @staticmethod
    def verify_project_owner(proyect_id, user_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "SELECT id_web FROM websites WHERE id_web = %s AND id_users = %s",
                    (proyect_id, user_id)
                )
                row = cursor.fetchone()
                return row is not None
        except Exception:
            return False

    @staticmethod
    def get_user_by_email(email):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "SELECT id_users, username, email FROM users WHERE LOWER(email) = LOWER(%s)",
                    (email,)
                )
                row = cursor.fetchone()
                if not row:
                    return {"status": "error", "message": "No existe ningún usuario con ese email"}
                return {
                    "status": "success",
                    "user": {"id": row[0], "username": row[1], "email": row[2]}
                }
        except Exception as e:
            return {"status": "error", "message": f"Error al buscar usuario: {str(e)}"}

    @staticmethod
    def is_member(proyect_id, user_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "SELECT 1 FROM project_members WHERE id_web = %s AND id_users = %s",
                    (proyect_id, user_id)
                )
                return cursor.fetchone() is not None
        except Exception:
            return False

    @staticmethod
    def create_invitation(proyect_id, id_inviter, id_invitee):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    """INSERT INTO project_invitations (id_web, id_inviter, id_invitee, status)
                       VALUES (%s, %s, %s, 'pending')
                       ON CONFLICT (id_web, id_invitee)
                       DO UPDATE SET status = 'pending', id_inviter = EXCLUDED.id_inviter, created_at = CURRENT_TIMESTAMP
                       RETURNING id_invitation""",
                    (proyect_id, id_inviter, id_invitee)
                )
                row = cursor.fetchone()
                return {"status": "success", "id_invitation": row[0]}
        except Exception as e:
            return {"status": "error", "message": f"Error al crear invitación: {str(e)}"}

    @staticmethod
    def get_pending_invitations(user_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    """SELECT i.id_invitation, i.created_at, w.id_web, w.name, u.username
                       FROM project_invitations i
                       JOIN websites w ON w.id_web = i.id_web
                       JOIN users u ON u.id_users = i.id_inviter
                       WHERE i.id_invitee = %s AND i.status = 'pending'
                       ORDER BY i.created_at DESC""",
                    (user_id,)
                )
                rows = cursor.fetchall()
                notifications = []
                for row in rows:
                    notifications.append({
                        "id": row[0],
                        "created_at": row[1].strftime("%Y-%m-%d %H:%M:%S"),
                        "project_id": row[2],
                        "project_name": row[3],
                        "inviter": row[4]
                    })
                return {"status": "success", "notifications": notifications}
        except Exception as e:
            return {"status": "error", "message": f"Error al obtener notificaciones: {str(e)}"}

    @staticmethod
    def respond_invitation(id_invitation, user_id, accept):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "SELECT id_web, status FROM project_invitations WHERE id_invitation = %s AND id_invitee = %s",
                    (id_invitation, user_id)
                )
                row = cursor.fetchone()
                if not row:
                    return {"status": "error", "code": "not_found", "message": "Invitación no encontrada"}
                if row[1] != "pending":
                    return {"status": "error", "code": "answered", "message": "La invitación ya fue respondida"}

                proyect_id = row[0]

                if accept:
                    cursor.execute(
                        "INSERT INTO project_members (id_web, id_users) VALUES (%s, %s) ON CONFLICT (id_web, id_users) DO NOTHING",
                        (proyect_id, user_id)
                    )
                    cursor.execute(
                        "UPDATE project_invitations SET status = 'accepted' WHERE id_invitation = %s",
                        (id_invitation,)
                    )
                else:
                    cursor.execute(
                        "UPDATE project_invitations SET status = 'declined' WHERE id_invitation = %s",
                        (id_invitation,)
                    )

                return {
                    "status": "success",
                    "project_id": proyect_id,
                    "message": "Invitación aceptada" if accept else "Invitación rechazada"
                }
        except Exception as e:
            return {"status": "error", "code": "internal", "message": f"Error al responder invitación: {str(e)}"}

    @staticmethod
    def get_project_members(proyect_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    """SELECT m.id_users, u.username, u.email, m.created_at
                       FROM project_members m
                       JOIN users u ON u.id_users = m.id_users
                       WHERE m.id_web = %s
                       ORDER BY m.created_at ASC""",
                    (proyect_id,)
                )
                rows = cursor.fetchall()
                members = []
                for row in rows:
                    members.append({
                        "user_id": row[0],
                        "username": row[1],
                        "email": row[2],
                        "created_at": row[3].strftime("%Y-%m-%d %H:%M:%S")
                    })
                return {"status": "success", "members": members}
        except Exception as e:
            return {"status": "error", "message": f"Error al obtener miembros: {str(e)}"}

    @staticmethod
    def remove_member(proyect_id, member_user_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "DELETE FROM project_members WHERE id_web = %s AND id_users = %s RETURNING id_members",
                    (proyect_id, member_user_id)
                )
                if cursor.fetchone() is None:
                    return {"status": "error", "code": "not_found", "message": "Este usuario no tiene acceso al proyecto"}
                return {"status": "success", "message": "Acceso retirado"}
        except Exception as e:
            return {"status": "error", "code": "internal", "message": f"Error al retirar acceso: {str(e)}"}

    @staticmethod
    def get_project_invitations(proyect_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    """SELECT i.id_invitation, i.created_at, u.username, u.email
                       FROM project_invitations i
                       JOIN users u ON u.id_users = i.id_invitee
                       WHERE i.id_web = %s AND i.status = 'pending'
                       ORDER BY i.created_at DESC""",
                    (proyect_id,)
                )
                rows = cursor.fetchall()
                invitations = []
                for row in rows:
                    invitations.append({
                        "id": row[0],
                        "created_at": row[1].strftime("%Y-%m-%d %H:%M:%S"),
                        "username": row[2],
                        "email": row[3]
                    })
                return {"status": "success", "invitations": invitations}
        except Exception as e:
            return {"status": "error", "message": f"Error al obtener invitaciones: {str(e)}"}

    @staticmethod
    def delete_invitation(proyect_id, invitation_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "SELECT status FROM project_invitations WHERE id_invitation = %s AND id_web = %s",
                    (invitation_id, proyect_id)
                )
                row = cursor.fetchone()
                if not row:
                    return {"status": "error", "code": "not_found", "message": "Invitación no encontrada"}
                if row[0] != "pending":
                    return {"status": "error", "code": "answered", "message": "La invitación ya fue respondida"}
                cursor.execute(
                    "DELETE FROM project_invitations WHERE id_invitation = %s",
                    (invitation_id,)
                )
                return {"status": "success", "message": "Invitación eliminada"}
        except Exception as e:
            return {"status": "error", "code": "internal", "message": f"Error al eliminar invitación: {str(e)}"}
