from app.db.init import DatabaseConnection


class apiKeyQuery:
    @staticmethod
    def create_key(proyect_id, key_name, api_key_hash):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "INSERT INTO api_keys (id_web, key_name, api_key_hash) VALUES (%s, %s, %s) RETURNING id_key, key_name, created_at",
                    (proyect_id, key_name, api_key_hash)
                )
                row = cursor.fetchone()
                return {
                    "status": "success",
                    "key": {
                        "id": row[0],
                        "key_name": row[1],
                        "created_at": row[2].strftime("%Y-%m-%d %H:%M:%S")
                    }
                }
        except Exception as e:
            return {"status": "error", "message": f"Error al crear llave: {str(e)}"}

    @staticmethod
    def get_keys_by_project(proyect_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "SELECT id_key, key_name, api_key_hash, created_at FROM api_keys WHERE id_web = %s ORDER BY created_at DESC",
                    (proyect_id,)
                )
                rows = cursor.fetchall()
                keys = []
                for row in rows:
                    keys.append({
                        "id": row[0],
                        "key_name": row[1],
                        "api_key_hash": row[2],
                        "created_at": row[3].strftime("%Y-%m-%d %H:%M:%S")
                    })
                return {"status": "success", "keys": keys}
        except Exception as e:
            return {"status": "error", "message": f"Error al obtener llaves: {str(e)}"}

    @staticmethod
    def delete_key(key_id, proyect_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "DELETE FROM api_keys WHERE id_key = %s AND id_web = %s RETURNING id_key",
                    (key_id, proyect_id)
                )
                row = cursor.fetchone()
                if not row:
                    return {"status": "error", "message": "Llave no encontrada"}
                return {"status": "success"}
        except Exception as e:
            return {"status": "error", "message": f"Error al revocar llave: {str(e)}"}

    @staticmethod
    def verify_project_ownership(proyect_id, user_id):
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
