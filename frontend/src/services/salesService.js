const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const handleResponse = async (response) => {
    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Something went wrong."
        );
    }

    return result;
};


// ======================================
// GET ALL SALES
// ======================================

export const getAllSales = async ({
    date = "",
    orderNo = "",
    paymentMethod = "",
    page = 1,
    limit = 10,
    signal
}) => {

    const params = new URLSearchParams();

    if (date) params.append("date", date);
    if (orderNo) params.append("orderNo", orderNo);
    if (paymentMethod) params.append("paymentMethod", paymentMethod);

    params.append("page", page);
    params.append("limit", limit);

    const response = await fetch(
        `${API_URL}/sales?${params.toString()}`,
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
// GET SALE DETAILS
// ======================================

export const getSaleDetails = async (orderId) => {

    const response = await fetch(
        `${API_URL}/sales/${orderId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    return handleResponse(response);
};


// ======================================
// CREATE SALE
// ======================================

export const createSale = async (saleData) => {

    const response = await fetch(
        `${API_URL}/sales`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(saleData)
        }
    );

    return handleResponse(response);
};