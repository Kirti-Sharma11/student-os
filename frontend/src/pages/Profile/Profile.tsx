import { useState } from "react";
import axios from "axios";

const Profile = () => {

  const [username, setUsername] = useState("");

  const [githubData, setGithubData] = useState(null);

  const fetchGithubProfile = async () => {
    try {

      const res = await axios.get(
        `https://api.github.com/users/${username}`
      );

      setGithubData(res.data);

    } catch (error) {
      alert("GitHub user not found");
    }
  };

  return (
    <div className="p-6 text-white">

      {/* Search Box */}

      <div className="flex gap-4 mb-8">

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

      {/* Profile Card */}

      {githubData && (

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center gap-6">

            <img
              src={githubData.avatar_url}
              alt="profile"
              className="w-28 h-28 rounded-full"
            />

            <div>

              <h1 className="text-3xl font-bold">
                {githubData.name}
              </h1>

              <p className="text-zinc-400 mt-2">
                @{githubData.login}
              </p>

              <p className="mt-3 text-zinc-300">
                {githubData.bio}
              </p>

              <a
                href={githubData.html_url}
                target="_blank"
                className="inline-block mt-4 text-blue-400"
              >
                Visit GitHub Profile
              </a>

            </div>

          </div>

          {/* Stats */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

            <div className="bg-zinc-800 p-5 rounded-xl">
              <h2 className="text-zinc-400">Followers</h2>
              <p className="text-3xl font-bold mt-2">
                {githubData.followers}
              </p>
            </div>

            <div className="bg-zinc-800 p-5 rounded-xl">
              <h2 className="text-zinc-400">Following</h2>
              <p className="text-3xl font-bold mt-2">
                {githubData.following}
              </p>
            </div>

            <div className="bg-zinc-800 p-5 rounded-xl">
              <h2 className="text-zinc-400">Public Repos</h2>
              <p className="text-3xl font-bold mt-2">
                {githubData.public_repos}
              </p>
            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Profile;