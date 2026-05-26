import { useEffect, useState } from "react";

type PlacementStatus = "applied" | "oa" | "interview" | "rejected" | "offer";

type PlacementColumns = Record<PlacementStatus, string[]>;

const statusLabels: Record<PlacementStatus, string> = {
  applied: "Applied",
  oa: "OA",
  interview: "Interview",
  rejected: "Rejected",
  offer: "Offer",
};

const defaultPlacements: PlacementColumns = {
  applied: [],
  oa: [],
  interview: [],
  rejected: [],
  offer: [],
};

const PLACEMENT_STORAGE_KEY = "placementData";

const Placement = () => {
  const [companyName, setCompanyName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<PlacementStatus>("applied");
  const [placements, setPlacements] = useState<PlacementColumns>(() => {
    if (typeof window === "undefined") return defaultPlacements;
    try {
      const saved = window.localStorage.getItem(PLACEMENT_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as PlacementColumns) : defaultPlacements;
    } catch {
      return defaultPlacements;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify(placements));
  }, [placements]);

  const addCompany = () => {
    const trimmedName = companyName.trim();
    if (!trimmedName) return;

    setPlacements((prev) => ({
      ...prev,
      [selectedStatus]: [...prev[selectedStatus], trimmedName],
    }));
    setCompanyName("");
  };

  const ColumnCard = ({
    title,
    companies,
  }: {
    title: string;
    companies: string[];
  }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg shadow-black/20 min-h-[420px]">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
          {companies.length}
        </span>
      </div>

      <div className="space-y-4">
        {companies.length > 0 ? (
          companies.map((company) => (
            <div
              key={`${title}-${company}`}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 transition hover:border-yellow-400 hover:bg-zinc-900"
            >
              {company}
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-400">No companies yet.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Placement Tracker</h1>
              <p className="mt-2 max-w-2xl text-zinc-400">
                Track company status through applied, OA, interview, rejected, and offer stages.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-[1.8fr_1fr_0.8fr]">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-300">Company</span>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-300">Status</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as PlacementStatus)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key} className="bg-zinc-950 text-white">
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={addCompany}
                className="rounded-2xl bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:bg-yellow-300"
              >
                Add Company
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-5 lg:grid-cols-2">
          {Object.entries(statusLabels).map(([key, label]) => (
            <ColumnCard key={key} title={label} companies={placements[key as PlacementStatus]} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Placement;
