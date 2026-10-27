# Interrogami

**Get grilled. Get good.**

An oral-exam trainer that behaves like a game. A short-tempered Italian professor reads you
questions out loud, you answer out of your head (out loud too), and you get a real Italian
university grade — 18 to 30, with *e lode* if you really nail it. Fail, and the exam calendar
itself moves against you: the next appello is months away.

Built for the **Learning Reimagined** hackathon, held on **24 October 2026 in Milan**.

**Live app**: https://interrogami.lovable.app

## Why it exists

Most study apps quiz you with multiple choice and tell you "80% correct". That is nothing like
an oral exam, where you have to build the answer yourself, say it out loud, and live with the
consequences. Interrogami keeps the part that actually teaches — retrieving and speaking the
material — and wraps the consequence in something you want to play again: a world map, XP,
collectible hats, and a professor who never lets a weak answer slide.

## How a run works

1. **Pick a level on the map.** Levels sit on one winding path per course, grouped under chapter
   banners, and each one unlocks when you pass the previous.
2. **The professor asks.** The question arrives spoken, in his voice, with a mood on his face.
3. **You answer.** Speak into the microphone, or type if your microphone is having a day. The
   mic keeps listening through your pauses until you tap stop, so a long answer survives intact.
4. **You get graded.** The AI checks your answer against the key points the question expects,
   scores it 0–100, and that score maps to an Italian grade. A thin answer earns a follow-up
   question — the professor is not done with you.
5. **Pass and move on. Fail and the calendar flips.** A failed level advances you to the next
   exam session, complete with a page-turn animation and a fresh quip from the professor.

## Features

- **Voice in, voice out** — the professor reads every question aloud, and you answer by speaking.
  Speech recognition restarts through silences so nothing gets cut off mid-sentence, and every
  failure tells you exactly why (blocked permission, unreachable speech service, or just your
  browser). A typing fallback is always available and grades exactly the same.
- **Real Italian grading** — 18 to 30, `Non superato` below the pass mark, and *30 e lode* only
  for a strong average with no follow-up needed. Grades, XP and hat unlocks are deterministic
  rules in `src/lib/grading.ts`, not vibes.
- **The academic year** — a sticky timeline under the header shows the five appelli (January,
  February, June, July, September). The current one is ringed with your avatar on it; the past
  are ticked off; the future are faded. Failing slides you forward.
- **A year that changes weather** — the whole map takes on the season you are stuck in: January
  snow, February rain, spring petals, July heat, September leaves, cross-fading as you move.
- **Consequences with a sense of humour** — session-specific quips, a "last call" line when you
  blow the September appello, and a `BOCCIATO` stamp on the node you failed.
- **XP, streaks and hats** — passing earns XP, daily practice builds a streak, and XP unlocks
  the graduation cap, chef hat and crown. The laurel wreath is reserved for a *lode*. Equip them
  in the wardrobe and your avatar wears the result.
- **Your own subjects** — paste your notes, or drop in a `.txt`, `.md` or `.pdf`, and the app
  builds a chaptered course out of them. Ships with a starter course, *History of Italian Cinema*
  (Neorealism, Commedia all'italiana, Fellini — 9 levels, 27 questions).
- **No account, no database** — everything lives in your browser's local storage, so it opens
  and plays instantly.

## Tech

TanStack Start (React 19, file-based routing) · Tailwind CSS v4 · Framer Motion ·
Vite 8 · Vitest · Web Speech API · AI SDK against the Lovable AI Gateway
(`openai/gpt-6-astra`, Responses API) · pdf.js for note uploads · built with
[Lovable](https://lovable.dev).

### Where things live

| Path | What it holds |
| --- | --- |
| `src/routes/index.tsx` | The game map, the academic-year timeline, seasonal backdrop, add-subject dialog |
| `src/routes/quiz.$levelId.tsx` | The oral exam itself: question, answer, feedback, results, calendar flip |
| `src/routes/wardrobe.tsx` | Equip the hats you have earned |
| `src/lib/grading.ts` | Grading, XP and hat rules — pure and unit-tested |
| `src/lib/sessions.ts` | Exam-session (appello) rules and quips |
| `src/lib/store.ts` | All app state, persisted in one local-storage key |
| `src/lib/ai.functions.ts` · `src/lib/ai.server.ts` | Server-side AI: grading a spoken answer, generating a course |
| `src/lib/voice.ts` | Text-to-speech and microphone handling |
| `src/lib/seed.ts` | The starter course |

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd interrogami
npm i
npm run dev
```

```sh
npm run test     # unit tests (grading, sessions, voice, routing)
npm run lint
npm run build
```

AI calls (grading and course generation) run through server functions so the gateway key stays
server-side; they need the project's backend environment to be available. The microphone needs
a browser with online speech recognition — Chrome or Edge work best, and the app is happiest in
its own browser tab rather than an embedded preview.

## Build with Lovable

Continue developing this project in the
[Lovable editor](https://lovable.dev/projects/01dd0dc6-a5e6-45aa-af42-14a562f7094c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back
  into Lovable, ready for your next prompt.
