import React, { useMemo } from "react";

function getScoreColor(score) {
    if (score >= 8) return { stroke: "#22c55e", label: "text-accent-green", bg: "rgba(34,197,94,0.12)" };
    if (score >= 6) return { stroke: "#84cc16", label: "text-accent-lime", bg: "rgba(132,204,22,0.12)" };
    if (score >= 4) return { stroke: "#f59e0b", label: "text-amber-400", bg: "rgba(245,158,11,0.12)" };
    return { stroke: "#ef4444", label: "text-red-400", bg: "rgba(239,68,68,0.12)" };
}

export default function ScoreGauge({ score = 0, classification = "" }) {
    const radius = 80;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 10) * circumference;
    const colors = useMemo(() => getScoreColor(score), [score]);

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: 200, height: 200 }}>
                <svg width="200" height="200" viewBox="0 0 200 200">
                    {/* Background circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        strokeLinecap="round"
                        transform="rotate(-90 100 100)"
                        style={{
                            transition: "stroke-dashoffset 1.5s ease-out",
                            filter: `drop-shadow(0 0 8px ${colors.stroke}40)`,
                        }}
                    />
                    {/* Glow effect */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius - 20}
                        fill={colors.bg}
                    />
                </svg>

                {/* Score text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className={`text-5xl font-black ${colors.label}`}
                        style={{ lineHeight: 1 }}
                    >
                        {score.toFixed(1)}
                    </span>
                    <span className="text-gray-400 text-sm font-medium mt-1">/ 10</span>
                </div>
            </div>

            {/* Classification badge */}
            <div
                className="px-4 py-1.5 rounded-full text-sm font-semibold border"
                style={{
                    color: colors.stroke,
                    borderColor: `${colors.stroke}40`,
                    backgroundColor: `${colors.stroke}10`,
                }}
            >
                {classification || "N/A"}
            </div>
        </div>
    );
}
