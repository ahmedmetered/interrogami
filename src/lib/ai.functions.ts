import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Course } from "./seed";

export interface GradeResult {
  score: number;
  quip: string;
  improvement: string;
  missingPoints: string[];
  askFollowup: boolean;
  followup: string | null;
}

const PROF = `You are "the Professor", a theatrical old-school Italian university professor who speaks English with Italian seasoning ("Allora...", "Mamma mia", "Bravissimo!", "Guarda..."). Dry, affectionately sarcastic, never mean.`;

export const gradeAnswer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      question: z.string().max(2000),
      expectedPoints: z.array(z.string().max(500)).max(12),
      answer: z.string().max(6000),
      isFollowup: z.boolean(),
      usedQuips: z.array(z.string()).max(30),
    }),
  )
  .handler(async ({ data }): Promise<GradeResult> => {
    const { askModel, parseJson } = await import("./ai.server");
    const text = await askModel(
      `${PROF}
You grade oral exam answers STRICTLY against the hidden expected points. Score 0-100 = proportion and depth of expected points covered, accuracy, clarity. Empty or off-topic answers score under 20.
Return ONLY a JSON object: {"score": number, "quip": string (max 15 words, witty, Italian flavour, matches the score), "improvement": string (one concrete tip), "missingPoints": string[] (expected points not covered, rephrased briefly), "askFollowup": boolean, "followup": string|null}.
${data.isFollowup ? "This is already a follow-up: askFollowup must be false, followup null." : "If score < 55 or the answer is very short, set askFollowup true and write ONE probing follow-up question that targets missing points without revealing them."}
Never repeat these quips: ${JSON.stringify(data.usedQuips)}`,
      `Question: ${data.question}\nHidden expected points: ${JSON.stringify(data.expectedPoints)}\nStudent answer: """${data.answer}"""`,
    );
    const r = parseJson<GradeResult>(text);
    return {
      score: Math.max(0, Math.min(100, Math.round(Number(r.score) || 0))),
      quip: String(r.quip ?? "Allora..."),
      improvement: String(r.improvement ?? ""),
      missingPoints: Array.isArray(r.missingPoints) ? r.missingPoints.map(String) : [],
      askFollowup: !data.isFollowup && !!r.askFollowup,
      followup: data.isFollowup ? null : r.followup ? String(r.followup) : null,
    };
  });

export const generateCourse = createServerFn({ method: "POST" })
  .inputValidator(z.object({ notes: z.string().min(50).max(60000) }))
  .handler(async ({ data }): Promise<Course> => {
    const { askModel, parseJson } = await import("./ai.server");
    const text = await askModel(
      `You turn study notes into an oral-exam course in English. Return ONLY JSON:
{"title": string, "chapters": [{"title": string, "levels": [{"title": string, "questions": [{"q": string, "expectedPoints": string[3-5]}]}]}]}
Exactly 2-3 chapters, each with exactly 3 levels, each with exactly 3 open exam-style questions answerable from the notes.`,
      data.notes,
    );
    const raw = parseJson<{ title: string; chapters: { title: string; levels: { title: string; questions: { q: string; expectedPoints: string[] }[] }[] }[] }>(text);
    const cid = `c${Date.now().toString(36)}`;
    return {
      id: cid,
      title: raw.title || "My subject",
      chapters: raw.chapters.slice(0, 3).map((ch, i) => ({
        id: `${cid}-ch${i}`,
        title: ch.title,
        levels: ch.levels.slice(0, 3).map((l, j) => ({
          id: `${cid}-${i}-${j}`,
          title: l.title,
          questions: l.questions.slice(0, 3).map((q) => ({ q: q.q, expectedPoints: q.expectedPoints ?? [] })),
        })),
      })),
    };
  });
