/* ========================================================
   LandSuit — Frontend JavaScript
   ======================================================== */

const STATUS_MESSAGES = [
    "Uploading satellite image...",
    "Analyzing terrain features...",
    "Evaluating infrastructure proximity...",
    "Assessing environmental factors...",
    "Computing suitability scores...",
    "Generating development recommendations...",
    "Compiling final report...",
];

const FEATURE_META = {
    terrain: { label: "Terrain", icon: "mountain" },
    vegetation_density: { label: "Vegetation Density", icon: "tree" },
    water_bodies: { label: "Water Bodies", icon: "droplet" },
    roads: { label: "Roads & Access", icon: "route" },
    nearby_structures: { label: "Nearby Structures", icon: "building" },
    urban_density: { label: "Urban Density", icon: "city" },
    risk_indicators: { label: "Risk Indicators", icon: "alert" },
};

function featureIcon(key) {
    const icons = {
        mountain: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`,
        tree: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 14 12 4 7 14"/><path d="M12 4v16"/><path d="M7 14h10"/></svg>`,
        droplet: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`,
        route: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>`,
        building: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>`,
        city: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="6" width="7" height="16" rx="1"/><rect x="9" y="2" width="7" height="20" rx="1"/><rect x="17" y="9" width="6" height="13" rx="1"/></svg>`,
        alert: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    };
    return icons[key] || icons.mountain;
}

function planIcon() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>`;
}

function scoreColor(s) {
    if (s >= 8) return "#22c55e";
    if (s >= 6) return "#84cc16";
    if (s >= 4) return "#f59e0b";
    return "#ef4444";
}

function classColor(c) {
    if (!c) return "var(--gray-400)";
    const l = c.toLowerCase();
    if (l.includes("highly")) return "#22c55e";
    if (l.includes("moderately")) return "#84cc16";
    if (l.includes("low")) return "#f59e0b";
    return "#ef4444";
}

/* ===================== UPLOAD PAGE ===================== */
function initUploadPage() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const previewContainer = document.getElementById("previewContainer");
    const previewImage = document.getElementById("previewImage");
    const fileNameEl = document.getElementById("fileName");
    const fileSizeEl = document.getElementById("fileSize");
    const removeBtn = document.getElementById("removeBtn");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const errorBox = document.getElementById("errorBox");
    const errorText = document.getElementById("errorText");
    const loadingSection = document.getElementById("loadingSection");
    const statusText = document.getElementById("statusText");
    const progressFill = document.getElementById("progressFill");
    const btnText = document.getElementById("btnText");

    let selectedFile = null;

    // Drag & drop
    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("drag-over"); });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("drag-over");
        if (e.dataTransfer.files.length) setFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener("change", () => { if (fileInput.files.length) setFile(fileInput.files[0]); });

    function setFile(f) {
        selectedFile = f;
        previewImage.src = URL.createObjectURL(f);
        fileNameEl.textContent = f.name;
        fileSizeEl.textContent = `(${(f.size / (1024 * 1024)).toFixed(1)} MB)`;
        dropZone.style.display = "none";
        previewContainer.style.display = "block";
        analyzeBtn.disabled = false;
        hideError();
    }

    removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedFile = null;
        dropZone.style.display = "";
        previewContainer.style.display = "none";
        analyzeBtn.disabled = true;
        fileInput.value = "";
    });

    function showError(msg) {
        errorText.textContent = msg;
        errorBox.style.display = "flex";
    }
    function hideError() { errorBox.style.display = "none"; }

    // Analyze
    analyzeBtn.addEventListener("click", async () => {
        if (!selectedFile) { showError("Please upload a satellite image first."); return; }

        analyzeBtn.disabled = true;
        btnText.textContent = "Analyzing...";
        analyzeBtn.innerHTML = `<div class="spinner"></div><span>Analyzing...</span>`;
        hideError();
        loadingSection.style.display = "block";

        let statusIdx = 0;
        statusText.textContent = STATUS_MESSAGES[0];
        progressFill.style.width = `${(1 / STATUS_MESSAGES.length) * 100}%`;
        const interval = setInterval(() => {
            if (statusIdx < STATUS_MESSAGES.length - 1) {
                statusIdx++;
                statusText.textContent = STATUS_MESSAGES[statusIdx];
                progressFill.style.width = `${((statusIdx + 1) / STATUS_MESSAGES.length) * 100}%`;
            }
        }, 4000);

        const formData = new FormData();
        formData.append("image", selectedFile);
        const lat = document.getElementById("lat").value;
        const lng = document.getElementById("lng").value;
        if (lat) formData.append("lat", lat);
        if (lng) formData.append("lng", lng);

        try {
            const resp = await fetch("/analyze", { method: "POST", body: formData });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || "Analysis failed.");

            // Save to history
            try {
                const history = JSON.parse(localStorage.getItem("landAnalysisHistory") || "[]");
                history.unshift(data);
                if (history.length > 20) history.pop();
                localStorage.setItem("landAnalysisHistory", JSON.stringify(history));
            } catch (_) { }

            // Save current result and go to results page
            sessionStorage.setItem("currentAnalysis", JSON.stringify(data));
            window.location.href = "/results";

        } catch (err) {
            showError(err.message || "Analysis failed. Please try again.");
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg><span>Analyze Land Suitability</span>`;
        } finally {
            clearInterval(interval);
            loadingSection.style.display = "none";
        }
    });
}

