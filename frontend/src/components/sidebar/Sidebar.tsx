import { Link } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaBriefcase,
  FaStickyNote,
  FaChartBar,
  FaClock,
  FaFileAlt,
} from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-zinc-900 border-r border-zinc-800 p-5">

      <h1 className="text-2xl font-bold text-white mb-10">
        Student OS 🚀
      </h1>

      <div className="flex flex-col gap-5 text-zinc-300">

        <Link to="/" className="flex items-center gap-3 hover:text-white transition">
          <FaHome />
          Dashboard
        </Link>

        <Link to="/profile" className="flex items-center gap-3 hover:text-white transition">
          <FaUser />
          Profile
        </Link>

        <Link to="/Placement" className="flex items-center gap-3 hover:text-white transition">
          <FaBriefcase />
          Placement
        </Link>

        <Link to="/notes" className="flex items-center gap-3 hover:text-white transition">
          <FaStickyNote />
          Notes
        </Link>

        <Link to="/pomodoro" className="flex items-center gap-3 hover:text-white transition">
          <FaClock />
          Pomodoro
        </Link>

        <Link to="/resume" className="flex items-center gap-3 hover:text-white transition">
          <FaFileAlt />
          Resume
        </Link>

        <Link to="/analytics" className="flex items-center gap-3 hover:text-white transition">
          <FaChartBar />
          Analytics
        </Link>

      </div>
    </div>
  );
};

export default Sidebar;