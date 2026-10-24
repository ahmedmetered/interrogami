import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Avatar, Hat } from "@/components/game";
import { TopBar } from "@/components/TopBar";
import { HATS } from "@/lib/grading";
import { setState, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wardrobe")({
  head: () => ({
    meta: [
      { title: "Wardrobe — Interrogami" },
      { name: "description", content: "Equip the hats you've earned by acing your oral exams." },
      { property: "og:title", content: "Wardrobe — Interrogami" },
      { property: "og:description", content: "Equip the hats you've earned by acing your oral exams." },
    ],
  }),
  component: Wardrobe,
});

function Wardrobe() {
  const s = useApp();
  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-4xl font-extrabold">Wardrobe</h1>
        <div className="my-6 flex justify-center"><Avatar hat={s.equipped} size={160} /></div>
        <div className="flex snap-x gap-4 overflow-x-auto pb-4">
          {HATS.map((h) => {
            const owned = s.owned.includes(h.id);
            const on = s.equipped === h.id;
            return (
              <button
                key={h.id}
                disabled={!owned}
                onClick={() => setState((st) => ({ ...st, equipped: on ? null : h.id }))}
                className={cn(
                  "chunky flex w-40 shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border-2 bg-card p-4",
                  on ? "border-primary [--chunk:var(--primary-deep)]" : "border-border",
                  !owned && "opacity-50 grayscale",
                )}
              >
                <svg viewBox="0 0 120 70" width="100" height="60"><Hat id={h.id} /></svg>
                <span className="font-display font-bold">{h.name}</span>
                <span className="text-center text-xs text-muted-foreground">
                  {owned ? (on ? "Equipped" : "Tap to wear") : h.threshold ? <span className="flex items-center gap-1"><Lock className="h-3 w-3" />{h.threshold} XP</span> : "Only earned with a 30 e lode"}
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
