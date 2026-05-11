import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import ArcheryGame from "@/games/ArcheryGame";
import MathPolyGame from "@/games/MathPolyGame";
import GoalkeeperGame from "@/games/GoalkeeperGame";
import PyramidGame from "@/games/PyramidGame";
import RacerGame from "@/games/RacerGame";
import MarketplaceGame from "@/games/MarketplaceGame";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/games/$gameId")({
  component: GamePage,
  notFoundComponent: () => <div className="p-8 text-center">404</div>,
});

function GamePage() {
  const { gameId } = Route.useParams();
  const { lang } = useApp();

  let Comp: React.ComponentType | null = null;
  switch (gameId) {
    case "archery": Comp = ArcheryGame; break;
    case "mathpoly": Comp = MathPolyGame; break;
    case "goalie": Comp = GoalkeeperGame; break;
    case "pyramid": Comp = PyramidGame; break;
    case "racer": Comp = RacerGame; break;
    case "market": Comp = MarketplaceGame; break;
  }

  if (!Comp) {
    return (
      <div className="mx-auto max-w-md p-8 text-center text-muted-foreground">
        Game not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4" /> {t("back_home", lang)}
      </Link>
      <Comp />
    </div>
  );
}
