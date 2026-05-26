import { useState } from "react";
import axios from "axios";

const Profile = () => {

  // =========================
  // STATES
  // =========================

  const [username, setUsername] = useState("");
  const [githubData, setGithubData] = useState<any>(null);

  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [leetcodeData, setLeetcodeData] = useState<any>(null);

  const [codeforcesUsername, setCodeforcesUsername] = useState("");
  const [codeforcesData, setCodeforcesData] = useState<any>(null);

  const [codolioUsername, setCodolioUsername] = useState("");

  // =========================
  // GITHUB API
  // =========================

  const fetchGithubProfile = async () => {

    try {

      const res = await axios.get(
        `https://api.github.com/users/${username}`
      );

      setGithubData(res.data);

      // SAVE USERNAME
      localStorage.setItem("githubUsername", username);

    } catch (error) {

      console.log(error);

      alert("GitHub user not found");
    }
  };

  // =========================
  // LEETCODE API
  // =========================

  const fetchLeetcodeStats = async () => {

    try {

      const res = await axios.get(
        `https://alfa-leetcode-api.onrender.com/${leetcodeUsername}`
      );

      console.log("LEETCODE DATA:", res.data);

      setLeetcodeData(res.data);

      // SAVE USERNAME
      localStorage.setItem("leetcodeUsername", leetcodeUsername);

    } catch (error) {

      console.log(error);

      alert("Failed to fetch LeetCode profile");
    }
  };

  // =========================
  // CODEFORCES API
  // =========================

  const fetchCodeforcesProfile = async () => {

    try {

      const res = await axios.get(
        `https://codeforces.com/api/user.info?handles=${codeforcesUsername}`
      );

      const user = res.data.result[0];

      setCodeforcesData(user);

      console.log("CODEFORCES DATA:", user);

      // SAVE USERNAME
      localStorage.setItem("codeforcesUsername", codeforcesUsername);

    } catch (error) {

      console.log(error);

      alert("Codeforces user not found");
    }
  };

  // =========================
  // UI
  // =========================

  return (

    <div className="p-6 text-white">

      {/* ========================= */}
      {/* GITHUB SEARCH */}
      {/* ========================= */}

      <div className="flex gap-4 mb-6">

        <input
          type="text"
          placeholder="Enter GitHub Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-xl w-full outline-none"
        />

        <button
          onClick={fetchGithubProfile}
          className="bg-white text-black px-6 rounded-xl font-semibold"
        >
          Search
        </button>

      </div>

      {/* ========================= */}
      {/* LEETCODE SEARCH */}
      {/* ========================= */}

      <div className="flex gap-4 mb-6">

        <input
          type="text"
          placeholder="Enter LeetCode Username"
          value={leetcodeUsername}
          onChange={(e) => setLeetcodeUsername(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-xl w-full outline-none"
        />

        <button
          onClick={fetchLeetcodeStats}
          className="bg-yellow-400 text-black px-6 rounded-xl font-semibold"
        >
          Fetch LC
        </button>

      </div>

      {/* ========================= */}
      {/* CODEFORCES SEARCH */}
      {/* ========================= */}

      <div className="flex gap-4 mb-6">

        <input
          type="text"
          placeholder="Enter Codeforces Username"
          value={codeforcesUsername}
          onChange={(e) => setCodeforcesUsername(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-xl w-full outline-none"
        />

        <button
          onClick={fetchCodeforcesProfile}
          className="bg-blue-500 text-white px-6 rounded-xl font-semibold"
        >
          Fetch CF
        </button>

      </div>

      {/* ========================= */}
      {/* CODOLIO SEARCH */}
      {/* ========================= */}

      <div className="flex gap-4 mb-10">

        <input
          type="text"
          placeholder="Enter Codolio Username"
          value={codolioUsername}
          onChange={(e) => setCodolioUsername(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-xl w-full outline-none"
        />

        <a
          href={`https://codolio.com/profile/${codolioUsername}`}
          target="_blank"
          rel="noreferrer"
          className="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Open Codolio
        </a>

      </div>

      {/* ========================= */}
      {/* GITHUB CARD */}
      {/* ========================= */}

      {githubData && (

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-10">

          <div className="flex items-center gap-6">

            <img
              src={githubData.avatar_url}
              alt="github"
              className="w-28 h-28 rounded-full"
            />

            <div>

              <h1 className="text-3xl font-bold">
                {githubData.name}
              </h1>

              <p className="text-zinc-400 mt-1">
                @{githubData.login}
              </p>

              <p className="text-zinc-300 mt-2">
                {githubData.bio}
              </p>

              <a
                href={githubData.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 inline-block mt-3"
              >
                Visit GitHub Profile
              </a>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

            <div className="bg-zinc-800 p-5 rounded-xl">

              <h2 className="text-zinc-400">
                Followers
              </h2>

              <p className="text-3xl font-bold mt-2">
                {githubData.followers}
              </p>

            </div>

            <div className="bg-zinc-800 p-5 rounded-xl">

              <h2 className="text-zinc-400">
                Following
              </h2>

              <p className="text-3xl font-bold mt-2">
                {githubData.following}
              </p>

            </div>

            <div className="bg-zinc-800 p-5 rounded-xl">

              <h2 className="text-zinc-400">
                Public Repos
              </h2>

              <p className="text-3xl font-bold mt-2">
                {githubData.public_repos}
              </p>

            </div>

          </div>

        </div>

      )}

      {/* ========================= */}
      {/* LEETCODE CARD */}
      {/* ========================= */}

      {leetcodeData && (

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-10">

          <div className="flex items-center gap-6">

            <img
              src={leetcodeData.avatar}
              alt="leetcode"
              className="w-28 h-28 rounded-full border border-yellow-400"
            />

            <div>

              <h1 className="text-3xl font-bold">
                {leetcodeData.username}
              </h1>

              <p className="text-yellow-400 mt-1">
                LeetCode Profile
              </p>

              <a
                href={`https://leetcode.com/${leetcodeData.username}/`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold"
              >
                View LeetCode
              </a>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">

            <div className="bg-zinc-800 p-5 rounded-xl">

              <h2 className="text-zinc-400">
                Total Solved
              </h2>

              <p className="text-3xl font-bold mt-2">
                {leetcodeData?.submitStats?.acSubmissionNum[0]?.count || 0}
              </p>

            </div>

            <div className="bg-zinc-800 p-5 rounded-xl">

              <h2 className="text-zinc-400">
                Easy
              </h2>

              <p className="text-3xl font-bold mt-2">
                {leetcodeData?.submitStats?.acSubmissionNum[1]?.count || 0}
              </p>

            </div>

            <div className="bg-zinc-800 p-5 rounded-xl">

              <h2 className="text-zinc-400">
                Medium
              </h2>

              <p className="text-3xl font-bold mt-2">
                {leetcodeData?.submitStats?.acSubmissionNum[2]?.count || 0}
              </p>

            </div>

            <div className="bg-zinc-800 p-5 rounded-xl">

              <h2 className="text-zinc-400">
                Hard
              </h2>

              <p className="text-3xl font-bold mt-2">
                {leetcodeData?.submitStats?.acSubmissionNum[3]?.count || 0}
              </p>

            </div>

          </div>

          <div className="bg-zinc-800 p-5 rounded-xl mt-6">

            <h2 className="text-zinc-400">
              Ranking
            </h2>

            <p className="text-3xl font-bold mt-2">
              {leetcodeData.ranking}
            </p>

          </div>

        </div>

      )}

      {/* ========================= */}
      {/* CODEFORCES CARD */}
      {/* ========================= */}

      {codeforcesData && (

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-10">

          <div className="flex items-center gap-6">

            <img
              src={codeforcesData.titlePhoto}
              alt="codeforces"
              className="w-28 h-28 rounded-full border border-blue-500"
            />

            <div>

              <h1 className="text-3xl font-bold">
                {codeforcesData.handle}
              </h1>

              <p className="text-blue-400 mt-1 capitalize">
                {codeforcesData.rank}
              </p>

              <a
                href={`https://codeforces.com/profile/${codeforcesData.handle}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold"
              >
                View Codeforces
              </a>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

            <div className="bg-zinc-800 p-5 rounded-xl">

              <h2 className="text-zinc-400">
                Rating
              </h2>

              <p className="text-3xl font-bold mt-2">
                {codeforcesData.rating || "Unrated"}
              </p>

            </div>

            <div className="bg-zinc-800 p-5 rounded-xl">

              <h2 className="text-zinc-400">
                Max Rating
              </h2>

              <p className="text-3xl font-bold mt-2">
                {codeforcesData.maxRating || "N/A"}
              </p>

            </div>

            <div className="bg-zinc-800 p-5 rounded-xl">

              <h2 className="text-zinc-400">
                Max Rank
              </h2>

              <p className="text-2xl font-bold mt-2 capitalize">
                {codeforcesData.maxRank || "N/A"}
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Profile;