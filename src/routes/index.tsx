import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, ChunkyButton, Professor, SESSION_ICONS } from "@/components/game";
import { TopBar } from "@/components/TopBar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateCourse } from "@/lib/ai.functions";
import type { Course } from "@/lib/seed";
import { SESSIONS, SHORT, type Session } from "@/lib/sessions";
import { flatLevels, isUnlocked, setState, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Interrogami — Get grilled. Get good." },
      { name: "description", content: "Gamified oral-exam trainer: an Italian professor quizzes you out loud and grades you from 18 to 30 e lode." },
      { property: "og:title", content: "Interrogami — Get grilled. Get good." },
      { property: "og:description", content: "Practice oral exams out loud with a theatrical Italian professor. Aim for 30 e lode." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const s = useApp();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <SeasonBackdrop session={s.currentSession} />
      <TopBar />
      <TimelineStrip />
      <main className="relative mx-auto max-w-2xl px-4 pb-24 pt-6">
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

const ZONE_CLASS = ["zone-jan", "zone-feb", "zone-jun", "zone-jul", "zone-sep"];
const PARTICLE = ["p-snow", "p-rain", "p-petal", "p-ray", "p-leaf"];

function Particles({ zone }: { zone: number }) {
  if (zone === 3) {
    return <>{[0, 1, 2].map((i) => <span key={i} className="particle p-ray" style={{ left: `${20 + i * 30}%`, animationDelay: `${-i * 2}s` }} />)}</>;
  }
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className={cn("particle", PARTICLE[zone])}
          style={{ left: `${(i * 37) % 100}%`, animationDuration: `${(zone === 1 ? 1.4 : 7) + (i % 5)}s`, animationDelay: `${-(i * 1.7) % 9}s` }} />
      ))}
    </>
  );
}

