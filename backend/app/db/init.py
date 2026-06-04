import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseConnection:
    def __init__(self):
        self.db_name = os.getenv('DB_NAME')
        self.user = os.getenv('DB_USER')
        self.password = os.getenv('DB_PASSWORD')
        self.host = os.getenv('DB_HOST')
        self.port = os.getenv('DB_PORT')
        self.connection = None
        self.cursor = None

    def __enter__(self):
        try:
            self.connection = psycopg2.connect(
                dbname=self.db_name,
                user=self.user,
                password=self.password,
                host=self.host,
                port=self.port
            )
            self.cursor = self.connection.cursor()
            print("Database connection established.")
            return self.cursor
        except Exception as e:
            print(f"Error connecting to database: {e}")
            raise

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.connection:
            if exc_type:
                self.connection.rollback()
                print("Database transaction rolled back.")
            else:
                self.connection.commit()
                print("Database transaction committed.")
            self.cursor.close()
            self.connection.close()
            print("Database connection closed.")

