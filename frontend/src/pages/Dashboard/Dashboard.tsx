import StatsCard from "../../components/dashboard/StatsCard";
import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {

  const [leetcodeData, setLeetcodeData] = useState<any>(null);

  const [githubData, setGithubData] = useState<any>(null);

  const [codeforcesData, setCodeforcesData] = useState<any>(null);

  useEffect(() => {

    const fetchAllData = async () => {

      try {

        // =========================
        // USERNAMES FROM LOCAL STORAGE
        // =========================

        const githubUsername =
          localStorage.getItem("githubUsername");

        const leetcodeUsername =
          localStorage.getItem("leetcodeUsername");

        const codeforcesUsername =
          localStorage.getItem("codeforcesUsername");

        // =========================
        // LEETCODE
        // =========================

        if (leetcodeUsername) {

          const lcRes = await axios.get(
            `https://alfa-leetcode-api.onrender.com/${leetcodeUsername}`
          );

          setLeetcodeData(lcRes.data);
        }

        // =========================
        // GITHUB
        // =========================

        if (githubUsername) {

          const githubRes = await axios.get(
            `https://api.github.com/users/${githubUsername}`
          );

          setGithubData(githubRes.data);
        }

        // =========================
        // CODEFORCES
        // =========================

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

    <div className="p-6 text-white">

      <h1 className="text-4xl font-bold mb-8">
        Welcome Back 👋
      </h1>

      {/* ========================= */}
      {/* TOP STATS */}
      {/* ========================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <StatsCard
          title="GitHub Repos"
          value={githubData?.public_repos || 0}
        />

        <StatsCard
          title="LeetCode Solved"
          value={
            leetcodeData?.submitStats?.acSubmissionNum[0]?.count || 0
          }
        />

        <StatsCard
          title="Codeforces Rating"
          value={codeforcesData?.rating || "Unrated"}
        />

        <StatsCard
          title="Codeforces Rank"
          value={codeforcesData?.rank || "Unrated"}
        />

      </div>

      {/* ========================= */}
      {/* RECENT ACTIVITY */}
      {/* ========================= */}

      <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Recent Activity 🚀
        </h2>

        <div className="space-y-4">

          <div className="bg-zinc-800 p-4 rounded-xl">
            Solved LeetCode Problems
          </div>

          <div className="bg-zinc-800 p-4 rounded-xl">
            GitHub Profile Updated
          </div>

          <div className="bg-zinc-800 p-4 rounded-xl">
            Participated in Codeforces Contest
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;