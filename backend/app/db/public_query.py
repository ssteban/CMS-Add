from app.db.init import DatabaseConnection


class publicQuery:
    @staticmethod
    def get_content_by_api_key(api_key_hash):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    """SELECT w.id_web, w.published_json
                       FROM api_keys k
                       JOIN websites w ON w.id_web = k.id_web
                       WHERE k.api_key_hash = %s""",
                    (api_key_hash,)
                )
                row = cursor.fetchone()
                if not row:
                    return {"status": "error", "message": "API key inválida"}
                if row[1] is None:
                    return {"status": "error", "message": "El contenido aún no ha sido publicado"}
                return {
                    "status": "success",
                    "project_id": row[0],
                    "published_json": row[1]
                }
        except Exception as e:
            return {"status": "error", "message": f"Error interno: {str(e)}"}
