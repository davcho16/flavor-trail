import psycopg2

# --- CONFIGURE THIS WITH YOUR OWN DATABASE INFO ---
DB_HOST = "localhost"
DB_NAME = "flavor_trail"
DB_USER = "postgres"
DB_PASS = "postgres123"
DB_PORT = "5432"
# ---------------------------------------------------

def connect():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT
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
        rows = cur.fetchall()
        for row in rows:
            print(row)
        cur.close()
    except Exception as e:
        print("Query failed:", e)
    finally:
        conn.close()

def main():
    print("Welcome to Flavor Trail CLI!")
    print("Type SQL SELECT queries or 'exit' to quit.\n")
    while True:
        sql = input("SQL> ")
        if sql.lower() == "exit":
            break
        if not sql.strip().lower().startswith("select"):
            print("Only SELECT queries are allowed.")
            continue
        run_query(sql)

if __name__ == "__main__":
    main()
