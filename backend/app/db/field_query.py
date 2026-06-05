from app.db.init import DatabaseConnection


class fieldQuery:
    @staticmethod
    def get_fields_by_project(proyect_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "SELECT id_components, key_name, key_value, key_type, created_at, update_at FROM components WHERE id_web = %s ORDER BY id_components ASC",
                    (proyect_id,)
                )
                rows = cursor.fetchall()
                fields = []
                for row in rows:
                    fields.append({
                        "id": row[0],
                        "key_name": row[1],
                        "key_value": row[2],
                        "key_type": row[3],
                        "created_at": row[4].strftime("%Y-%m-%d %H:%M:%S"),
                        "updated_at": row[5].strftime("%Y-%m-%d %H:%M:%S")
                    })
                return {"status": "success", "fields": fields}
        except Exception as e:
            return {"status": "error", "message": f"Error al obtener campos: {str(e)}"}

    @staticmethod
    def save_fields(proyect_id, fields):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "DELETE FROM components WHERE id_web = %s",
                    (proyect_id,)
                )

                saved = []
                for field in fields:
                    cursor.execute(
                        "INSERT INTO components (id_web, key_name, key_value, key_type) VALUES (%s, %s, %s, %s) RETURNING id_components, key_name, key_value, key_type, created_at, update_at",
                        (proyect_id, field["key_name"], field["key_value"], field["key_type"])
                    )
                    row = cursor.fetchone()
                    saved.append({
                        "id": row[0],
                        "key_name": row[1],
                        "key_value": row[2],
                        "key_type": row[3],
                        "created_at": row[4].strftime("%Y-%m-%d %H:%M:%S"),
                        "updated_at": row[5].strftime("%Y-%m-%d %H:%M:%S")
                    })

                return {"status": "success", "fields": saved}
        except Exception as e:
            return {"status": "error", "message": f"Error al guardar campos: {str(e)}"}

    @staticmethod
    def publish_json(proyect_id, json_data):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "UPDATE websites SET published_json = %s::jsonb, update_at = CURRENT_TIMESTAMP WHERE id_web = %s RETURNING id_web",
                    (json_data, proyect_id)
                )
                row = cursor.fetchone()
                if not row:
                    return {"status": "error", "message": "Proyecto no encontrado"}
                return {"status": "success"}
        except Exception as e:
            return {"status": "error", "message": f"Error al publicar JSON: {str(e)}"}

    @staticmethod
    def get_published_json(proyect_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "SELECT published_json FROM websites WHERE id_web = %s",
                    (proyect_id,)
                )
                row = cursor.fetchone()
                if not row:
                    return {"status": "error", "message": "Proyecto no encontrado"}
                return {"status": "success", "published_json": row[0]}
        except Exception as e:
            return {"status": "error", "message": f"Error al obtener JSON publicado: {str(e)}"}

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
