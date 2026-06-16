import { useEffect, useState } from "react";
import API from "../../services/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts";

const Analytics = () => {
  const [overview, setOverview] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);

  useEffect(() => {
    API.get("/analytics/overview")
      .then((res) => setOverview(res.data))
      .catch(console.error);

    API.get("/analytics/ats-trend")
      .then((res) => setTrend(res.data))
      .catch(console.error);

    API.get("/analytics/skills")
      .then((res) => setSkills(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#06070b] p-6 text-white">
      <h1 className="mb-8 text-3xl font-bold">
        Analytics Dashboard
      </h1>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-zinc-900 p-6">
          <h3 className="text-zinc-400">Total Resumes</h3>
          <p className="mt-2 text-3xl font-bold">
            {overview?.totalResumes || 0}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-6">
          <h3 className="text-zinc-400">Average ATS</h3>
          <p className="mt-2 text-3xl font-bold">
            {Math.round(overview?.averageATS || 0)}%
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-6">
          <h3 className="text-zinc-400">Highest ATS</h3>
          <p className="mt-2 text-3xl font-bold">
            {overview?.highestATS || 0}%
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-6">
  <h3 className="text-zinc-400">
    Most Common Skill
  </h3>

  <p className="mt-2 text-3xl font-bold">
    {overview?.mostCommonSkill}
  </p>
</div>
      </div>

      {/* ATS Trend */}
      <div className="mb-8 rounded-xl bg-zinc-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">
          ATS Score Trend
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trend}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="atsScore"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

     <div className="rounded-xl bg-zinc-900 p-6">
  <h2 className="mb-4 text-xl font-semibold">
    Top Skills
  </h2>

  <ResponsiveContainer
    width="100%"
    height={350}
  >
    <BarChart data={skills}>
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="_id" />

      <YAxis />

      <Tooltip />

      <Bar
        dataKey="count"
        fill="#3b82f6"
      />
    </BarChart>
  </ResponsiveContainer>
</div>
</div>
  );
}

export default Analytics;