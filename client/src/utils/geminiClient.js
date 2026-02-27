import axios from "axios";

const API_BASE = "http://localhost:5001/api";

export async function analyzeImage(file, lat, lng) {
    const formData = new FormData();
    formData.append("image", file);
    if (lat) formData.append("lat", lat);
    if (lng) formData.append("lng", lng);

    const response = await axios.post(`${API_BASE}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
    });

    return response.data;
}
