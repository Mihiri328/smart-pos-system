const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

router.get("/", dashboardController.getDashboard);

router.get(
    "/sales-performance",
    dashboardController.getSalesPerformance
);

router.put(
    "/purchase-orders/:id/receive",
    dashboardController.markPurchaseOrderReceived
);

module.exports = router;