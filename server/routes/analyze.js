const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_PROMPT = `[SYSTEM ROLE]
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
- Overall = (0.25×Terrain) + (0.20×Accessibility) + (0.20×Infrastructure) + (0.15×UrbanCompatibility) + (0.20×(10−EnvironmentalRisk))
- Classification: 8-10=Highly Suitable, 6-7.9=Moderately Suitable, 4-5.9=Low Suitability, <4=Not Suitable

IMPORTANT: Return ONLY the JSON object, no markdown fences, no extra text.`;

function extractJSON(text) {
    // Try direct parse first
    try {
        return JSON.parse(text);
    } catch (_) {
        // Ignore, try other methods
    }

    // Try extracting from markdown code fences
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
        try {
            return JSON.parse(fenceMatch[1].trim());
        } catch (_) {
            // Ignore
        }
    }

    // Try finding JSON object boundaries
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
        try {
            return JSON.parse(text.substring(start, end + 1));
        } catch (_) {
            // Ignore
        }
    }

    return null;
}

router.post("/", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded." });
        }

        const { lat, lng } = req.body;
        const imageBase64 = req.file.buffer.toString("base64");
        const mimeType = req.file.mimetype;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        let locationContext = "";
        if (lat && lng) {
            locationContext = `\n\nThe land parcel is located at coordinates: Latitude ${lat}, Longitude ${lng}. Factor this location into your analysis.`;
        }

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType,
            },
        };

        let analysis = null;
        let lastError = null;
        const MAX_RETRIES = 2;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`[Gemini] Attempt ${attempt + 1}...`);
                const result = await model.generateContent([
                    SYSTEM_PROMPT + locationContext,
                    imagePart,
                ]);

                const responseText = result.response.text();
                console.log(`[Gemini] Raw response (first 500 chars):`, responseText.substring(0, 500));
                analysis = extractJSON(responseText);

                if (analysis) {
                    console.log(`[Gemini] JSON parsed successfully.`);
                    break;
                }
                lastError = "Failed to parse JSON from Gemini response.";
                console.warn(`[Gemini] JSON parse failed. Full response:`, responseText);
            } catch (err) {
                lastError = err.message || "Gemini API call failed.";
                console.error(`[Gemini] Attempt ${attempt + 1} error:`, err.message);
            }
        }

        if (!analysis) {
            return res.status(502).json({
                error: "Failed to get a valid analysis from Gemini AI.",
                details: lastError,
            });
        }

        // Attach image data URI for frontend display
        analysis._image = `data:${mimeType};base64,${imageBase64}`;
        analysis._timestamp = new Date().toISOString();
        if (lat && lng) {
            analysis._coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
        }

        return res.json(analysis);
    } catch (err) {
        console.error("Analysis error:", err);

        if (err.message && err.message.includes("Invalid file type")) {
            return res.status(400).json({ error: err.message });
        }

        return res.status(500).json({
            error: "Internal server error during analysis.",
            details: err.message,
        });
    }
});

module.exports = router;
