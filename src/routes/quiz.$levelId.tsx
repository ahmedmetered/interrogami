import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Square, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, ChunkyButton, Hat, moodFor, Professor, type Mood } from "@/components/game";
import { gradeAnswer, type GradeResult } from "@/lib/ai.functions";
import { HATS, levelOutcome, scoreToGrade, shouldFollowup, type HatId, type LevelOutcome } from "@/lib/grading";
import { INTRO_LINES, LODE_LINES, PASS_LINES, markUsed, pick, usedList } from "@/lib/quips";
import { SESSION_QUIPS } from "@/lib/sessions";
import { findLevel, nextLevelId, recordLevel, useApp } from "@/lib/store";
import { setMuted, speak, useSpeechRecognition } from "@/lib/voice";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quiz/$levelId")({
  head: () => ({
    meta: [
      { title: "The Oral — Interrogami" },
      { name: "description", content: "Answer the Professor out loud and get your Italian exam grade." },
      { property: "og:title", content: "The Oral — Interrogami" },
      { property: "og:description", content: "Answer the Professor out loud and get your Italian exam grade." },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const { levelId } = Route.useParams();
  return <Quiz key={levelId} />;
}

type Feedback = GradeResult & { followupNext: string | null };

function Quiz() {
  const { levelId } = Route.useParams();
  const s = useApp();
  const found = findLevel(s, levelId);
  const [qi, setQi] = useState(0);
  const [followupQ, setFollowupQ] = useState<string | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [anyFollowup, setAnyFollowup] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [grading, setGrading] = useState(false);
  const [typed, setTyped] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mute, setMute] = useState(false);
  const [done, setDone] = useState<{ out: LevelOutcome; hats: HatId[]; line: string; flex: boolean } | null>(null);
  const intro = useRef(pick(INTRO_LINES));

  const onFail = useCallback(() => setTyping(true), []);
  const stt = useSpeechRecognition(onFail);

  const level = found?.level;
  const question = followupQ ? `Dig deeper: ${followupQ}` : level?.questions[qi]?.q ?? "";

  useEffect(() => {
    if (!level || feedback || done) return;
    const t = setTimeout(() => speak(qi === 0 && !followupQ ? `${intro.current} ${question}` : question), 300);
    return () => clearTimeout(t);
  }, [question, feedback, done, level, qi, followupQ]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!found || !level) {
    return <div className="p-10 text-center">Level not found. <Link to="/" className="text-primary-deep underline">Back to map</Link></div>;
  }

  async function submit(answer: string) {
    if (!level || !answer.trim()) return;
    setGrading(true);
    setError(null);
    try {
      const q = level.questions[qi];
      if (!q) return;
      const r = await gradeAnswer({ data: { question: followupQ ?? q.q, expectedPoints: q.expectedPoints, answer, isFollowup: !!followupQ, usedQuips: usedList() } });
      markUsed(r.quip);
      const fu = !followupQ && shouldFollowup(r.score, answer, r.askFollowup)
        ? r.followup ?? `Tell me more. What else matters about this?`
        : null;
      setFeedback({ ...r, followupNext: fu });
      const g = scoreToGrade(r.score);
      speak(`${r.quip} ${g === null ? "Non superato." : `${g}.`}${fu ? " But wait." : ""}`);
      if (g !== null && g >= 27) confetti({ particleCount: 60, spread: 60, origin: { y: 0.4 } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "The Professor fell asleep. Try again.");
    } finally {
      setGrading(false);
    }
  }

  function next() {
    if (!feedback || !level) return;
    stt.setTranscript("");
    setTyped("");
    if (feedback.followupNext) {
      setAnyFollowup(true);
      setFollowupQ(feedback.followupNext);
      setFeedback(null);
      return;
    }
    const newScores = [...scores, feedback.score];
    setScores(newScores);
    setFollowupQ(null);
    setFeedback(null);
    if (qi + 1 < level.questions.length) {
      setQi(qi + 1);
    } else {
      const out = levelOutcome(newScores, anyFollowup || !!followupQ);
      const { newHats: hats, flex, session } = recordLevel(levelId, out.grade, out.lode, out.xp);
      const line = flex
        ? "An entire degree, in January. I'm telling everyone."
        : pick(out.lode ? LODE_LINES : out.passed ? PASS_LINES : SESSION_QUIPS[session]);
      setDone({ out, hats, line, flex });
      if (flex) setTimeout(() => confetti({ particleCount: 200, spread: 120, origin: { y: 0.3 }, colors: ["#FFD700", "#58CC02", "#FF6B6B"] }), 900);
      speak(`${line} ${out.lode ? "" : out.grade === null ? "Bocciato." : `${out.grade} out of 30.`}`);
      if (out.lode) {
        const end = Date.now() + 2500;
        (function storm() {
          confetti({ particleCount: 12, angle: 60, spread: 70, origin: { x: 0 }, colors: ["#FFD700", "#FFC300", "#F5B700"] });
          confetti({ particleCount: 12, angle: 120, spread: 70, origin: { x: 1 }, colors: ["#FFD700", "#FFC300", "#F5B700"] });
          if (Date.now() < end) requestAnimationFrame(storm);
        })();
      } else if (out.passed) confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
    }
  }

  if (done) return <Results levelId={levelId} {...done} />;

  const mood: Mood = grading ? "thinking" : feedback ? moodFor(scoreToGrade(feedback.score)) : "neutral";
  const answer = typing ? typed : stt.transcript;
  const qGrade = feedback ? scoreToGrade(feedback.score) : undefined;

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-4">
      <div className="flex items-center justify-between">
        <Link to="/" aria-label="Quit" className="text-muted-foreground"><X className="h-7 w-7" /></Link>
        <div className="flex gap-2">
          {level.questions.map((_, i) => (
            <span key={i} className={cn("h-4 w-4 rounded-full", i < qi || (i === qi && feedback && !feedback.followupNext) ? "bg-primary" : i === qi ? "bg-accent" : "bg-muted")} />
          ))}
        </div>
        <button aria-label="Toggle voice" onClick={() => { setMuted(!mute); setMute(!mute); }} className="text-muted-foreground">
          {mute ? <VolumeX className="h-7 w-7" /> : <Volume2 className="h-7 w-7" />}
        </button>
      </div>
      <p className="mt-2 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">{level.title}</p>

      <div className="mt-4 flex flex-col items-center">
        <Professor mood={mood} size={170} />
        <motion.div key={question} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative mt-3 w-full rounded-2xl border-2 border-border bg-card p-5 text-lg font-semibold">
          <span className="absolute -top-3 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-border bg-card" />
          {question}
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {feedback ? (
          <motion.div key="fb" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3 rounded-2xl border-2 border-border bg-card p-5">
            <motion.div initial={{ scale: 2.5, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: -6, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={cn("mx-auto w-fit rounded-xl border-4 px-4 py-1 font-display text-3xl font-extrabold", qGrade === null ? "border-destructive text-destructive" : "border-primary text-primary-deep")}>
              {qGrade === null ? "Non superato" : `${qGrade}/30`}
            </motion.div>
            <p className="text-center font-display text-xl font-bold">“{feedback.quip}”</p>
            {feedback.improvement && <p><b>Tip:</b> {feedback.improvement}</p>}
            {feedback.missingPoints.length > 0 && (
              <div>
                <p className="font-bold text-accent-deep">Missing key points</p>
                <ul className="ml-5 list-disc text-muted-foreground">{feedback.missingPoints.map((m) => <li key={m}>{m}</li>)}</ul>
              </div>
            )}
            <ChunkyButton tone={feedback.followupNext ? "accent" : "primary"} className="w-full" onClick={next}>
              {feedback.followupNext ? "Face the follow-up" : qi + 1 < level.questions.length ? "Next question" : "See my grade"}
            </ChunkyButton>
          </motion.div>
        ) : (
          <motion.div key="ans" className="mt-6 flex flex-col items-center gap-3">
            {!typing && stt.supported ? (
              <>
                <button
                  aria-label={stt.listening ? "Stop listening" : "Answer out loud"}
                  disabled={grading}
                  onClick={() => (stt.listening ? stt.stop() : stt.start())}
                  className={cn("chunky flex h-28 w-28 items-center justify-center rounded-full", stt.listening ? "animate-mic bg-accent text-accent-foreground [--chunk:var(--accent-deep)]" : "bg-primary text-primary-foreground [--chunk:var(--primary-deep)]")}
                >
                  {stt.listening ? <Square className="h-10 w-10 fill-current" /> : <Mic className="h-12 w-12" />}
                </button>
                <p className="font-bold text-muted-foreground">{stt.listening ? "Listening..." : grading ? "The Professor is thinking..." : answer ? "Done. Send it or try again." : "Tap and speak your answer"}</p>
                {answer && <p className="w-full rounded-2xl bg-secondary p-4 italic">{answer}</p>}
                {answer && !stt.listening && <ChunkyButton disabled={grading} className="w-full" onClick={() => submit(answer)}>{grading ? "Grading..." : "Submit answer"}</ChunkyButton>}
              </>
            ) : (
              <>
                <textarea value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type your answer like you'd say it..." className="h-36 w-full rounded-2xl border-2 border-input bg-card p-4 outline-none focus:border-primary" />
                <ChunkyButton disabled={grading || !typed.trim()} className="w-full" onClick={() => submit(typed)}>{grading ? "The Professor is thinking..." : "Submit answer"}</ChunkyButton>
              </>
            )}
            {error && <p className="text-center font-bold text-destructive">{error}</p>}
            <button className="text-sm font-bold text-primary-deep underline" onClick={() => setTyping(!typing)}>
              {typing ? (stt.supported ? "Use the mic instead" : "Mic not supported in this browser") : "Mic not working? Type here"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Results({ levelId, out, hats, line, flex }: { levelId: string; out: LevelOutcome; hats: HatId[]; line: string; flex: boolean }) {
  const s = useApp();
  const nav = useNavigate();
  const nextId = out.passed ? nextLevelId(s, levelId) : null;
  return (
    <div className={cn("flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10 text-center", out.lode && "bg-gold")}>
      {flex && (
        <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: -2 }} transition={{ type: "spring", delay: 0.8 }}
          className="chunky rounded-2xl bg-gold px-6 py-3 font-display text-3xl font-extrabold text-gold-foreground [--chunk:var(--gold-deep)]">
          PROMOSSO IN PRIMA SESSIONE!
        </motion.div>
      )}
      <Professor mood={flex ? "delighted" : moodFor(out.grade, out.lode)} size={190} />
      <motion.div
        initial={{ scale: 4, rotate: -25, opacity: 0 }}
        animate={{ scale: 1, rotate: -8, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 14, delay: 0.4 }}
        className={cn("rounded-2xl border-8 px-8 py-3 font-display font-extrabold",
          out.lode ? "border-gold-deep bg-card text-gold-deep text-6xl" : out.grade === null ? "border-destructive text-destructive text-6xl" : "border-primary text-primary-deep text-7xl")}
      >
        {out.lode ? "30 E LODE!" : out.grade === null ? "BOCCIATO" : `${out.grade}/30`}
      </motion.div>
      <p className="max-w-sm font-display text-2xl font-bold">“{line}”</p>
      <p className="font-display text-xl font-bold text-gold-deep">+{out.xp} XP</p>
      {hats.length > 0 && (
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }} className="rounded-2xl border-2 border-border bg-card p-5">
          <p className="font-display text-2xl font-extrabold text-accent">Hat unlocked!</p>
          <div className="flex items-center justify-center gap-4">
            <Avatar hat={hats[hats.length - 1] ?? null} size={110} />
            <div className="text-left">{hats.map((h) => <p key={h} className="flex items-center gap-1 font-bold"><svg viewBox="0 0 120 70" width="36" height="22"><Hat id={h} /></svg>{HATS.find((x) => x.id === h)?.name}</p>)}</div>
          </div>
        </motion.div>
      )}
      <div className="flex w-full max-w-sm flex-col gap-3">
        {nextId ? (
          <ChunkyButton onClick={() => nav({ to: "/quiz/$levelId", params: { levelId: nextId } })}>Next level</ChunkyButton>
        ) : !out.passed ? (
          <ChunkyButton tone="accent" onClick={() => location.reload()}>Try again</ChunkyButton>
        ) : null}
        <ChunkyButton tone="plain" onClick={() => nav({ to: "/" })}>Back to map</ChunkyButton>
      </div>
    </div>
  );
}
