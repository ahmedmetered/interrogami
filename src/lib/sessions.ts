// Italian exam sessions ("appelli"). Failing a level advances the session.
export const SESSIONS = ["January", "February", "June", "July", "September"] as const;
export type Session = (typeof SESSIONS)[number];

export function nextSession(s: Session): Session {
  const i = SESSIONS.indexOf(s);
  return SESSIONS[Math.min(i + 1, SESSIONS.length - 1)]!;
}

export const SESSION_QUIPS: Record<Session, string[]> = {
  January: ["Allora, try again. Still January."],
  February: ["See you in February. Bring an umbrella.", "February, then. The rain suits your answers."],
  June: ["June it is. Study by the sea, not in it.", "Ci vediamo a giugno. Wear sunscreen, study harder."],
  July: ["July. I will be sweating, and so will you.", "Luglio! The air conditioning is broken, like your answer."],
  September: ["September it is. I'll be here. Older.", "Settembre. The leaves fall, and so did you."],
};

/** Failing in September: no more appelli this year. */
export const LAST_CALL_LINES = ["September is the last call. I hope you like leaves.", "No more appelli this year. I hope you like my office, because you'll see a lot of it."];

export const SHORT: Record<Session, string> = { January: "Jan", February: "Feb", June: "Jun", July: "Jul", September: "Sep" };
