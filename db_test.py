import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
}

try:
    connection = mysql.connector.connect(**DB_CONFIG)
    if connection.is_connected():
        print('✅ Successfully connected to MySQL database!')
        cursor = connection.cursor()
        cursor.execute('SELECT DATABASE();')
        db = cursor.fetchone()
        print(f'Current database: {db[0]}')
        cursor.close()
    else:
        print('❌ Failed to connect to MySQL database.')
except Error as e:
    print(f'❌ MySQL connection error: {e}')
finally:
    if 'connection' in locals() and connection.is_connected():
        connection.close()
