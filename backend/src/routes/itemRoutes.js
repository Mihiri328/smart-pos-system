const express = require("express");
const { getItems, getCategories } = require("../controllers/itemController");

const router = express.Router();

router.get("/", getItems);
router.get("/categories", getCategories);

module.exports = router;