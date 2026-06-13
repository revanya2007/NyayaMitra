"""
app.py — Flask Backend for NyayaMitra
=======================================

This is the main entry point of the NyayaMitra web application.
It serves the frontend and provides an API endpoint for the Gemini AI.

Routes:
    GET  /    → Renders the homepage (index.html)
    POST /ask → Accepts a JSON question, returns a Gemini AI response
"""

import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# 1. Load environment variables from .env file BEFORE anything else
# ---------------------------------------------------------------------------
load_dotenv()

# ---------------------------------------------------------------------------
# 2. Initialize the Flask application
# ---------------------------------------------------------------------------
app = Flask(__name__)

# Load secret key from environment, or use a default for local development
app.secret_key = os.environ.get('SECRET_KEY', 'nyayamitra-local-development-secret-key')

# ---------------------------------------------------------------------------
# 3. Import the Gemini service
#    This is done after load_dotenv() so the API key is available.
# ---------------------------------------------------------------------------
from services.gemini import get_answer
from services.database import save_query, get_chat_history

# ---------------------------------------------------------------------------
# 4. Route: Home Page
# ---------------------------------------------------------------------------
@app.route('/')
def home():
    """
    Renders the homepage template (index.html) which contains
    the NyayaMitra dashboard and AI chat interface.
    """
    return render_template('index.html')

# ---------------------------------------------------------------------------
# 5. Route: AI Question Endpoint (POST /ask)
# ---------------------------------------------------------------------------
@app.route('/ask', methods=['POST'])
def ask():
    """
    API endpoint that receives a user question and returns a Gemini AI response.

    Request JSON format:
        { "question": "What is PM Kisan?" }

    Response JSON format (success):
        { "answer": "PM-KISAN is a government scheme..." }

    Response JSON format (error):
        { "error": "Sorry, I am currently unable to answer..." }
    """
    try:
        # Parse the JSON request body
        data = request.get_json()

        # Validate that a question was provided
        if not data or 'question' not in data:
            return jsonify({
                'error': 'Please provide a question in the request body.'
            }), 400

        question = data['question'].strip()

        # Validate that the question is not empty
        if not question:
            return jsonify({
                'error': 'The question cannot be empty.'
            }), 400

        # Send the question to Gemini and get the response
        answer = get_answer(question)

        # Save the query-response pair to Supabase (Phase 3)
        # We wrap this in a try-catch to ensure that database errors
        # do not interrupt the core chatbot service.
        try:
            save_query(question, answer)
        except Exception as db_err:
            print(f"[WARNING] Gracefully handled database logging failure: {db_err}")

        # Return the successful response
        return jsonify({'answer': answer})

    except Exception as e:
        # Log the full error for debugging (visible in the terminal)
        print(f"[ERROR] Error in /ask endpoint: {e}")

        # Return a user-friendly error message
        return jsonify({
            'error': 'Sorry, I am currently unable to answer. Please try again later.'
        }), 500

# ---------------------------------------------------------------------------
# 5.5. Route: Get Chat History Endpoint (GET /history)
# ---------------------------------------------------------------------------
@app.route('/history', methods=['GET'])
def history():
    """
    API endpoint that returns the saved chat history from Supabase.

    Response JSON format (success):
        [
            {
                "id": 1,
                "query": "What is PM Kisan?",
                "response": "...",
                "timestamp": "..."
            }
        ]
    """
    try:
        chat_history = get_chat_history()
        if chat_history is None:
            return jsonify({
                'error': 'Database is temporarily unavailable. Unable to load chat history.'
            }), 503
        return jsonify(chat_history)
    except Exception as e:
        # Log the full error for debugging (visible in the terminal)
        print(f"[ERROR] Error in /history endpoint: {e}")

        # Return a user-friendly error message
        return jsonify({
            'error': 'Sorry, unable to load chat history. Please try again later.'
        }), 500

# ---------------------------------------------------------------------------
# 6. Run the Flask development server
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    # Flask will run on http://127.0.0.1:5000/ by default
    # debug=True enables automatic reloading of the server upon file changes
    app.run(debug=True, port=5000)