/** Whole-map seasonal ambiance driven by the current session only; cross-fades on change. */
function SeasonBackdrop({ session }: { session: Session }) {
  const z = SESSIONS.indexOf(session);
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <AnimatePresence>
        <motion.div key={session} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
          className={cn("absolute inset-0", ZONE_CLASS[z])}>
          <Particles zone={z} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Sticky academic-year timeline: the single source of truth for the current session. */
function TimelineStrip() {
  const s = useApp();
  const cur = SESSIONS.indexOf(s.currentSession);
  const [from, setFrom] = useState<number | null>(null);
  useEffect(() => {
    const seen = sessionStorage.getItem("interrogami:seen-session");
    if (seen && seen !== s.currentSession) {
      const i = SESSIONS.indexOf(seen as Session);
      if (i >= 0 && i < cur) setFrom(i);
    }
    const t = setTimeout(() => sessionStorage.setItem("interrogami:seen-session", s.currentSession), 2600);
    return () => clearTimeout(t);
  }, [s.currentSession, cur]);
  useEffect(() => {
    if (from === null) return;
    const t = setTimeout(() => setFrom(null), 2600);
    return () => clearTimeout(t);
  }, [from]);
  return (
    <div className="sticky top-[62px] z-10 border-b-2 border-border bg-background/90 backdrop-blur">
      <div className="mx-auto max-w-2xl px-4 pb-2 pt-1">
        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Academic year</p>
        <div className="relative mt-5">
          <div className="absolute left-[10%] right-[10%] top-6 h-0.5 bg-border" aria-hidden />
          <motion.div
            key={from === null ? "still" : "sliding"}
            initial={{ left: `${((from ?? cur) + 0.5) * 20}%` }}
            animate={{ left: `${(cur + 0.5) * 20}%` }}
            transition={{ duration: 1.4, ease: "easeInOut", delay: 0.5 }}
            className="absolute -top-5 z-10"
            style={{ x: "-50%" }}
          >
            <Avatar hat={s.equipped} size={30} />
          </motion.div>
          <div className="grid grid-cols-5">
            {SESSIONS.map((name, i) => {
              const Icon = SESSION_ICONS[i]!;
              const past = i < cur;
              const current = i === cur;
              return (
                <div key={name} className="flex flex-col items-center gap-1">
                  <div className={cn("flex h-12 items-center justify-center")}>
                    <div className={cn("flex items-center justify-center rounded-full border-2",
                      current ? "h-12 w-12 border-primary bg-card text-primary-deep ring-4 ring-primary/30"
                        : past ? "h-9 w-9 border-muted bg-muted text-muted-foreground"
                        : "h-9 w-9 border-border bg-card/60 text-muted-foreground opacity-50")}>
                      {past ? <Check className="h-5 w-5" /> : <Icon className={current ? "h-6 w-6" : "h-5 w-5"} />}
                    </div>
                  </div>
                  <span className={cn("text-xs font-bold", current ? "text-foreground" : "text-muted-foreground", !current && !past && "opacity-60")}>
                    {SHORT[name]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseMap({ course }: { course: Course }) {
  const s = useApp();
  const items = course.chapters.flatMap((ch, ci) => ch.levels.map((l) => ({ l, ch, ci })));
  const currentId = items.find(({ l }) => isUnlocked(s, course, l.id) && s.results[l.id]?.grade == null)?.l.id;
  const seenChapters = new Set<string>();
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-3xl font-extrabold">{course.title}</h2>
      <div className="relative overflow-hidden rounded-3xl border-2 border-border bg-card/75 px-4 pb-6 pt-4 backdrop-blur-sm">
        <div className="relative flex flex-col items-center gap-6 pt-4">
          {items.map(({ l, ch, ci }, i) => {
            const header = !seenChapters.has(ch.id);
            seenChapters.add(ch.id);
            const offset = Math.sin(i * 1.3) * 80;
            const r = s.results[l.id];
            const unlocked = isUnlocked(s, course, l.id);
            const done = !!r && r.grade !== null;
            const failed = !!r && r.grade === null;
            const lode = !!r?.lode;
            const node = (
              <motion.div whileHover={unlocked ? { scale: 1.06 } : {}}
                className={cn("chunky relative flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-extrabold",
                  lode ? "bg-gold text-gold-foreground [--chunk:var(--gold-deep)]"
                    : done ? "bg-primary text-primary-foreground [--chunk:var(--primary-deep)]"
                    : unlocked ? "bg-card text-primary-deep border-4 border-primary [--chunk:var(--primary-deep)]"
                    : "bg-muted text-muted-foreground [--chunk:var(--border)]")}>
                {lode ? "30L" : done ? r.grade : unlocked ? <Star className="h-8 w-8 fill-current" /> : <Lock className="h-7 w-7" />}
                {failed && !done && (
                  <span className="absolute -rotate-12 rounded-md border-2 border-destructive bg-card px-1 text-[10px] font-extrabold text-destructive">BOCCIATO</span>
                )}
                {done && r.session && (
                  <span className="absolute -bottom-1 -right-2 rounded-full bg-card px-1.5 text-[10px] font-bold text-foreground shadow">{SHORT[r.session]}</span>
                )}
              </motion.div>
            );
            return (
              <div key={l.id} className="flex w-full flex-col items-center gap-3">
                {header && (
                  <div className={cn("w-full rounded-2xl px-5 py-2 font-display text-lg font-bold", ci % 2 ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground")}>
                    Chapter {ci + 1} · {ch.title}
                  </div>
                )}
                <div style={{ transform: `translateX(${offset}px)` }} className="relative flex flex-col items-center gap-1">
                  {l.id === currentId && (
                    <span className="absolute -top-6 z-10 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase text-primary-foreground">You are here</span>
                  )}
                  {unlocked ? <Link to="/quiz/$levelId" params={{ levelId: l.id }} aria-label={l.title}>{node}</Link> : node}
                  <span className="max-w-36 rounded-full bg-card/70 px-2 text-center text-sm font-bold">{l.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">{flatLevels(course).filter((l) => s.results[l.id]?.grade != null).length}/{flatLevels(course).length} levels passed</p>
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
    if (notes.trim().length < 50) { toast.error("Give me at least a paragraph of notes, per favore."); return; }
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
