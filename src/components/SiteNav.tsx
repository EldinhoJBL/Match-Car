import { Link } from "@tanstack/react-router";
import { Phone, MapPin, Car } from "lucide-react";

export function SiteNav() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Car className="h-7 w-7 text-primary" />
          <span className="tracking-tight">Match<span className="text-primary">Car</span></span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="hidden sm:flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> (91) 98723-8874</span>
          <span className="hidden sm:flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Castanhal, PA</span>
          <Link to="/admin" className="hover:text-primary transition-colors">Área do Lojista</Link>
        </div>
      </div>
    </header>
  );
}
