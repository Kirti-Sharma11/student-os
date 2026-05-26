import { useEffect, useMemo, useState } from "react";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const NOTES_STORAGE_KEY = "student_os_notes";

const getColorClass = (index: number) => {
  const colors = [
    "from-sky-500/20 via-blue-500/10 to-cyan-500/10",
    "from-violet-500/20 via-fuchsia-500/10 to-pink-500/10",
    "from-emerald-500/20 via-lime-500/10 to-amber-500/10",
    "from-orange-500/20 via-amber-400/10 to-red-500/10",
    "from-teal-500/20 via-cyan-500/10 to-sky-500/10",
  ];
  return colors[index % colors.length];
};

const Notes = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(NOTES_STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch {
        setNotes([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes;
    const query = search.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );
  }, [notes, search]);

  const handleAddNote = () => {
    if (!title.trim() || !content.trim()) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setTitle("");
    setContent("");
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  const charCount = content.length;
  const remainingChars = Math.max(0, 300 - charCount);

  return (
    <div className="min-h-screen bg-[#05080f] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(14,23,42,0.75)] backdrop-blur-xl">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-cyan-300/80">Productivity</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-sky-300 via-violet-300 to-fuchsia-300 bg-clip-text">
            Notes Manager 📝
          </h1>
          <p className="max-w-2xl text-zinc-300">
            Capture your ideas, reminders, and study notes in a polished dark workspace. Add a note and it will stay saved automatically.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_auto]">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/40 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20">
            <label className="mb-2 block text-sm font-medium text-zinc-300">Note Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a short, meaningful title"
              className="w-full rounded-3xl border border-zinc-800/80 bg-zinc-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
            />

            <label className="mt-5 mb-2 block text-sm font-medium text-zinc-300">Note Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write what you want to remember..."
              rows={6}
              className="min-h-[180px] w-full rounded-3xl border border-zinc-800/80 bg-zinc-950/90 px-4 py-3 text-white outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-zinc-400">
                <span className="font-medium text-zinc-100">{charCount}</span> / 300 characters
              </div>
              <button
                type="button"
                onClick={handleAddNote}
                className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 transition duration-200 hover:scale-[1.01] hover:brightness-110"
              >
                Add Note
              </button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/40">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Search Notes</p>
                <h2 className="text-xl font-semibold text-white">Quick find</h2>
              </div>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or content"
              className="w-full rounded-3xl border border-zinc-800/80 bg-zinc-950/90 px-4 py-3 text-white outline-none transition focus:border-violet-400/70 focus:ring-2 focus:ring-violet-400/20"
            />

            <div className="mt-6 rounded-3xl bg-gradient-to-br from-white/5 to-transparent p-5 text-sm text-zinc-400 ring-1 ring-white/5">
              <p className="font-medium text-white">Notes saved locally</p>
              <p className="mt-2 text-zinc-400">All notes are stored in your browser using the <span className="font-semibold text-cyan-300">student_os_notes</span> key.</p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Your notes</p>
              <h2 className="text-3xl font-semibold text-white">Saved Cards</h2>
            </div>
            <p className="text-sm text-zinc-400">{filteredNotes.length} notes found</p>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-950/70 p-12 text-center text-zinc-400 shadow-inner shadow-slate-950/20">
              <p className="mb-3 text-lg font-semibold text-white">No notes yet</p>
              <p>Add your first note to save ideas, tasks, or study reminders.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredNotes.map((note, index) => (
                <article
                  key={note.id}
                  className={`group overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${getColorClass(index)} p-5 shadow-xl shadow-slate-950/40 transition duration-300 hover:-translate-y-1 hover:shadow-2xl`}
                >
                  <div className="rounded-[1.75rem] bg-slate-950/90 p-5 backdrop-blur-sm">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{note.title}</h3>
                        <p className="mt-1 text-sm text-zinc-400">{new Date(note.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 transition hover:bg-red-500/20 hover:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-7 text-zinc-300">{note.content}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Notes;
