const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { rateLimit } =
require("../middleware/rateLimit");
const analyticsController = require("../controllers/analyticsController");

router.use(authMiddleware);
router.use(rateLimit());
router.get("/overview", (req,res,next)=>{
  console.log("ANALYTICS USER =", req.userId);
  next();
}, analyticsController.getOverview);

router.get("/ats-trend", analyticsController.getATSTrend);
router.get("/skills", analyticsController.getSkillsAnalytics);
router.get("/missing-skills", analyticsController.getMissingSkills);

module.exports = router;