import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load API Key from .env file
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("API key is missing! Set GEMINI_API_KEY in your .env file.")

# Configure Gemini
genai.configure(api_key=api_key)

# Path to JSON log file
DATA_FILE = "data.json"

# Ensure data.json exists and is a valid JSON array
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f, indent=4)
   

@app.route("/generate_response", methods=["POST", "OPTIONS"])
def generate_response():

    if request.method == "OPTIONS":
        return jsonify({"message": "ok"}), 200

    data = request.get_json()
    user_input = data.get("message")

    if not user_input:
        return jsonify({"error": "No input provided"}), 400

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")

        response = model.generate_content(user_input)

        output_text = response.text

    except Exception as e:
        print("Gemini error:", e)
        output_text = "Sorry, I couldn't generate a response."

    response_data = {
        "prompt": user_input,
        "text": output_text.strip()
    }

    return jsonify(response_data)
        # Prepare response for frontend
        response_data = {"prompt": user_input, "text": output_text.strip()}

        # Save to JSON log
        with open(DATA_FILE, "r+") as f:
            try:
                arr = json.load(f)
            except json.JSONDecodeError:
                arr = []
            arr.append(response_data)
            f.seek(0)
            json.dump(arr, f, indent=4)
            f.truncate()

        return jsonify(response_data)

    except genai.error.GenerativeAIError as e:
        print("Gemini API error:", e)
        return jsonify({"error": "Gemini API error", "details": str(e)}), 500
    except Exception as e:
        print("SERVER ERROR:", e)
        return jsonify({"error": "Server failed", "details": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5001))
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    app.run(debug=debug_mode, port=port)
