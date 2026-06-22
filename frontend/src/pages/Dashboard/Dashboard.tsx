import StatsCard from "../../components/dashboard/StatsCard";
import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../services/api";

const Dashboard = () => {
  const [leetcodeData, setLeetcodeData] = useState<any>(null);
  const [githubData, setGithubData] = useState<any>(null);
  const [codeforcesData, setCodeforcesData] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const githubUsername =
          localStorage.getItem("githubUsername");

        const leetcodeUsername =
          localStorage.getItem("leetcodeUsername");

        const codeforcesUsername =
          localStorage.getItem("codeforcesUsername");

        // Resume Analytics
        const analyticsRes =
          await API.get("/analytics/overview");

        setOverview(analyticsRes.data);

        // LeetCode Solved Data
        if (leetcodeUsername) {
          const solvedRes = await axios.get(
            `https://alfa-leetcode-api.onrender.com/${leetcodeUsername}/solved`
          );

          setLeetcodeData(solvedRes.data);
        }

        // GitHub
        if (githubUsername) {
          const githubRes = await axios.get(
            `https://api.github.com/users/${githubUsername}`
          );

          setGithubData(githubRes.data);
        }

        // Codeforces
        if (codeforcesUsername) {
          const cfRes = await axios.get(
            `https://codeforces.com/api/user.info?handles=${codeforcesUsername}`
          );

          setCodeforcesData(cfRes.data.result[0]);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen bg-[#06070b] p-6 text-white">

      <div className="mb-10">
        <h1 className="text-5xl font-bold">
          Welcome Back 👋
        </h1>

        <p className="mt-2 text-zinc-400">
          Track your resumes, coding profiles and overall progress.
        </p>
      </div>

      {/* Top Stats */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatsCard
          title="Total Resumes"
          value={overview?.totalResumes || 0}
        />

        <StatsCard
          title="Average ATS"
          value={`${Math.round(
            overview?.averageATS || 0
          )}%`}
        />

        <StatsCard
          title="Highest ATS"
          value={`${overview?.highestATS || 0}%`}
        />

        <StatsCard
          title="Top Skill"
          value={overview?.mostCommonSkill || "N/A"}
        />

      </div>

      {/* Coding Profiles */}

      <div className="grid md:grid-cols-3 gap-6 mt-10">

        {/* GitHub */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            🚀 GitHub
          </h2>

          <div className="space-y-3">
            <p>Repositories: {githubData?.public_repos || 0}</p>
            <p>Followers: {githubData?.followers || 0}</p>
            <p>Following: {githubData?.following || 0}</p>
          </div>
        </div>

        {/* LeetCode */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            🏆 LeetCode
          </h2>

          <div className="space-y-3">

            <p>
              Total Solved:{" "}
              {leetcodeData?.solvedProblem || 0}
            </p>

            <p>
              Easy:{" "}
              {leetcodeData?.easySolved || 0}
            </p>

            <p>
              Medium:{" "}
              {leetcodeData?.mediumSolved || 0}
            </p>

            <p>
              Hard:{" "}
              {leetcodeData?.hardSolved || 0}
            </p>

          </div>
        </div>

        {/* Codeforces */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            ⚡ Codeforces
          </h2>

          <div className="space-y-3">
            <p>
              Rating:{" "}
              {codeforcesData?.rating || "Unrated"}
            </p>

            <p>
              Rank:{" "}
              {codeforcesData?.rank || "Unrated"}
            </p>

            <p>
              Max Rating:{" "}
              {codeforcesData?.maxRating || "N/A"}
            </p>
          </div>
        </div>

      </div>

      {/* Quick Overview */}

      <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Quick Overview 📊
        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          <div className="bg-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400">
              GitHub Repositories
            </p>

            <p className="text-3xl font-bold mt-2">
              {githubData?.public_repos || 0}
            </p>
          </div>

          <div className="bg-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400">
              LeetCode Solved
            </p>

            <p className="text-3xl font-bold mt-2">
              {leetcodeData?.solvedProblem || 0}
            </p>
          </div>

          <div className="bg-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400">
              Codeforces Rating
            </p>

            <p className="text-3xl font-bold mt-2">
              {codeforcesData?.rating || "Unrated"}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;