const ResumeAnalysis = require("../models/ResumeAnalysis");

exports.getOverview = async (req, res) => {
  try {
    console.log("REQ USER ID =", req.userId);
    const totalResumes =
      await ResumeAnalysis.countDocuments({
        userId: req.userId
      });

    const avgATS =
      await ResumeAnalysis.aggregate([
        {
          $match: {
            userId: req.userId
          }
        },
        {
          $group: {
            _id: null,
            avgScore: {
              $avg: "$atsScore"
            }
          }
        }
      ]);

    const highestATSDoc =
      await ResumeAnalysis.findOne({
        userId: req.userId
      }).sort({
        atsScore: -1
      });

    const topSkill =
      await ResumeAnalysis.aggregate([
        {
          $match: {
            userId: req.userId
          }
        },
        {
          $unwind: "$skills"
        },
        {
          $group: {
            _id: "$skills",
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        },
        {
          $limit: 1
        }
      ]);

    res.json({
      totalResumes,
      averageATS:
        avgATS[0]?.avgScore || 0,
      highestATS:
        highestATSDoc?.atsScore || 0,
      mostCommonSkill:
        topSkill[0]?._id || "N/A"
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message
    });
  }
};

exports.getATSTrend = async (req, res) => {
  try {

    const data =
      await ResumeAnalysis.find({
        userId: req.userId
      }).sort({
        createdAt: 1
      });

    const trend = data.map(item => ({
      date:
        item.createdAt
          .toISOString()
          .split("T")[0],

      atsScore:
        item.atsScore
    }));

    res.json(trend);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.getSkillsAnalytics = async (
  req,
  res
) => {
  try {

    const skills =
      await ResumeAnalysis.aggregate([
        {
          $match: {
            userId: req.userId
          }
        },
        {
          $unwind: "$skills"
        },
        {
          $group: {
            _id: "$skills",
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        },
        {
          $limit: 10
        }
      ]);

    res.json(skills);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.getMissingSkills = async (
  req,
  res
) => {
  try {

    const skills =
      await ResumeAnalysis.aggregate([
        {
          $match: {
            userId: req.userId
          }
        },
        {
          $unwind: "$missingSkills"
        },
        {
          $group: {
            _id: "$missingSkills",
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        },
        {
          $limit: 10
        }
      ]);

    res.json(skills);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};