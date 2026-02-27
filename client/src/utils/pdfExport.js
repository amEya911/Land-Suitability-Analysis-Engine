import jsPDF from "jspdf";

function getScoreColor(score) {
    if (score >= 8) return [34, 197, 94];
    if (score >= 6) return [132, 204, 22];
    if (score >= 4) return [245, 158, 11];
    return [239, 68, 68];
}

export function exportPDF(data) {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = 15;

    // --- Header ---
    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 38, pageWidth, 2, "F");

    doc.setTextColor(34, 197, 94);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Land Suitability Analysis Report", margin, 18);

    doc.setTextColor(160, 174, 192);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const dateStr = data._timestamp
        ? new Date(data._timestamp).toLocaleString()
        : new Date().toLocaleString();
    doc.text(`Generated: ${dateStr}`, margin, 28);

    if (data._coordinates) {
        doc.text(
            `Coordinates: ${data._coordinates.lat}, ${data._coordinates.lng}`,
            margin,
            33
        );
    }

    y = 50;

    // --- Helper functions ---
    function addSectionHeader(title) {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFillColor(17, 24, 39);
        doc.roundedRect(margin, y - 4, contentWidth, 10, 2, 2, "F");
        doc.setTextColor(34, 197, 94);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin + 4, y + 3);
        y += 14;
    }

    function addText(label, value) {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.setTextColor(160, 174, 192);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, margin + 2, y);

        doc.setTextColor(226, 232, 240);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(String(value || "N/A"), contentWidth - 40);
        doc.text(lines, margin + 42, y);
        y += lines.length * 5 + 3;
    }

    function addScoreBar(label, score) {
        if (y > 275) { doc.addPage(); y = 20; }
        const barWidth = contentWidth - 55;
        const color = getScoreColor(score);

        doc.setTextColor(160, 174, 192);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(label, margin + 2, y + 3);

        doc.setFillColor(30, 41, 59);
        doc.roundedRect(margin + 45, y - 1, barWidth, 6, 1.5, 1.5, "F");

        const fillWidth = (score / 10) * barWidth;
        doc.setFillColor(...color);
        doc.roundedRect(margin + 45, y - 1, fillWidth, 6, 1.5, 1.5, "F");

        doc.setTextColor(...color);
        doc.setFont("helvetica", "bold");
        doc.text(`${score}/10`, margin + 47 + barWidth, y + 3);
        y += 10;
    }

    // --- Location Summary ---
    addSectionHeader("Location Summary");
    doc.setTextColor(226, 232, 240);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(
        data.location_summary || "N/A",
        contentWidth - 4
    );
    doc.text(summaryLines, margin + 2, y);
    y += summaryLines.length * 5 + 6;

    // --- Overall Score ---
    addSectionHeader("Overall Suitability Score");
    const overall = data.scores?.overall_score || 0;
    const oColor = getScoreColor(overall);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...oColor);
    doc.text(`${overall}/10`, margin + 10, y + 8);

    doc.setFontSize(11);
    doc.text(data.scores?.classification || "", margin + 50, y + 8);
    y += 20;

    // --- Individual Scores ---
    addSectionHeader("Score Breakdown");
    const scores = data.scores || {};
    addScoreBar("Terrain", scores.terrain_score || 0);
    addScoreBar("Accessibility", scores.accessibility_score || 0);
    addScoreBar("Infrastructure", scores.infrastructure_score || 0);
    addScoreBar("Environmental Risk", scores.environmental_risk_score || 0);
    addScoreBar("Urban Compatibility", scores.urban_compatibility_score || 0);
    y += 4;

    // --- Detected Features ---
    addSectionHeader("Detected Features");
    const features = data.detected_features || {};
    Object.entries(features).forEach(([key, val]) => {
        const label = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
        addText(label, val);
    });
    y += 4;

    // --- Recommended Development ---
    addSectionHeader("Recommended Development");
    addText("Type", data.recommended_development?.type);
    addText("Justification", data.recommended_development?.justification);
    y += 4;

    // --- Prototype Plan ---
    addSectionHeader("Prototype Development Plan");
    const plan = data.prototype_plan || {};
    Object.entries(plan).forEach(([key, val]) => {
        const label = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
        addText(label, val);
    });
    y += 4;

    // --- Limitations ---
    addSectionHeader("Limitations");
    doc.setTextColor(226, 232, 240);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const limLines = doc.splitTextToSize(
        data.limitations || "None noted.",
        contentWidth - 4
    );
    doc.text(limLines, margin + 2, y);
    y += limLines.length * 5 + 10;

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(10, 15, 30);
        doc.rect(0, 287, pageWidth, 10, "F");
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.text(
            "Land Suitability Analysis — AI-Powered Report",
            margin,
            293
        );
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 293);
    }

    doc.save("Land_Suitability_Report.pdf");
}
