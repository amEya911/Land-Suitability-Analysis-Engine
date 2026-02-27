import os
import json
import base64
import re
from datetime import datetime

from flask import Flask, render_template, request, jsonify, session
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """[SYSTEM ROLE]
You are an AI Land Suitability Analysis Engine specializing in satellite image interpretation, urban planning, and environmental impact evaluation.

[TASK]
Analyze the satellite image and return ONLY valid JSON in this exact format:
{
  "location_summary": "",
  "detected_features": {
    "terrain": "",
    "vegetation_density": "",
    "water_bodies": "",
    "roads": "",
    "nearby_structures": "",
    "urban_density": "",
    "risk_indicators": ""
  },
  "scores": {
    "terrain_score": 0,
    "accessibility_score": 0,
    "infrastructure_score": 0,
    "environmental_risk_score": 0,
    "urban_compatibility_score": 0,
    "overall_score": 0,
    "classification": ""
  },
  "recommended_development": {
    "type": "",
    "justification": ""
  },
  "prototype_plan": {
    "zoning_distribution": "",
    "road_layout": "",
    "building_arrangement": "",
    "green_space_plan": "",
    "infrastructure_layout": ""
  },
  "limitations": ""
}

Scoring rules:
- Score each dimension 0-10
- Overall = (0.25*Terrain) + (0.20*Accessibility) + (0.20*Infrastructure) + (0.15*UrbanCompatibility) + (0.20*(10-EnvironmentalRisk))
- Classification: 8-10=Highly Suitable, 6-7.9=Moderately Suitable, 4-5.9=Low Suitability, <4=Not Suitable

IMPORTANT: Return ONLY the JSON object, no markdown fences, no extra text."""

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "tiff"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_json(text):
    """Robustly extract JSON from Gemini response."""
    # Try direct parse
    try:
        return json.loads(text)
    except Exception:
        pass

    # Try extracting from markdown fences
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except Exception:
            pass

    # Try finding JSON boundaries
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start : end + 1])
        except Exception:
            pass

    return None


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file uploaded."}), 400

        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "No file selected."}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Use JPEG, PNG, WebP, or TIFF."}), 400

        file_data = file.read()
        if len(file_data) > MAX_FILE_SIZE:
            return jsonify({"error": "File too large. Max 10MB."}), 400

        lat = request.form.get("lat", "").strip()
        lng = request.form.get("lng", "").strip()

        # Encode image
        image_b64 = base64.b64encode(file_data).decode("utf-8")
        mime_type = file.content_type or "image/jpeg"

        # Build prompt
        location_context = ""
        if lat and lng:
            location_context = f"\n\nThe land parcel is located at coordinates: Latitude {lat}, Longitude {lng}. Factor this location into your analysis."

        prompt = SYSTEM_PROMPT + location_context

        # Call Gemini with retry
        model = genai.GenerativeModel("gemini-2.5-flash")

        analysis = None
        last_error = None
        MAX_RETRIES = 2

        for attempt in range(MAX_RETRIES + 1):
            try:
                print(f"[Gemini] Attempt {attempt + 1}...")
                response = model.generate_content(
                    [
                        prompt,
                        {"mime_type": mime_type, "data": file_data},
                    ]
                )

                response_text = response.text
                print(f"[Gemini] Response (first 300 chars): {response_text[:300]}")

                analysis = extract_json(response_text)
                if analysis:
                    print("[Gemini] JSON parsed successfully.")
                    break

                last_error = "Failed to parse JSON from Gemini response."
                print(f"[Gemini] JSON parse failed. Raw: {response_text[:500]}")

            except Exception as e:
                last_error = str(e)
                print(f"[Gemini] Attempt {attempt + 1} error: {e}")

        if not analysis:
            return jsonify({
                "error": "Failed to get a valid analysis from Gemini AI.",
                "details": last_error,
            }), 502

        # Attach metadata
        analysis["_image"] = f"data:{mime_type};base64,{image_b64}"
        analysis["_timestamp"] = datetime.now().isoformat()
        if lat and lng:
            analysis["_coordinates"] = {"lat": float(lat), "lng": float(lng)}

        return jsonify(analysis)

    except Exception as e:
        print(f"Analysis error: {e}")
        return jsonify({"error": "Internal server error.", "details": str(e)}), 500


@app.route("/results")
def results():
    return render_template("results.html")


@app.route("/history")
def history():
    return render_template("history.html")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    print(f"🌍 Land Suitability Server running on http://localhost:{port}")
    app.run(debug=True, port=port)
