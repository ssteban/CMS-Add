import psycopg2
from app.db.init import DatabaseConnection


class proyectQuery:
    @staticmethod
    def create_proyect(name, url, user_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "INSERT INTO websites (id_users, name, url) VALUES (%s, %s, %s) RETURNING id_web, name, url, created_at, update_at",
                    (user_id, name, url)
                )
                row = cursor.fetchone()
                return {
                    "status": "success",
                    "proyect": {
                        "id": row[0],
                        "name": row[1],
                        "url": row[2],
                        "created_at": row[3].strftime("%Y-%m-%d %H:%M:%S"),
                        "updated_at": row[4].strftime("%Y-%m-%d %H:%M:%S")
                    }
                }
        except Exception as e:
            return {"status": "error", "message": f"Error interno del servidor: {str(e)}"}

    @staticmethod
    def get_proyects_by_user(user_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "SELECT id_web, name, url, created_at, update_at FROM websites WHERE id_users = %s ORDER BY created_at DESC",
                    (user_id,)
                )
                rows = cursor.fetchall()
                proyects = []
                for row in rows:
                    proyects.append({
                        "id": row[0],
                        "name": row[1],
                        "url": row[2],
                        "created_at": row[3].strftime("%Y-%m-%d %H:%M:%S"),
                        "updated_at": row[4].strftime("%Y-%m-%d %H:%M:%S")
                    })
                return {"status": "success", "proyects": proyects}
        except Exception as e:
            return {"status": "error", "message": f"Error al obtener proyectos: {str(e)}"}

    @staticmethod
    def update_proyect(proyect_id, name, url, user_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "UPDATE websites SET name = %s, url = %s, update_at = CURRENT_TIMESTAMP WHERE id_web = %s AND id_users = %s RETURNING id_web, name, url, created_at, update_at",
                    (name, url, proyect_id, user_id)
                )
                row = cursor.fetchone()
                if not row:
                    return {"status": "error", "message": "Proyecto no encontrado"}
                return {
                    "status": "success",
                    "proyect": {
                        "id": row[0],
                        "name": row[1],
                        "url": row[2],
                        "created_at": row[3].strftime("%Y-%m-%d %H:%M:%S"),
                        "updated_at": row[4].strftime("%Y-%m-%d %H:%M:%S")
                    }
                }
        except Exception as e:
            return {"status": "error", "message": f"Error al actualizar proyecto: {str(e)}"}

    @staticmethod
    def delete_proyect(proyect_id, user_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "DELETE FROM websites WHERE id_web = %s AND id_users = %s RETURNING id_web",
                    (proyect_id, user_id)
                )
                deleted = cursor.fetchone()
                if not deleted:
                    return {"status": "error", "message": "Proyecto no encontrado"}
                return {"status": "success", "message": "Proyecto eliminado exitosamente"}
        except Exception as e:
            return {"status": "error", "message": f"Error al eliminar proyecto: {str(e)}"}
