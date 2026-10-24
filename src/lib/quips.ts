const used = new Set<string>();
export function pick(lines: string[]): string {
  const fresh = lines.filter((l) => !used.has(l));
  const pool = fresh.length ? fresh : lines;
  const l = pool[Math.floor(Math.random() * pool.length)];
  used.add(l);
  return l;
}
export function markUsed(l: string) {
  used.add(l);
}
export function usedList() {
  return [...used].slice(-30);
}

export const FAIL_LINES = ["We need to talk. Sit down.", "Mamma mia, the dean wants to see us both.", "Guarda... come back in the next session.", "I have seen better answers on a pizza menu."];
export const PASS_LINES = ["Bravissimo! Did you study, or did you STUDY?", "Allora, not bad. Not bad at all.", "You may leave the room with dignity.", "Va bene, I sign the libretto. Happily."];
export const LODE_LINES = ["TRENTA E LODE! I'm framing this moment.", "Standing ovation! My moustache is trembling!"];
export const INTRO_LINES = ["Allora... sit down. Let us begin.", "Ah, a brave one. First question.", "Relax. I only bite on Fridays. Allora..."];
