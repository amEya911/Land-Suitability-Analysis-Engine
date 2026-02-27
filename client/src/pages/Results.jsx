import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReportDashboard from "../components/ReportDashboard";
import { exportPDF } from "../utils/pdfExport";
import { ArrowLeft, FileDown, Satellite } from "lucide-react";

export default function Results() {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state?.data;

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Satellite size={48} className="text-gray-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-300 mb-2">
                    No Analysis Data
                </h2>
                <p className="text-gray-500 mb-6">
                    Please upload and analyze a satellite image first.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="px-6 py-2.5 bg-accent-green text-navy-900 rounded-xl font-semibold hover:bg-green-400 transition-all"
                >
                    Go to Upload
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-medium">New Analysis</span>
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => exportPDF(data)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent-green text-navy-900 rounded-xl font-semibold hover:bg-green-400 transition-all hover:shadow-lg hover:shadow-accent-green/25"
                    >
                        <FileDown size={18} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Uploaded Image Preview */}
            {data._image && (
                <div className="mb-8 rounded-2xl overflow-hidden border border-gray-700/50">
                    <img
                        src={data._image}
                        alt="Analyzed satellite image"
                        className="w-full h-48 md:h-64 object-cover"
                    />
                    <div className="bg-navy-800/80 px-4 py-2 flex items-center gap-2 text-xs text-gray-400">
                        <Satellite size={12} />
                        Analyzed satellite image
                        {data._timestamp && (
                            <span className="ml-auto">
                                {new Date(data._timestamp).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Dashboard */}
            <ReportDashboard data={data} />
        </div>
    );
}
