const ResumeAnalysis = require("../models/ResumeAnalysis");
exports.getOverview = async (req, res) => {
  try {

    const totalResumes =
      await ResumeAnalysis.countDocuments();

    const avgATS =
      await ResumeAnalysis.aggregate([
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
      await ResumeAnalysis.findOne()
      .sort({ atsScore: -1 });

    const topSkill =
      await ResumeAnalysis.aggregate([
        { $unwind: "$skills" },
        {
          $group: {
            _id: "$skills",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
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

  const data =
    await ResumeAnalysis.find()
    .sort({ createdAt: 1 });

  const trend = data.map(item => ({
    date:
      item.createdAt
      .toISOString()
      .split("T")[0],

    atsScore:
      item.atsScore
  }));

  res.json(trend);
};
exports.getSkillsAnalytics = async (
  req,
  res
) => {

  const skills =
    await ResumeAnalysis.aggregate([
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
};
exports.getMissingSkills = async (
  req,
  res
) => {

  const skills =
    await ResumeAnalysis.aggregate([
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
};