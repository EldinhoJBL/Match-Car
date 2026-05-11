import { Link } from "@tanstack/react-router";
import { Car } from "lucide-react";

export function SiteNav() {
  return (
    <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Car className="h-6 w-6 text-primary" />
          <span>AutoMatch</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-primary" activeProps={{ className: "text-primary font-semibold" }}>Recomendar</Link>
          <Link to="/admin" className="hover:text-primary" activeProps={{ className: "text-primary font-semibold" }}>Logista</Link>
        </nav>
      </div>
    </header>
  );
}
