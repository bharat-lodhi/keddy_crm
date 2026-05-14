// services/api.js

// ✅ Use it on LIVE 
export const API_BASE = "https://crm.keddycrm.in";

// ✅ Use it on LOCAL
// export const API_BASE = "http://localhost:8000"

export async function apiRequest(url, method = "GET", data = null) {
    const token = localStorage.getItem("access");

    const headers = {};

    // ✅ JWT token header
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
        method: method,
        headers: headers,
        credentials: "include", // ✅ VERY IMPORTANT (session cookies send karega)
    };

    // ✅ Body handling
    if (data) {
        if (data instanceof FormData) {
            options.body = data;
        } else {
            headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(data);
        }
    }

    try {
        const response = await fetch(API_BASE + url, options);

        // ✅ Unauthorized → logout
        if (response.status === 401) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.href = "/";
            return;
        }

        // ✅ Safe JSON parse
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            return await response.text();
        }

    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}



