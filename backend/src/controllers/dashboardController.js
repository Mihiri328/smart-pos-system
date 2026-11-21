const dashboardService = require("../services/dashboardService");

async function getDashboard(req, res) {
    try {
        const data = await dashboardService.getDashboardData();

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to load dashboard."
        });
    }
}


async function getSalesPerformance(req, res) {
    try {
        const period = req.query.period || "Weekly";

        const data = await dashboardService.getSalesPerformance(period);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error("Sales performance error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to load sales performance."
        });
    }
}


async function markPurchaseOrderReceived(req, res) {
    try {
        const { id } = req.params;

        await dashboardService.markPurchaseOrderReceived(id);

        return res.status(200).json({
            success: true,
            message: "Purchase order marked as received."
        });

    } catch (error) {
        console.error("Purchase order receiving error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to receive purchase order."
        });
    }
}


module.exports = {
    getDashboard,
    getSalesPerformance,
    markPurchaseOrderReceived
};