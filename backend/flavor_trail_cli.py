import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables from .env file in the same folder
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

def connect():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASS"),
            port=os.getenv("DB_PORT")
        )
        return conn
    except Exception as e:
        print("Error connecting to database:", e)
        return None

def run_query(sql):
    conn = connect()
    if not conn:
        return

    try:
        cur = conn.cursor()
        cur.execute(sql)

        # If SELECT query, fetch and display results
        if sql.strip().lower().startswith("select"):
            rows = cur.fetchall()
            colnames = [desc[0] for desc in cur.description]

            print("\n🟦 Result:")
            print("-" * 50)
            print("\t".join(colnames))
            print("-" * 50)
            for row in rows:
                print("\t".join(str(val) for val in row))
            print("-" * 50 + "\n")
        else:
            conn.commit()
            print("Query executed successfully.\n")

        cur.close()
    except Exception as e:
        print("Query failed:", e)
    finally:
        conn.close()

def main():
    print("Flavor Trail CLI (Python)")
    print("Type any SQL query or 'exit' to quit.\n")
    while True:
        sql = input("SQL> ")
        if sql.lower() == "exit":
            break
        if not sql.strip():
            continue
        run_query(sql)

if __name__ == "__main__":
    main()
