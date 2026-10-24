import { Link } from "@tanstack/react-router";
import { CalendarDays, Flame, Shirt, Star } from "lucide-react";
import { Avatar } from "./game";
import { useApp } from "@/lib/store";

export function TopBar() {
  const s = useApp();
  return (
    <header className="sticky top-0 z-20 border-b-2 border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2">
        <Link to="/" className="flex items-center gap-2">
          <Avatar hat={s.equipped} size={44} />
          <span className="font-display text-2xl font-extrabold text-primary-deep">Interrogami</span>
        </Link>
        <div className="flex items-center gap-4 font-display text-lg font-bold">
          <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-0.5 text-sm text-secondary-foreground" title="Current exam session"><CalendarDays className="h-4 w-4" />{s.currentSession}</span>
          <span className="flex items-center gap-1 text-accent" title="Streak"><Flame className="h-5 w-5 fill-current" />{s.streak}</span>
          <span className="flex items-center gap-1 text-gold-deep" title="XP"><Star className="h-5 w-5 fill-current" />{s.xp}</span>
          <Link to="/wardrobe" aria-label="Wardrobe" className="text-muted-foreground hover:text-foreground"><Shirt className="h-6 w-6" /></Link>
        </div>
      </div>
    </header>
  );
}
