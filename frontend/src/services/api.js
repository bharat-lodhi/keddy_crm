const API_BASE = "http://localhost:8000";

export async function apiRequest(url, method = "GET", data = null) {
    const options = {
        method,
        headers: {
            // Hum default header nahi rakhenge, niche condition se set karenge
        },
        credentials: "include", // IMPORTANT for session
    };

    if (data) {
        if (data instanceof FormData) {
            // AGAR DATA FILE HAI (FormData):
            // 1. Body mein direct data jayega (JSON.stringify nahi hoga)
            // 2. Content-Type header browser apne aap set karega (boundary ke saath)
            options.body = data;
        } else {
            // AGAR DATA NORMAL OBJECT HAI (Purane codes ke liye):
            // 1. Content-Type pehle ki tarah "application/json" rahega
            // 2. Data JSON.stringify hoke jayega
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(data);
        }
    }

    const response = await fetch(API_BASE + url, options);
    return response.json();
}


// const API_BASE = "http://localhost:8000";

// export async function apiRequest(url, method = "GET", data = null) {
//     const options = {
//         method,
//         headers: {
//             "Content-Type": "application/json",
//         },
//         credentials: "include", // IMPORTANT for session
//     };

//     if (data) {
//         options.body = JSON.stringify(data);
//     }

//     const response = await fetch(API_BASE + url, options);
//     return response.json();
// }