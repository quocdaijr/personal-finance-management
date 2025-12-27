import os
import psycopg2
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pandas as pd

# Database connection settings - should be loaded from environment variables in production
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_NAME = os.getenv("DB_NAME", "finance-management")
USE_SQLITE = os.getenv("USE_SQLITE", "true").lower() == "true"

# Create SQLAlchemy engine
if USE_SQLITE:
    # Use SQLite for development/testing
    DATABASE_URL = "sqlite:///./finance-management.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Use PostgreSQL for production
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to load data into pandas DataFrame
def load_data_to_dataframe(query, params=None):
    """
    Execute SQL query and return results as pandas DataFrame

    Args:
        query: SQL query string or SQLAlchemy text() object
        params: Optional dictionary of parameters for parameterized queries
    """
    try:
        return pd.read_sql(query, engine, params=params)
    except Exception as e:
        print(f"Error loading data: {e}")
        return pd.DataFrame()
