import { useSyncExternalStore } from "react";
import { SEED_COURSE, type Course } from "./seed";
import { hatsForXp, type HatId } from "./grading";
import { nextSession, type Session } from "./sessions";

const KEY = "interrogami:v1";

export interface LevelResult {
  grade: number | null;
  lode: boolean;
  session?: Session;
}
export interface AppState {
  courses: Course[];
  results: Record<string, LevelResult>; // levelId -> best result
  xp: number;
  owned: HatId[];
  equipped: HatId | null;
  hadLode: boolean;
  streak: number;
  lastDay: string | null;
  currentSession: Session;
  januaryFlex: string[]; // course ids already celebrated
}

const initial = (): AppState => ({
  courses: [SEED_COURSE],
  results: {},
  xp: 0,
  owned: [],
  equipped: null,
  hadLode: false,
  streak: 0,
  lastDay: null,
  currentSession: "January",
  januaryFlex: [],
});

let state: AppState = initial();
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial(), ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

export function getState() {
  load();
  return state;
}

export function setState(fn: (s: AppState) => AppState) {
  load();
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — in-memory state still works, it just won't persist */
  }
  subs.forEach((f) => f());
}

const serverSnap = initial();
export function useApp(): AppState {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    getState,
    () => serverSnap,
  );
}

export function findLevel(s: AppState, levelId: string) {
  for (const c of s.courses)
    for (const ch of c.chapters) {
      const i = ch.levels.findIndex((l) => l.id === levelId);
      if (i >= 0) return { course: c, chapter: ch, level: ch.levels[i] };
    }
  return null;
}

/** Flat order of levels in a course; a level unlocks once the previous one is passed. */
export function flatLevels(c: Course) {
  return c.chapters.flatMap((ch) => ch.levels);
}

export function isUnlocked(s: AppState, c: Course, levelId: string) {
  const all = flatLevels(c);
  const i = all.findIndex((l) => l.id === levelId);
  if (i <= 0) return true;
  const prev = s.results[all[i - 1]!.id];
  return !!prev && prev.grade !== null;
}

export function nextLevelId(s: AppState, levelId: string): string | null {
  const f = findLevel(s, levelId);
  if (!f) return null;
  const all = flatLevels(f.course);
  const i = all.findIndex((l) => l.id === levelId);
  return all[i + 1]?.id ?? null;
}

export function recordLevel(levelId: string, grade: number | null, lode: boolean, xp: number) {
  const newHats: HatId[] = [];
  let flex = false;
  setState((s) => {
    const prev = s.results[levelId];
    const better =
      !prev || (grade ?? -1) > (prev.grade ?? -1) || (lode && !prev.lode);
    const nxp = s.xp + xp;
    const owned = new Set(s.owned);
    for (const h of hatsForXp(nxp)) if (!owned.has(h)) { owned.add(h); newHats.push(h); }
    let hadLode = s.hadLode;
    if (lode && !hadLode) { hadLode = true; owned.add("laurel"); newHats.push("laurel"); }
    const today = new Date().toISOString().slice(0, 10);
    const yest = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const streak = s.lastDay === today ? s.streak : s.lastDay === yest ? s.streak + 1 : 1;
    const session = s.currentSession;
    const results = better
      ? { ...s.results, [levelId]: { grade, lode: lode || !!prev?.lode, ...(grade !== null ? { session } : prev?.session ? { session: prev.session } : {}) } }
      : s.results;
    const course = findLevel(s, levelId)?.course;
    let januaryFlex = s.januaryFlex;
    if (course && session === "January" && grade !== null && !januaryFlex.includes(course.id)
      && flatLevels(course).every((l) => results[l.id]?.grade != null)) {
      flex = true;
      januaryFlex = [...januaryFlex, course.id];
    }
    return {
      ...s,
      currentSession: grade === null ? nextSession(session) : session,
      januaryFlex,
      xp: nxp,
      owned: [...owned],
      equipped: newHats[newHats.length - 1] ?? s.equipped,
      hadLode,
      streak,
      lastDay: today,
      results,
    };
  });
  return { newHats, flex, session: getState().currentSession };
}
