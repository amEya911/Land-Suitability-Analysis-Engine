import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../components/ImageUpload";
import { analyzeImage } from "../utils/geminiClient";
import { MapPin, Crosshair, Sparkles, Loader2, AlertCircle, Satellite } from "lucide-react";

const STATUS_MESSAGES = [
    "Uploading satellite image...",
    "Analyzing terrain features...",
    "Evaluating infrastructure proximity...",
    "Assessing environmental factors...",
    "Computing suitability scores...",
    "Generating development recommendations...",
    "Compiling final report...",
];

export default function Home() {
    const [file, setFile] = useState(null);
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusIdx, setStatusIdx] = useState(0);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleAnalyze = async () => {
        if (!file) {
            setError("Please upload a satellite image first.");
            return;
        }

        setLoading(true);
        setError("");
        setStatusIdx(0);

        const interval = setInterval(() => {
            setStatusIdx((prev) =>
                prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev
            );
        }, 4000);

        try {
            const data = await analyzeImage(file, lat, lng);

            // Save to history
            try {
                const history = JSON.parse(
                    localStorage.getItem("landAnalysisHistory") || "[]"
                );
                history.unshift(data);
                if (history.length > 20) history.pop();
                localStorage.setItem("landAnalysisHistory", JSON.stringify(history));
            } catch { /* ignore storage errors */ }

            navigate("/results", { state: { data } });
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                err.message ||
                "Analysis failed. Please try again.";
            setError(msg);
        } finally {
            clearInterval(interval);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-green/20 bg-accent-green/5 text-accent-green text-sm font-medium mb-6">
                    <Satellite size={14} />
                    AI-Powered Land Analysis
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                    Land Suitability
                    <br />
                    <span className="text-accent-green">Analysis Engine</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                    Upload a satellite image and let our AI engine evaluate terrain,
                    infrastructure, environmental risks, and development potential.
                </p>
            </div>

            {/* Upload Card */}
            <div className="bg-navy-800/60 border border-gray-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                <ImageUpload file={file} onFileChange={setFile} />

                {/* Coordinate Inputs */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                            <MapPin size={14} />
                            Latitude (optional)
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            placeholder="e.g. 28.6139"
                            className="w-full bg-navy-700 border border-gray-600 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all"
                        />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                            <Crosshair size={14} />
                            Longitude (optional)
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                            placeholder="e.g. 77.2090"
                            className="w-full bg-navy-700 border border-gray-600 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all"
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                )}

                {/* Analyze Button */}
                <button
                    onClick={handleAnalyze}
                    disabled={loading || !file}
                    className={`w-full mt-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${loading || !file
                            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-accent-green text-navy-900 hover:bg-green-400 hover:shadow-lg hover:shadow-accent-green/25 active:scale-[0.98]"
                        }`}
                >
                    {loading ? (
                        <>
                            <Loader2 size={22} className="animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles size={22} />
                            Analyze Land Suitability
                        </>
                    )}
                </button>

                {/* Loading Status */}
                {loading && (
                    <div className="mt-4 text-center">
                        <p className="text-sm text-accent-green animate-pulse">
                            {STATUS_MESSAGES[statusIdx]}
                        </p>
                        <div className="mt-3 w-full h-1.5 bg-navy-600 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent-green rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${((statusIdx + 1) / STATUS_MESSAGES.length) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
