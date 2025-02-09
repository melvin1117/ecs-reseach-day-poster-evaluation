import psycopg2
import pandas as pd

# Load DataFrame
df = pd.read_csv("faculty_data.csv")  # Ensure the correct path

# Database connection details
DB_NAME = "cuse_rank"
DB_USER = "user"
DB_PASSWORD = "password"
DB_HOST = "localhost"  # Change if using a remote database
DB_PORT = "5432"  # Default PostgreSQL port

# Establish connection
try:
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cursor = conn.cursor()
    print("Connected to the database successfully.")

    # Insert data into the judges_master table
    for _, row in df.iterrows():
        cursor.execute("""
            INSERT INTO judges_master (id, name, email, degree, details, profile_img, last_updated)
            VALUES (uuid_generate_v4(), %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (email) DO NOTHING;
        """, (row["Name"], row["Email"], row["Degree"], row["Details"], row["Image Link"]))

    # Commit changes
    conn.commit()
    print("Data inserted successfully.")

except Exception as e:
    print("Error:", e)

finally:
    if conn:
        cursor.close()
        conn.close()
        print("Database connection closed.")
