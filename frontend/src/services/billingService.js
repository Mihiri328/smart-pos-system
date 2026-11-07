const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const handleResponse = async (response) => {
    let result = {};

    try {
        result = await response.json();
    } catch {
        result = {};
    }

    if (!response.ok) {
        const error = new Error(
            result.message || "Something went wrong."
        );

        error.details = result;
        throw error;
    }

    return result;
};


// ======================================
// GET ALL BILLING ITEMS
// Supports search and category filtering
// ======================================

export const getBillingItems = async ({
    search = "",
    category = "",
    signal
} = {}) => {

    const params = new URLSearchParams();

    if (search.trim()) {
        params.append("search", search.trim());
    }

    if (category && category !== "All") {
        params.append("category", category);
    }

    const query = params.toString();

    const response = await fetch(
        `${API_URL}/items${query ? `?${query}` : ""}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            signal
        }
    );

    return handleResponse(response);
};


// ======================================
// GET ITEM CATEGORIES
// ======================================

export const getBillingCategories = async ({ signal } = {}) => {

    const response = await fetch(
        `${API_URL}/items/categories`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            signal
        }
    );

    return handleResponse(response);
};


// ======================================
// CREATE BILLING ORDER
// ======================================

export const createBillingOrder = async (orderData) => {

    const response = await fetch(
        `${API_URL}/orders`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        }
    );

    return handleResponse(response);
};