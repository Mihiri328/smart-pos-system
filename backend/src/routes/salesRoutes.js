const express = require("express");
const router = express.Router();

const {
    getAllSales,
    getSaleDetails,
    createSale
} = require("../controllers/salesController");

// Get all transactions with filters and pagination
router.get("/", getAllSales);

// Get individual transaction details
router.get("/:orderId", getSaleDetails);

// Create a new transaction
router.post("/", createSale);

module.exports = router;