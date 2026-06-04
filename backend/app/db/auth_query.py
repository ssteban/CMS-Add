import psycopg2
from app.db.init import DatabaseConnection
from app.utils.auth_util import verify_password

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
