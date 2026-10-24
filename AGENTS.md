<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Grading/XP/hat rules live only in src/lib/grading.ts (pure, tested in src/test/grading.test.ts) so the deterministic Italian mapping has one source of truth.
- All app state persists client-side in one localStorage key via src/lib/store.ts; there is no login or database by design.
- AI calls (grading, course generation) go through server functions in src/lib/ai.functions.ts so the gateway key stays server-side.
