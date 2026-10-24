import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Lock, Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ChunkyButton, Professor } from "@/components/game";
import { TopBar } from "@/components/TopBar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateCourse } from "@/lib/ai.functions";
import type { Course } from "@/lib/seed";
import { flatLevels, isUnlocked, setState, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Interrogami — Get grilled. Get good." },
      { name: "description", content: "Gamified oral-exam trainer: an Italian professor quizzes you out loud and grades you from 18 to 30 e lode." },
      { property: "og:title", content: "Interrogami — Get grilled. Get good." },
      { property: "og:description", content: "Practice oral exams out loud with a theatrical Italian professor. Aim for 30 e lode." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const s = useApp();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">
        <div className="mb-6 flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4">
          <Professor mood="neutral" size={84} />
          <div>
            <p className="font-display text-xl font-bold">Allora, student.</p>
            <p className="text-muted-foreground">Pick a level. I will grill you out loud. Get grilled. Get good.</p>
          </div>
        </div>
        {s.courses.map((c) => <CourseMap key={c.id} course={c} />)}
        <div className="mt-10 flex justify-center">
          <ChunkyButton tone="accent" onClick={() => setOpen(true)}><Plus className="h-5 w-5" />Add subject</ChunkyButton>
        </div>
      </main>
      <AddSubject open={open} onOpenChange={setOpen} />
    </div>
  );
}

function CourseMap({ course }: { course: Course }) {
  const s = useApp();
  let idx = 0;
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-3xl font-extrabold">{course.title}</h2>
      {course.chapters.map((ch, ci) => (
        <div key={ch.id} className="mb-8">
          <div className={cn("mb-4 rounded-2xl px-5 py-3 font-display text-lg font-bold", ci % 2 ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground")}>
            Chapter {ci + 1} · {ch.title}
          </div>
          <div className="relative flex flex-col items-center gap-6 py-2">
            {ch.levels.map((l) => {
              const offset = Math.sin(idx++ * 1.3) * 90;
              const r = s.results[l.id];
              const unlocked = isUnlocked(s, course, l.id);
              const done = !!r && r.grade !== null;
              const lode = !!r?.lode;
              const node = (
                <motion.div
                  whileHover={unlocked ? { scale: 1.06 } : undefined}
                  className={cn(
                    "chunky flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-extrabold",
                    lode ? "bg-gold text-gold-foreground [--chunk:var(--gold-deep)]"
                      : done ? "bg-primary text-primary-foreground [--chunk:var(--primary-deep)]"
                      : unlocked ? "bg-card text-primary-deep border-4 border-primary [--chunk:var(--primary-deep)]"
                      : "bg-muted text-muted-foreground [--chunk:var(--border)]",
                  )}
                >
                  {lode ? "30L" : done ? r.grade : unlocked ? (r ? <Check className="h-8 w-8 opacity-30" /> : <Star className="h-8 w-8 fill-current" />) : <Lock className="h-7 w-7" />}
                </motion.div>
              );
              return (
                <div key={l.id} style={{ transform: `translateX(${offset}px)` }} className="flex flex-col items-center gap-1">
                  {unlocked ? <Link to="/quiz/$levelId" params={{ levelId: l.id }} aria-label={l.title}>{node}</Link> : node}
                  <span className="max-w-36 text-center text-sm font-bold text-muted-foreground">{l.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-center text-xs text-muted-foreground">{flatLevels(course).filter((l) => s.results[l.id]?.grade).length}/{flatLevels(course).length} levels passed</p>
    </section>
  );
}

async function readFile(f: File): Promise<string> {
  if (f.name.toLowerCase().endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    const doc = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
    let out = "";
    for (let i = 1; i <= Math.min(doc.numPages, 60); i++) {
      const p = await doc.getPage(i);
      const t = await p.getTextContent();
      out += t.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
    }
    return out;
  }
  return f.text();
}

function AddSubject({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (notes.trim().length < 50) return toast.error("Give me at least a paragraph of notes, per favore.");
    setBusy(true);
    try {
      const course = await generateCourse({ data: { notes: notes.slice(0, 60000) } });
      setState((s) => ({ ...s, courses: [...s.courses, course] }));
      toast.success(`"${course.title}" is ready. Allora, study!`);
      setNotes("");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not build the course.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader><DialogTitle className="font-display text-2xl">Add a subject</DialogTitle></DialogHeader>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your study notes here..."
          className="h-56 w-full rounded-2xl border-2 border-input bg-background p-4 outline-none focus:border-primary"
        />
        <label className="cursor-pointer text-sm font-bold text-primary-deep underline">
          or upload a .txt, .md or .pdf
          <input
            type="file"
            accept=".txt,.md,.pdf"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try { setNotes(await readFile(f)); } catch { toast.error("Could not read that file."); }
            }}
          />
        </label>
        <ChunkyButton onClick={submit} disabled={busy}>{busy ? "The Professor is reading..." : "Build my course"}</ChunkyButton>
      </DialogContent>
    </Dialog>
  );
}
