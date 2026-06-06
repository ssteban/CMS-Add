import psycopg2
from app.db.init import DatabaseConnection
from app.utils.auth_util import verify_password, hash_password

class AuthQuery:
    @staticmethod
    def register_user(username, email, password):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "INSERT INTO users (username, email, password) VALUES (%s, %s, %s) RETURNING id_users",
                    (username, email, password)
                )
                user_id = cursor.fetchone()[0]
                return {"status": "success", "id": user_id}
        except psycopg2.IntegrityError:
            # Capturamos el error de Neon si el correo ya existe (Restricción UNIQUE)
            return {"status": "error", "message": "El correo electrónico ya está registrado."}
        except Exception as e:
            return {"status": "error", "message": f"Error interno del servidor: {str(e)}"}

    @staticmethod
    def authenticate_user(email, password):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "SELECT id_users, username, email, password FROM users WHERE email = %s",
                    (email,)
                )
                user = cursor.fetchone()
                
                # Prevenir TypeError si el correo no existe en la base de datos
                if not user:
                    return {"status": "error", "message": "Usuario o contraseña incorrectos"}
                
                # Verificamos la contraseña usando la utilidad que creaste
                if verify_password(password, user[3]):
                    return {
                        "status": "Ok",
                        "id": user[0],
                        "username": user[1],
                        "email": user[2]
                    }
                return {"status": "error", "message": "Usuario o contraseña incorrectos"}
        except Exception as e:
            return {"status": "error", "message": f"Error interno del servidor: {str(e)}"}

    @staticmethod
    def get_profile(user_id):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "SELECT id_users, username, email, created_at FROM users WHERE id_users = %s",
                    (user_id,)
                )
                user = cursor.fetchone()
                if not user:
                    return {"status": "error", "message": "Usuario no encontrado"}
                return {
                    "status": "success",
                    "profile": {
                        "id": user[0],
                        "username": user[1],
                        "email": user[2],
                        "created_at": user[3].isoformat() if user[3] else None
                    }
                }
        except Exception as e:
            return {"status": "error", "message": f"Error interno del servidor: {str(e)}"}

    @staticmethod
    def update_profile(user_id, username, email):
        try:
            with DatabaseConnection() as cursor:
                fields = []
                values = []
                if username is not None:
                    fields.append("username = %s")
                    values.append(username)
                if email is not None:
                    fields.append("email = %s")
                    values.append(email)

                if not fields:
                    return {"status": "success", "message": "Sin cambios"}

                values.append(user_id)
                cursor.execute(
                    f"UPDATE users SET {', '.join(fields)} WHERE id_users = %s RETURNING id_users, username, email, created_at",
                    values
                )
                user = cursor.fetchone()
                return {
                    "status": "success",
                    "profile": {
                        "id": user[0],
                        "username": user[1],
                        "email": user[2],
                        "created_at": user[3].isoformat() if user[3] else None
                    }
                }
        except psycopg2.IntegrityError:
            return {"status": "error", "message": "El correo electrónico ya está registrado"}
        except Exception as e:
            return {"status": "error", "message": f"Error interno del servidor: {str(e)}"}

    @staticmethod
    def change_password(user_id, current_password, new_password):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "SELECT password FROM users WHERE id_users = %s",
                    (user_id,)
                )
                user = cursor.fetchone()
                if not user:
                    return {"status": "error", "message": "Usuario no encontrado"}

                if not verify_password(current_password, user[0]):
                    return {"status": "error", "message": "La contraseña actual no es correcta"}

                new_hash = hash_password(new_password)
                cursor.execute(
                    "UPDATE users SET password = %s WHERE id_users = %s",
                    (new_hash, user_id)
                )
                return {"status": "success", "message": "Contraseña actualizada exitosamente"}
        except Exception as e:
            return {"status": "error", "message": f"Error interno del servidor: {str(e)}"}

    @staticmethod
    def recover_password(email):
        try:
            with DatabaseConnection() as cursor:
                cursor.execute(
                    "SELECT id_users FROM users WHERE email = %s",
                    (email,)
                )
                user = cursor.fetchone()
                if user:
                    # Implement password recovery logic (e.g., send email with reset link)
                    return True
                return False
        except Exception:
            return False
