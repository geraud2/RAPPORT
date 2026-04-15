import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, ArrowLeft, Eye, EyeOff, Crown, BarChart3, FileText, TrendingUp } from "lucide-react";

interface BossAuthProps {
  onSuccess: () => void;
  onBack: () => void;
}

const BOSS_PIN = "100905";

export default function BossAuth({ onSuccess, onBack }: BossAuthProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = () => {
    if (pin === BOSS_PIN) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* PARTIE GAUCHE - IMAGE PLEINE (NOUVELLE IMAGE) */}
      <div className="relative md:flex-1 min-h-[40vh] md:min-h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format')",
          }}
        />
        
        <div className="relative z-10 flex flex-col items-center justify-end h-full p-8 pb-12 text-center">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 max-w-sm">
            <div className="inline-block p-3 bg-white/20 backdrop-blur rounded-2xl mb-4">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Espace Boss
            </h2>
            <p className="text-white/90 text-sm">
              Accès réservé à la direction
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs text-white/70">
              <span className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" /> Statistiques
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" /> Export PDF
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Analyses
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PARTIE DROITE - FORMULAIRE PIN */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-amber-50 to-yellow-50">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 md:left-auto md:right-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Accès Boss</h1>
            <p className="text-gray-500 mt-2">Entrez votre code PIN pour continuer</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPin ? "text" : "password"}
                maxLength={6}
                placeholder="Code PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="text-center text-2xl tracking-widest py-6 font-mono"
                autoFocus
              />
              <button
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && (
              <p className="text-center text-sm text-red-500 font-medium">
                Code PIN incorrect
              </p>
            )}

            <Button 
              className="w-full bg-amber-600 hover:bg-amber-700 h-12"
              onClick={handleSubmit}
            >
              <Lock className="mr-2 h-4 w-4" />
              Valider
            </Button>

            
          </div>
        </div>
      </div>
    </div>
  );
}