/* ===================== RESULTS PAGE ===================== */
function initResultsPage() {
    const raw = sessionStorage.getItem("currentAnalysis");
    if (!raw) { document.getElementById("noData").style.display = "flex"; return; }

    const data = JSON.parse(raw);
    document.getElementById("noData").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    // Image
    if (data._image) {
        document.getElementById("imagePreview").style.display = "block";
        document.getElementById("resultImage").src = data._image;
        if (data._timestamp) document.getElementById("resultTimestamp").textContent = new Date(data._timestamp).toLocaleString();
    }

    // Location summary
    document.getElementById("locationSummary").textContent = data.location_summary || "N/A";

    // Gauge
    const overall = data.scores?.overall_score || 0;
    const circ = 2 * Math.PI * 80;
    const offset = circ - (overall / 10) * circ;
    const color = scoreColor(overall);
    const gauge = document.getElementById("gaugeCircle");
    gauge.style.stroke = color;
    gauge.style.filter = `drop-shadow(0 0 8px ${color}40)`;
    document.getElementById("gaugeGlow").style.fill = `${color}1A`;
    document.getElementById("gaugeScore").textContent = overall.toFixed(1);
    document.getElementById("gaugeScore").style.color = color;
    setTimeout(() => { gauge.style.strokeDashoffset = offset; }, 100);

    const cls = data.scores?.classification || "N/A";
    const badge = document.getElementById("classificationBadge");
    badge.textContent = cls;
    badge.style.color = classColor(cls);
    badge.style.borderColor = classColor(cls) + "40";
    badge.style.background = classColor(cls) + "14";

    document.querySelector(".gauge-card").classList.add("anim-glow");

    // Bars
    const bars = [
        { id: "barTerrain", score: data.scores?.terrain_score || 0 },
        { id: "barAccessibility", score: data.scores?.accessibility_score || 0 },
        { id: "barInfrastructure", score: data.scores?.infrastructure_score || 0 },
        { id: "barEnvRisk", score: data.scores?.environmental_risk_score || 0 },
        { id: "barUrban", score: data.scores?.urban_compatibility_score || 0 },
    ];
    bars.forEach((b, i) => {
        const row = document.getElementById(b.id);
        const fill = row.querySelector(".bar-fill");
        const val = row.querySelector(".bar-value");
        const c = scoreColor(b.score);
        fill.style.background = c;
        fill.style.boxShadow = `0 0 8px ${c}50`;
        val.textContent = `${b.score}/10`;
        setTimeout(() => { fill.style.width = `${(b.score / 10) * 100}%`; }, 200 + i * 150);
    });

    // Feature cards
    const featureContainer = document.getElementById("featureCards");
    featureContainer.innerHTML = "";
    const features = data.detected_features || {};
    Object.entries(FEATURE_META).forEach(([key, meta], i) => {
        const val = features[key] || "Not detected";
        const isRisk = key === "risk_indicators";
        const card = document.createElement("div");
        card.className = `feature-card anim-fiu${isRisk ? " risk" : ""}`;
        card.style.animationDelay = `${i * 80}ms`;
        card.innerHTML = `
      <div class="feature-card-header">
        <div class="feature-icon">${featureIcon(meta.icon)}</div>
        <div>
          <div class="feature-label">${meta.label}</div>
          <div class="feature-value">${val}</div>
        </div>
      </div>`;
        featureContainer.appendChild(card);
    });

    // Recommended development
    document.getElementById("recType").textContent = data.recommended_development?.type || "N/A";
    document.getElementById("recJustification").textContent = data.recommended_development?.justification || "N/A";

    // Prototype plan
    const planContainer = document.getElementById("planCards");
    planContainer.innerHTML = "";
    const plan = data.prototype_plan || {};
    Object.entries(plan).forEach(([key, val], i) => {
        const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        const card = document.createElement("div");
        card.className = "plan-card anim-fiu";
        card.style.animationDelay = `${i * 100}ms`;
        card.innerHTML = `<div class="plan-card-title">${planIcon()} ${label}</div><div class="plan-card-text">${val}</div>`;
        planContainer.appendChild(card);
    });

    // Limitations
    if (data.limitations) {
        document.getElementById("limitationsSection").style.display = "block";
        document.getElementById("limitationsText").textContent = data.limitations;
    }

    // PDF export
    document.getElementById("exportPdfBtn").addEventListener("click", () => exportPDF(data));
}

