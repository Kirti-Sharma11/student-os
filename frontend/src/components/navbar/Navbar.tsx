const Navbar = () => {

  const handleLogout = () => {
    localStorage.removeItem("token");

    window.location.href = "/login";
  };

  return (
    <div className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6">

      <h2 className="text-white text-xl font-semibold">
        Dashboard
      </h2>

      <div className="flex items-center gap-4">

        <div className="text-zinc-300">
          Kirti 👋
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>

      </div>
    </div>
  );
};

export default Navbar;