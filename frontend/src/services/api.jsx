// services/api.js

// ✅ LIVE pe ye use karo
// export const API_BASE = "https://crm.keddytech.in";

export const API_BASE = "https://crm.keddyzerobouncevelidetor.com";

// ✅ LOCAL pe ye use karo
// export const API_BASE = "http://localhost:8000";

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





// // export const API_BASE = "https://crm.keddytech.in";
// export const API_BASE = "http://localhost:8000";

// export async function apiRequest(url, method = "GET", data = null) {
//     const token = localStorage.getItem("access"); // access token yahan se uthayega

//     const options = {
//         method,
//         headers: {
//             Authorization: token ? `Bearer ${token}` : "",
//         },
//     };

//     if (data) {
//         if (data instanceof FormData) {
//             options.body = data;
//         } else {
//             options.headers["Content-Type"] = "application/json";
//             options.body = JSON.stringify(data);
//         }
//     }

//     const response = await fetch(API_BASE + url, options);

//     // Agar token expire ho gaya ho
//     if (response.status === 401) {
//         localStorage.removeItem("access");
//         window.location.href = "/";
//         return;
//     }

//     return response.json();
// }





// // export const API_BASE = "https://crm.keddytech.in";

// export const API_BASE = "http://localhost:8000";

// export async function apiRequest(url, method = "GET", data = null) {
//     const options = {
//         method,
//         headers: {
//             // Hum default header nahi rakhenge, niche condition se set karenge
//         },
//         credentials: "include", // IMPORTANT for session
//     };

//     if (data) {
//         if (data instanceof FormData) {
//             // AGAR DATA FILE HAI (FormData):
//             // 1. Body mein direct data jayega (JSON.stringify nahi hoga)
//             // 2. Content-Type header browser apne aap set karega (boundary ke saath)
//             options.body = data;
//         } else {
//             // AGAR DATA NORMAL OBJECT HAI (Purane codes ke liye):
//             // 1. Content-Type pehle ki tarah "application/json" rahega
//             // 2. Data JSON.stringify hoke jayega
//             options.headers["Content-Type"] = "application/json";
//             options.body = JSON.stringify(data);
//         }
//     }

//     const response = await fetch(API_BASE + url, options);
//     return response.json();
// }