/* ===================== PDF EXPORT ===================== */
function exportPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");
    const pw = doc.internal.pageSize.getWidth();
    const m = 15, cw = pw - m * 2;
    let y = 15;

    function sColor(s) { return s >= 8 ? [34, 197, 94] : s >= 6 ? [132, 204, 22] : s >= 4 ? [245, 158, 11] : [239, 68, 68]; }
    function pageCheck() { if (y > 260) { doc.addPage(); y = 20; } }
    function heading(t) { pageCheck(); doc.setFillColor(17, 24, 39); doc.roundedRect(m, y - 4, cw, 10, 2, 2, "F"); doc.setTextColor(34, 197, 94); doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text(t, m + 4, y + 3); y += 14; }
    function field(l, v) { pageCheck(); doc.setTextColor(160, 174, 192); doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.text(l + ":", m + 2, y); doc.setTextColor(226, 232, 240); doc.setFont("helvetica", "normal"); const lines = doc.splitTextToSize(String(v || "N/A"), cw - 40); doc.text(lines, m + 42, y); y += lines.length * 5 + 3; }
    function bar(l, s) { pageCheck(); const bw = cw - 55, c = sColor(s); doc.setTextColor(160, 174, 192); doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.text(l, m + 2, y + 3); doc.setFillColor(30, 41, 59); doc.roundedRect(m + 45, y - 1, bw, 6, 1.5, 1.5, "F"); doc.setFillColor(...c); doc.roundedRect(m + 45, y - 1, (s / 10) * bw, 6, 1.5, 1.5, "F"); doc.setTextColor(...c); doc.setFont("helvetica", "bold"); doc.text(s + "/10", m + 47 + bw, y + 3); y += 10; }

    // Header
    doc.setFillColor(10, 15, 30); doc.rect(0, 0, pw, 40, "F");
    doc.setFillColor(34, 197, 94); doc.rect(0, 38, pw, 2, "F");
    doc.setTextColor(34, 197, 94); doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.text("Land Suitability Analysis Report", m, 18);
    doc.setTextColor(160, 174, 192); doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text("Generated: " + (data._timestamp ? new Date(data._timestamp).toLocaleString() : new Date().toLocaleString()), m, 28);
    if (data._coordinates) doc.text("Coordinates: " + data._coordinates.lat + ", " + data._coordinates.lng, m, 33);
    y = 50;

    heading("Location Summary");
    doc.setTextColor(226, 232, 240); doc.setFontSize(9); doc.setFont("helvetica", "normal");
    const sl = doc.splitTextToSize(data.location_summary || "N/A", cw - 4); doc.text(sl, m + 2, y); y += sl.length * 5 + 6;

    heading("Overall Suitability Score");
    const o = data.scores?.overall_score || 0, oc = sColor(o);
    doc.setFontSize(28); doc.setFont("helvetica", "bold"); doc.setTextColor(...oc);
    doc.text(o + "/10", m + 10, y + 8);
    doc.setFontSize(11); doc.text(data.scores?.classification || "", m + 50, y + 8); y += 20;

    heading("Score Breakdown");
    bar("Terrain", data.scores?.terrain_score || 0);
    bar("Accessibility", data.scores?.accessibility_score || 0);
    bar("Infrastructure", data.scores?.infrastructure_score || 0);
    bar("Environmental Risk", data.scores?.environmental_risk_score || 0);
    bar("Urban Compatibility", data.scores?.urban_compatibility_score || 0);
    y += 4;

    heading("Detected Features");
    Object.entries(data.detected_features || {}).forEach(([k, v]) => { field(k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), v); }); y += 4;

    heading("Recommended Development");
    field("Type", data.recommended_development?.type); field("Justification", data.recommended_development?.justification); y += 4;

    heading("Prototype Development Plan");
    Object.entries(data.prototype_plan || {}).forEach(([k, v]) => { field(k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), v); }); y += 4;

    heading("Limitations");
    doc.setTextColor(226, 232, 240); doc.setFontSize(9); doc.setFont("helvetica", "normal");
    const ll = doc.splitTextToSize(data.limitations || "None noted.", cw - 4); doc.text(ll, m + 2, y);

    // Footer
    const pc = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pc; i++) { doc.setPage(i); doc.setFillColor(10, 15, 30); doc.rect(0, 287, pw, 10, "F"); doc.setTextColor(100, 116, 139); doc.setFontSize(7); doc.text("Land Suitability Analysis — AI-Powered Report", m, 293); doc.text("Page " + i + " of " + pc, pw - m - 20, 293); }

    doc.save("Land_Suitability_Report.pdf");
}

