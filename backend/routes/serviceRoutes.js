const express = require("express");
const { getNearbyProviders } = require("../controllers/serviceController");

const router = express.Router();

router.get("/nearby", getNearbyProviders);

module.exports = router;
