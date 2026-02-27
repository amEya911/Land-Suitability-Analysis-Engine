import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Trash2, ChevronRight, MapPin, BarChart3, Inbox } from "lucide-react";

function getClassColor(classification) {
    if (!classification) return "text-gray-400";
    const c = classification.toLowerCase();
    if (c.includes("highly")) return "text-green-400";
    if (c.includes("moderately")) return "text-lime-400";
    if (c.includes("low")) return "text-amber-400";
    return "text-red-400";
}

export default function HistoryPage() {
    const [entries, setEntries] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem("landAnalysisHistory");
        if (stored) {
            try {
                setEntries(JSON.parse(stored));
            } catch {
                setEntries([]);
            }
        }
    }, []);

    const deleteEntry = (index) => {
        const updated = entries.filter((_, i) => i !== index);
        setEntries(updated);
        localStorage.setItem("landAnalysisHistory", JSON.stringify(updated));
    };

    const clearAll = () => {
        setEntries([]);
        localStorage.removeItem("landAnalysisHistory");
    };

    const openReport = (entry) => {
        navigate("/results", { state: { data: entry } });
    };

    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-navy-700 flex items-center justify-center mb-6">
                    <Inbox size={36} className="text-gray-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-300 mb-2">No analyses yet</h2>
                <p className="text-gray-500 max-w-sm">
                    Upload a satellite image and run an analysis to see your history here.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2">
                    <Clock size={22} className="text-accent-green" />
                    Analysis History
                    <span className="text-sm font-normal text-gray-500 ml-2">
                        ({entries.length} reports)
                    </span>
                </h2>
                <button
                    onClick={clearAll}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                >
                    <Trash2 size={14} />
                    Clear All
                </button>
            </div>

            <div className="space-y-3">
                {entries.map((entry, index) => (
                    <div
                        key={index}
                        className="bg-navy-700/50 border border-gray-700/50 rounded-xl p-4 hover:border-accent-green/30 transition-all group cursor-pointer"
                        onClick={() => openReport(entry)}
                    >
                        <div className="flex items-center gap-4">
                            {entry._image && (
                                <img
                                    src={entry._image}
                                    alt="Satellite"
                                    className="w-16 h-16 rounded-lg object-cover border border-gray-600"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <BarChart3 size={14} className="text-accent-green" />
                                    <span className="text-lg font-bold text-gray-200">
                                        {entry.scores?.overall_score?.toFixed(1) || "?"}/10
                                    </span>
                                    <span
                                        className={`text-sm font-medium ${getClassColor(
                                            entry.scores?.classification
                                        )}`}
                                    >
                                        {entry.scores?.classification || "N/A"}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 truncate">
                                    {entry.recommended_development?.type || "Unknown development type"}
                                </p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    {entry._timestamp && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={11} />
                                            {new Date(entry._timestamp).toLocaleDateString()} {new Date(entry._timestamp).toLocaleTimeString()}
                                        </span>
                                    )}
                                    {entry._coordinates && (
                                        <span className="flex items-center gap-1">
                                            <MapPin size={11} />
                                            {entry._coordinates.lat.toFixed(4)}, {entry._coordinates.lng.toFixed(4)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteEntry(index);
                                    }}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <ChevronRight
                                    size={18}
                                    className="text-gray-500 group-hover:text-accent-green transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
