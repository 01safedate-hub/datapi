import { CookingPot, Headphones, Laptop, Shirt, Smartphone, Sparkles, Tag, type LucideIcon } from "lucide-react";

const map: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  laptop: Laptop,
  headphones: Headphones,
  shirt: Shirt,
  "cooking-pot": CookingPot,
  sparkles: Sparkles,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = map[name] ?? Tag;
  return <Icon className={className} aria-hidden />;
}
