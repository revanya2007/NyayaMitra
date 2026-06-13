"""
services/database.py — Supabase Database Service for NyayaMitra
=============================================================

This module handles connection to the Supabase PostgreSQL database
to store and retrieve chat queries and responses.

Exposed Functions:
    save_query(question, answer) -> bool
    get_chat_history() -> list
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables (useful if running this module directly for testing)
load_dotenv()

# ---------------------------------------------------------------------------
# 1. Read Supabase configuration from environment variables
# ---------------------------------------------------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize client as None
supabase_client = None

# ---------------------------------------------------------------------------
# 2. Initialize Supabase client with validation
# ---------------------------------------------------------------------------
if (SUPABASE_URL and SUPABASE_KEY and 
    SUPABASE_URL != "your_supabase_url_here" and 
    SUPABASE_KEY != "your_supabase_anon_key_here"):
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[INFO] Supabase client initialized successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to initialize Supabase client: {e}")
else:
    print("[WARNING] Supabase is not configured. Database logging is disabled.")


def save_query(question: str, answer: str) -> bool:
    """
    Saves a user query and the corresponding Gemini response to Supabase.
    
    Parameters:
        question (str): The user's input question.
        answer (str): The AI-generated answer.
        
    Returns:
        bool: True if save was successful, False otherwise.
    """
    if not supabase_client:
        print("[WARNING] Supabase client is not initialized. Query was not saved.")
        return False
        
    try:
        data = {
            "query": question,
            "response": answer
            # timestamp column handles DEFAULT NOW() automatically in Supabase
        }
        # Insert query record into user_queries table
        response = supabase_client.table("user_queries").insert(data).execute()
        print(f"[INFO] Query successfully saved to Supabase: {response}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to save query to Supabase: {e}")
        # Return False to let app continue execution without crashing
        return False


def get_chat_history() -> list:
    """
    Retrieves the latest user queries and responses from Supabase.
    
    Returns:
        list: A list of query records (dicts) sorted by timestamp descending, or None on failure.
    """
    if not supabase_client:
        print("[WARNING] Supabase client is not initialized.")
        return None
        
    try:
        # Fetch records from user_queries table sorted by timestamp descending
        response = supabase_client.table("user_queries") \
                                   .select("*") \
                                   .order("timestamp", desc=True) \
                                   .execute()
        return response.data
    except Exception as e:
        print(f"[ERROR] Failed to retrieve history from Supabase: {e}")
        return None
