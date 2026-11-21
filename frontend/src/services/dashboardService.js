const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";


async function request(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Something went wrong.");
    }

    return result.data;
}


// GET DASHBOARD
export async function getDashboard() {
    return request("/dashboard");
}


// GET SALES PERFORMANCE
export async function getSalesPerformance(period = "Weekly") {
    const params = new URLSearchParams({ period });

    return request(`/dashboard/sales-performance?${params.toString()}`);
}


// MARK PURCHASE ORDER AS RECEIVED
export async function markPurchaseOrderReceived(id) {
    return request(`/dashboard/purchase-orders/${id}/receive`, {
        method: "PUT"
    });
}