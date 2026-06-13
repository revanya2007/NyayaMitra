"""
services/gemini.py — Gemini AI Service for NyayaMitra
=====================================================

This module handles all communication with the Google Gemini API.
It initializes the Gemini client with a professional system prompt
tailored for Indian farmers, and exposes a single function:

    get_answer(question) → str

Usage:
    from services.gemini import get_answer
    response = get_answer("What is PM-KISAN?")
"""

import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# 1. Load environment variables from the .env file
# ---------------------------------------------------------------------------
load_dotenv()

# ---------------------------------------------------------------------------
# 2. Read the Gemini API key from environment variables
#    This keeps the key out of source code for security.
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Validate that the key is present; raise a clear error if missing
if not GEMINI_API_KEY:
    raise ValueError(
        "[ERROR] GEMINI_API_KEY not found in environment variables.\n"
        "   Please add it to your .env file:\n"
        "   GEMINI_API_KEY=your_api_key_here"
    )

# ---------------------------------------------------------------------------
# 3. Initialize the Google GenAI client with our API key
# ---------------------------------------------------------------------------
client = genai.Client(api_key=GEMINI_API_KEY)

# ---------------------------------------------------------------------------
# 4. Define the NyayaMitra system prompt
#    This instructs Gemini to behave as a farmer-friendly legal assistant.
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are NyayaMitra, an AI assistant for Indian farmers.

You help with:
- Land rights
- Land disputes
- Government schemes
- PM-KISAN
- Crop insurance
- Agricultural subsidies
- Farmer legal rights

Rules:
- Use simple language.
- Avoid complex legal terminology.
- Give practical guidance.
- Mention that users should consult local authorities for final legal decisions.
- Keep answers concise and farmer-friendly.
- If the user writes in a regional language (Hindi, Tamil, Telugu, etc.), reply in the same language.
- Format your answers with clear headings and bullet points where appropriate.
- Always end with a helpful note or next step the farmer can take."""

# ---------------------------------------------------------------------------
# 5. The main function — send a question, get an answer
# ---------------------------------------------------------------------------
def get_answer(question: str) -> str:
    """
    Send a user's question to the Gemini API and return the generated answer.

    Parameters:
        question (str): The farmer's question (e.g., "What is PM-KISAN?")

    Returns:
        str: The AI-generated response text.

    Raises:
        Exception: If the Gemini API call fails for any reason.
    """
    try:
        # Send the question to Gemini with the system prompt and get the response
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=question,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
            ),
        )

        # Extract and return the text from the response
        return response.text

    except Exception as e:
        # Log the error for debugging (visible in terminal)
        print(f"[ERROR] Gemini API Error: {e}")

        # Re-raise so the Flask route can handle it gracefully
        raise
