import { useRef, useState } from "react";
import API from "../../services/api";

type Analysis = {
   documentId?: string;
  atsScore?: number | null;
  strengths?: string[];
  weaknesses?: string[];
  missingSkills?: string[];
  resumeSummary?: string;
  recommendedTechnologies?: string[];
  suggestedProjects?: string[];
  improvementSuggestions?: string[];
  suggestedKeywords?: string[];
};

const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleFile = (f: File) => {
    const allowed = /(pdf|docx|doc)$/i;
    if (!allowed.test(f.name)) {
      setError("Only PDF or DOCX files are allowed");
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleAnalyze = async () => {
    
    if (!file) return setError("Please upload a resume first");
    setLoading(true);
    setAnalysis(null);
    setUploadProgress(0);
    try {
      const form = new FormData();
      form.append("resume", file);

      const res = await API.post("/resume/analyze", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });
     

      const raw = res.data?.analysis || res.data;

      const normalized: Analysis = {
        documentId: raw?.documentId ?? raw?.document_id ?? null,
        atsScore: raw?.atsScore ?? raw?.ats_score ?? null,
        strengths: raw?.strengths ?? raw?.strengths ?? [],
        weaknesses: raw?.weaknesses ?? [],
        missingSkills: raw?.missingSkills ?? raw?.missing_skills ?? [],
        resumeSummary: raw?.resumeSummary ?? raw?.resume_summary ?? "",
        recommendedTechnologies: raw?.recommendedTechnologies ?? raw?.recommended_technologies ?? [],
        suggestedProjects: raw?.suggestedProjects ?? raw?.suggested_projects ?? [],
        improvementSuggestions: raw?.improvementSuggestions ?? raw?.improvement_suggestions ?? [],
        suggestedKeywords: raw?.suggestedKeywords ?? raw?.suggested_keywords ?? [],
      };

      setAnalysis(normalized);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };
  
const downloadPDF = async () => {
  if (!analysis) return;

  try {
    const response = await API.get(
  `/resume/download/${analysis.documentId}`,
  {
    responseType: "blob",
  }
);

    const url = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = "Resume-Analysis.pdf";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF Download Failed", error);
  }
};



  return (
    <div className="min-h-screen bg-[#06070b] p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl border border-white/6 bg-white/2 p-6 backdrop-blur-md">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-pink-300 to-yellow-300">
            Resume Analyzer
          </h1>
          <p className="mt-2 text-zinc-300">Upload your resume and get an AI-powered ATS-style analysis.</p>
        </header>

        <section>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="mb-6 rounded-2xl border border-dashed border-white/10 bg-zinc-900/60 p-6 text-center transition hover:scale-[1.01]"
          >
            <input ref={inputRef} type="file" className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="text-xl font-semibold">Drag & drop your resume here</div>
              <div className="text-sm text-zinc-400">PDF or DOCX — max 10MB</div>
              <div className="mt-4 flex gap-3">
                <button onClick={() => inputRef.current?.click()} className="rounded-full bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500">Browse</button>
                <button onClick={handleAnalyze} disabled={!file || loading} className="rounded-full bg-amber-400 px-4 py-2 font-medium text-black disabled:opacity-60">
                  Analyze Resume
                </button>
              </div>
              {file && <div className="mt-3 text-sm text-zinc-300">Selected: {file.name}</div>}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4 w-full rounded-full bg-zinc-800/60">
                  <div className="h-2 rounded-full bg-gradient-to-r from-rose-400 to-amber-400" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          </div>

          {error && <div className="mb-4 rounded-md bg-red-600/20 p-3 text-red-200">{error}</div>}

          {loading && (
            <div className="mb-6 animate-pulse rounded-lg bg-zinc-900/50 p-6">Analyzing... please wait</div>
          )}
          {analysis && (
  <div className="mb-6 flex justify-end">
  
    <button
      onClick={downloadPDF}
      className="rounded-full bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-500"
    >
      Download PDF Report
    </button>
  </div>
)}
          {analysis && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/6 bg-gradient-to-br from-white/3 to-transparent p-6">
                <h3 className="text-sm text-zinc-300">ATS Score</h3>
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative">
                    <svg width={120} height={120} viewBox="0 0 36 36">
                      <path d="M18 2a16 16 0 1 0 0 32 16 16 0 1 0 0-32" fill="#0f172a" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#111827" strokeWidth="3" />
                      <path
                        strokeWidth="3"
                        stroke="#fb923c"
                        fill="none"
                        strokeDasharray={`${Math.round(((analysis.atsScore ?? 0) / 100) * 100)} 100`}
                        d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{analysis.atsScore ?? "N/A"}</div>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300">Estimated ATS match</p>
                    <p className="mt-1 text-lg font-semibold">{analysis.atsScore ?? "--"}%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/6 bg-slate-950/60 p-6 md:col-span-2 lg:col-span-1">
                <h3 className="text-sm text-zinc-300">Summary</h3>
                <p className="mt-3 text-zinc-300">{analysis.resumeSummary || "No summary provided."}</p>
              </div>

              <div className="rounded-2xl border border-white/6 bg-slate-950/60 p-6">
                <h3 className="text-sm text-zinc-300">Detected Skills</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(analysis.recommendedTechnologies ?? []).map((s, i) => (
                    <span key={i} className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-200">{s}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/6 bg-slate-950/60 p-6">
                <h3 className="text-sm text-zinc-300">Missing Skills</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(analysis.missingSkills ?? []).map((s, i) => (
                    <span key={i} className="rounded-full bg-red-700/20 px-3 py-1 text-sm text-red-200">{s}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/6 bg-slate-950/60 p-6">
                <h3 className="text-sm text-zinc-300">Strengths</h3>
                <ul className="mt-3 list-disc pl-5 text-zinc-300">
                  {(analysis.strengths ?? []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/6 bg-slate-950/60 p-6">
                <h3 className="text-sm text-zinc-300">Weaknesses</h3>
                <ul className="mt-3 list-disc pl-5 text-zinc-300">
                  {(analysis.weaknesses ?? []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/6 bg-slate-950/60 p-6 md:col-span-2 lg:col-span-3">
                <h3 className="text-sm text-zinc-300">Improvement Suggestions</h3>
                <ul className="mt-3 list-disc pl-5 text-zinc-300">
                  {(analysis.improvementSuggestions ?? []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/6 bg-slate-950/60 p-6 md:col-span-2">
                <h3 className="text-sm text-zinc-300">Recommended Projects</h3>
                <ul className="mt-3 list-disc pl-5 text-zinc-300">
                  {(analysis.suggestedProjects ?? []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/6 bg-slate-950/60 p-6 md:col-span-2">
                <h3 className="text-sm text-zinc-300">Suggested Keywords</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(analysis.suggestedKeywords ?? []).map((k, i) => (
                    <span key={i} className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-200">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
