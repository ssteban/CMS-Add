from app.db.init import DatabaseConnection


class UserQuery:
    @staticmethod
    def create_user(username, email, password_hash):
        with DatabaseConnection() as cursor:
            cursor.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
                (username, email, password_hash)
            )
            user_id = cursor.fetchone()[0]
            return user_id

    @staticmethod
    def get_user_by_email(email):
        with DatabaseConnection() as cursor:
            cursor.execute(
                "SELECT id, username, email, password_hash FROM users WHERE email = %s",
                (email,)
            )
            return cursor.fetchone()