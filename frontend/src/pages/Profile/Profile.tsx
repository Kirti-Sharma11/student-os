const Profile = () => {
  return (
    <div className="p-6 text-white">

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

        <div className="flex items-center gap-6">

          <img
            src="https://i.pravatar.cc/150"
            alt="profile"
            className="w-28 h-28 rounded-full border-4 border-zinc-700"
          />

          <div>

            <h1 className="text-3xl font-bold">
              Kirti Sharma
            </h1>

            <p className="text-zinc-400 mt-2">
              Full Stack Developer • MERN • DSA
            </p>

            <div className="flex gap-3 mt-4">

              <span className="bg-zinc-800 px-3 py-1 rounded-full text-sm">
                React
              </span>

              <span className="bg-zinc-800 px-3 py-1 rounded-full text-sm">
                Node.js
              </span>

              <span className="bg-zinc-800 px-3 py-1 rounded-full text-sm">
                MongoDB
              </span>

              <span className="bg-zinc-800 px-3 py-1 rounded-full text-sm">
                DSA
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* Stats Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h2 className="text-zinc-400">LeetCode Problems</h2>
          <p className="text-4xl font-bold mt-3">350</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h2 className="text-zinc-400">GitHub Repos</h2>
          <p className="text-4xl font-bold mt-3">24</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h2 className="text-zinc-400">Coding Streak</h2>
          <p className="text-4xl font-bold mt-3">42 🔥</p>
        </div>

      </div>

    </div>
  );
};

export default Profile;