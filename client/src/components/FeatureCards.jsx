import React from "react";
import {
    Mountain,
    TreePine,
    Droplets,
    Route,
    Building2,
    Building,
    AlertTriangle,
} from "lucide-react";

const FEATURE_CONFIG = {
    terrain: { icon: Mountain, label: "Terrain" },
    vegetation_density: { icon: TreePine, label: "Vegetation Density" },
    water_bodies: { icon: Droplets, label: "Water Bodies" },
    roads: { icon: Route, label: "Roads & Access" },
    nearby_structures: { icon: Building2, label: "Nearby Structures" },
    urban_density: { icon: Building, label: "Urban Density" },
    risk_indicators: { icon: AlertTriangle, label: "Risk Indicators" },
};

export default function FeatureCards({ features = {} }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(FEATURE_CONFIG).map(([key, config], index) => {
                const value = features[key] || "Not detected";
                const Icon = config.icon;
                const isRisk = key === "risk_indicators";

                return (
                    <div
                        key={key}
                        className={`rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-in-up ${isRisk
                                ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                                : "bg-navy-700/50 border-gray-700/50 hover:border-accent-green/30"
                            }`}
                        style={{ animationDelay: `${index * 80}ms` }}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isRisk ? "bg-red-500/10" : "bg-accent-green/10"
                                    }`}
                            >
                                <Icon
                                    size={20}
                                    className={isRisk ? "text-red-400" : "text-accent-green"}
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                                    {config.label}
                                </p>
                                <p className="text-sm text-gray-200 leading-relaxed">{value}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
