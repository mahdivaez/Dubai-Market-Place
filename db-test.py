import mysql.connector
from mysql.connector import errorcode

def check_db_connection():
    # Database connection details
    DB_CONFIG = {
        'host': 'turntable.proxy.rlwy.net',
        'user': 'root',
        'password': 'OlWIFZHFiPpWIXCfaWdBLhILYxoqgecm',
        'port': 42664,
        # 'database': 'your_database_name' # Optional: uncomment and add if you want to connect to a specific database
    }

    try:
        # Attempt to establish a connection
        cnx = mysql.connector.connect(**DB_CONFIG)

        if cnx.is_connected():
            print("Successfully connected to the MySQL database!")
            print(f"Server version: {cnx.get_server_info()}")
            print(f"Connection ID: {cnx.connection_id}")
            # You can perform a simple query here to further verify
            # cursor = cnx.cursor()
            # cursor.execute("SELECT NOW()")
            # result = cursor.fetchone()
            # print(f"Current time from DB: {result[0]}")
            # cursor.close()
        else:
            print("Failed to connect to the MySQL database.")

    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Authentication failed: Incorrect username or password.")
        elif err.errno == errorcode.CR_CONN_HOST_ERROR:
            print(f"Connection failed: Cannot connect to host '{DB_CONFIG['host']}' on port {DB_CONFIG['port']}. Check host, port, or network connectivity.")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist.")
        else:
            print(f"An unexpected error occurred: {err}")
    except Exception as e:
        print(f"An unhandled exception occurred: {e}")
    finally:
        if 'cnx' in locals() and cnx.is_connected():
            cnx.close()
            print("Database connection closed.")

if __name__ == "__main__":
    check_db_connection()