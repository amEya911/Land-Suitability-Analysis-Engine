import React from "react";
import ScoreGauge from "./ScoreGauge";
import FeatureCards from "./FeatureCards";
import {
    Lightbulb,
    Map,
    Building2,
    TreePine,
    Zap,
    Route,
    AlertCircle,
} from "lucide-react";

function getBarColor(score) {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-lime-500";
    if (score >= 4) return "bg-amber-500";
    return "bg-red-500";
}

function getBarGlow(score) {
    if (score >= 8) return "shadow-green-500/30";
    if (score >= 6) return "shadow-lime-500/30";
    if (score >= 4) return "shadow-amber-500/30";
    return "shadow-red-500/30";
}

function ScoreBar({ label, score, icon: Icon, delay = 0 }) {
    return (
        <div
            className="animate-fade-in-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">{label}</span>
                </div>
                <span className="text-sm font-bold text-gray-200">{score}/10</span>
            </div>
            <div className="w-full h-3 bg-navy-600 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${getBarColor(score)} shadow-lg ${getBarGlow(score)} transition-all duration-1000 ease-out`}
                    style={{ width: `${(score / 10) * 100}%` }}
                />
            </div>
        </div>
    );
}

const PLAN_ICONS = {
    zoning_distribution: Map,
    road_layout: Route,
    building_arrangement: Building2,
    green_space_plan: TreePine,
    infrastructure_layout: Zap,
};

export default function ReportDashboard({ data }) {
    if (!data) return null;

    const { scores, detected_features, recommended_development, prototype_plan, limitations, location_summary } = data;

    return (
        <div className="space-y-8">
            {/* Location Summary */}
            <section className="bg-navy-700/30 border border-gray-700/50 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-200 mb-3 flex items-center gap-2">
                    <Map size={20} className="text-accent-green" />
                    Location Summary
                </h2>
                <p className="text-gray-300 leading-relaxed">{location_summary || "N/A"}</p>
            </section>

            {/* Overall Score + Score Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gauge */}
                <div className="bg-navy-700/30 border border-gray-700/50 rounded-2xl p-8 flex flex-col items-center justify-center animate-pulse-glow">
                    <h2 className="text-lg font-bold text-gray-200 mb-6">
                        Overall Suitability
                    </h2>
                    <ScoreGauge
                        score={scores?.overall_score || 0}
                        classification={scores?.classification || ""}
                    />
                </div>

                {/* Score Bars */}
                <div className="bg-navy-700/30 border border-gray-700/50 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-gray-200 mb-6">
                        Score Breakdown
                    </h2>
                    <div className="space-y-5">
                        <ScoreBar label="Terrain" score={scores?.terrain_score || 0} icon={Map} delay={100} />
                        <ScoreBar label="Accessibility" score={scores?.accessibility_score || 0} icon={Route} delay={200} />
                        <ScoreBar label="Infrastructure" score={scores?.infrastructure_score || 0} icon={Zap} delay={300} />
                        <ScoreBar label="Environmental Risk" score={scores?.environmental_risk_score || 0} icon={AlertCircle} delay={400} />
                        <ScoreBar label="Urban Compatibility" score={scores?.urban_compatibility_score || 0} icon={Building2} delay={500} />
                    </div>
                </div>
            </div>

            {/* Detected Features */}
            <section>
                <h2 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-accent-green" />
                    Detected Features
                </h2>
                <FeatureCards features={detected_features} />
            </section>

            {/* Recommended Development */}
            <section className="bg-gradient-to-r from-accent-green/5 to-transparent border border-accent-green/20 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-200 mb-3 flex items-center gap-2">
                    <Lightbulb size={20} className="text-accent-green" />
                    Recommended Development
                </h2>
                <div className="space-y-2">
                    <p className="text-accent-green font-semibold text-lg">
                        {recommended_development?.type || "N/A"}
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                        {recommended_development?.justification || "N/A"}
                    </p>
                </div>
            </section>

            {/* Prototype Plan */}
            <section>
                <h2 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                    <Building2 size={20} className="text-accent-green" />
                    Prototype Development Plan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {prototype_plan &&
                        Object.entries(prototype_plan).map(([key, val], i) => {
                            const Icon = PLAN_ICONS[key] || Map;
                            const label = key
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase());
                            return (
                                <div
                                    key={key}
                                    className="bg-navy-700/50 border border-gray-700/50 rounded-xl p-4 hover:border-accent-green/30 transition-all animate-fade-in-up"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon size={16} className="text-accent-green" />
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                            {label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-200 leading-relaxed">{val}</p>
                                </div>
                            );
                        })}
                </div>
            </section>

            {/* Limitations */}
            {limitations && (
                <section className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-gray-200 mb-3 flex items-center gap-2">
                        <AlertCircle size={20} className="text-amber-400" />
                        Limitations
                    </h2>
                    <p className="text-gray-300 leading-relaxed">{limitations}</p>
                </section>
            )}
        </div>
    );
}
