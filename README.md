# Land Suitability Analysis - AI-Powered Web Application

An intelligent web application that analyzes satellite images using **Google Gemini 2.0 Flash** to generate professional land development suitability reports.

## Features

- 🛰️ **Satellite Image Upload** - Drag-and-drop or click to upload satellite imagery
- 🤖 **AI Analysis** - Google Gemini 2.0 Flash evaluates terrain, infrastructure, environment, and more
- 📊 **Interactive Dashboard** - Circular score gauge, horizontal bar charts, feature cards
- 📄 **PDF Export** - Download a professional multi-page analysis report
- 📋 **Analysis History** - Revisit past analyses stored in localStorage
- 🌙 **Dark Theme** - Professional navy/dark UI with green accent
- 📱 **Responsive** - Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python + Flask |
| AI | Google Gemini 2.0 Flash (Vision) |
| Frontend | Jinja2 Templates + Vanilla CSS/JS |
| PDF | jsPDF (via CDN) |

## Setup

### Prerequisites
- Python 3.9+
- A Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Edit `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Application

```bash
python app.py
```

Open [http://localhost:5001](http://localhost:5001) in your browser.

## Usage

1. Upload a satellite image (JPEG, PNG, WebP, or TIFF)
2. Optionally enter latitude/longitude coordinates
3. Click **"Analyze Land Suitability"**
4. View detailed scores, feature analysis, and recommendations
5. Export the full report as a PDF
6. Browse past analyses in the History tab

## API

### `POST /analyze`

| Field | Type | Description |
|-------|------|-------------|
| `image` | File | Satellite image (required) |
| `lat` | String | Latitude (optional) |
| `lng` | String | Longitude (optional) |

Returns a JSON object with `location_summary`, `detected_features`, `scores`, `recommended_development`, `prototype_plan`, and `limitations`.

## Scoring

| Dimension | Weight |
|-----------|--------|
| Terrain | 25% |
| Accessibility | 20% |
| Infrastructure | 20% |
| Urban Compatibility | 15% |
| Environmental Risk (inverted) | 20% |

**Classification:** 8-10 = Highly Suitable · 6-7.9 = Moderately Suitable · 4-5.9 = Low Suitability · <4 = Not Suitable

## File Structure

```
file/
├── app.py              # Flask backend + Gemini API
├── requirements.txt    # Python dependencies
├── .env                # API key (not committed)
├── templates/
│   ├── base.html       # Shared layout + navbar
│   ├── index.html      # Upload page
│   ├── results.html    # Analysis dashboard
│   └── history.html    # Past analyses
├── static/
│   ├── style.css       # Dark theme styles
│   └── app.js          # Frontend interactivity
└── README.md
```
# Land-Suitability-Analysis-Engine
