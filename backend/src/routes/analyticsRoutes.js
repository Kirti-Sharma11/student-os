const express = require("express");
const router = express.Router();

const analyticsController = require("../controllers/analyticsController");

router.get("/overview", analyticsController.getOverview);
router.get("/ats-trend", analyticsController.getATSTrend);
router.get("/skills", analyticsController.getSkillsAnalytics);
router.get("/missing-skills", analyticsController.getMissingSkills);

module.exports = router;