import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-hero animate-splash-fade">
      <div className="animate-splash-logo flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-foreground/20 backdrop-blur-sm">
        <ShoppingBag className="h-10 w-10 text-primary-foreground" />
      </div>
      <h1 className="animate-splash-text mt-6 text-2xl font-bold text-primary-foreground tracking-tight">
         Gestion des ventes quotidiennes
      </h1>
      <p className="animate-splash-text mt-2 text-sm text-primary-foreground/70">
        .......
      </p>
    </div>
  );
}
