require("dotenv").config();
const express = require("express");
const cors = require("cors");
const analyzeRoute = require("./routes/analyze");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/analyze", analyzeRoute);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    if (err.message && err.message.includes("Invalid file type")) {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
    console.log(`🌍 Land Suitability Server running on http://localhost:${PORT}`);
});
