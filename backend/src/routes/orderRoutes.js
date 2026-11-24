const express = require("express");
const { createOrder, getCustomers } = require("../controllers/orderControllers");
const router = express.Router();

router.post("/", createOrder);

router.get("/customers", getCustomers);

module.exports = router;