/* ===================== HISTORY PAGE ===================== */
function initHistoryPage() {
    const entries = JSON.parse(localStorage.getItem("landAnalysisHistory") || "[]");
    if (!entries.length) { document.getElementById("emptyState").style.display = "flex"; return; }

    document.getElementById("historyContent").style.display = "block";
    document.getElementById("historyCount").textContent = `(${entries.length} reports)`;

    function render() {
        const list = document.getElementById("historyList");
        const current = JSON.parse(localStorage.getItem("landAnalysisHistory") || "[]");
        document.getElementById("historyCount").textContent = `(${current.length} reports)`;

        if (!current.length) {
            document.getElementById("historyContent").style.display = "none";
            document.getElementById("emptyState").style.display = "flex";
            return;
        }

        list.innerHTML = "";
        current.forEach((entry, i) => {
            const div = document.createElement("div");
            div.className = "history-item";
            const cls = entry.scores?.classification || "N/A";
            div.innerHTML = `
        ${entry._image ? `<img src="${entry._image}" class="history-thumb" alt="Satellite"/>` : ""}
        <div class="history-info">
          <div class="history-score-row">
            <span class="history-score">${(entry.scores?.overall_score || 0).toFixed(1)}/10</span>
            <span class="history-class" style="color:${classColor(cls)}">${cls}</span>
          </div>
          <div class="history-type">${entry.recommended_development?.type || "Unknown"}</div>
          <div class="history-meta">
            ${entry._timestamp ? `<span><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${new Date(entry._timestamp).toLocaleDateString()} ${new Date(entry._timestamp).toLocaleTimeString()}</span>` : ""}
            ${entry._coordinates ? `<span><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>${entry._coordinates.lat.toFixed(4)}, ${entry._coordinates.lng.toFixed(4)}</span>` : ""}
          </div>
        </div>
        <div class="history-actions">
          <button class="history-delete" data-idx="${i}" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
          <svg class="history-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>`;

            div.addEventListener("click", (e) => {
                if (e.target.closest(".history-delete")) return;
                sessionStorage.setItem("currentAnalysis", JSON.stringify(entry));
                window.location.href = "/results";
            });
            list.appendChild(div);
        });

        // Delete buttons
        list.querySelectorAll(".history-delete").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                const arr = JSON.parse(localStorage.getItem("landAnalysisHistory") || "[]");
                arr.splice(idx, 1);
                localStorage.setItem("landAnalysisHistory", JSON.stringify(arr));
                render();
            });
        });
    }

    render();

    document.getElementById("clearAllBtn").addEventListener("click", () => {
        localStorage.removeItem("landAnalysisHistory");
        render();
    });
}
