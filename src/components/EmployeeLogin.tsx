import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Users, ArrowLeft, Eye, EyeOff, UserPlus, ShoppingBag, Package, TrendingUp } from "lucide-react";
import { getEmployeeByCode, updateEmployeeLastLogin } from "@/lib/supabase-client";

interface EmployeeLoginProps {
  onSuccess: (employeeName: string) => void;
  onBack: () => void;
  onRegister: () => void;
}

export default function EmployeeLogin({ onSuccess, onBack, onRegister }: EmployeeLoginProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = async () => {
    setError("");
    
    if (code.length < 4) {
      setError("Code invalide");
      return;
    }
    
    setLoading(true);
    
    try {
      const employee = await getEmployeeByCode(code);
      
      if (employee) {
        await updateEmployeeLastLogin(employee.id);
        onSuccess(employee.name);
      } else {
        setError("Code incorrect. Veuillez vous inscrire.");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* PARTIE GAUCHE - IMAGE PLEINE */}
      <div className="relative md:flex-1 min-h-[40vh] md:min-h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format')",
          }}
        />
        
        {/* Contenu superposé */}
        <div className="relative z-10 flex flex-col items-center justify-end h-full p-8 pb-12 text-center">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 max-w-sm">
            <div className="inline-block p-3 bg-white/20 backdrop-blur rounded-2xl mb-4">
              <ShoppingBag className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Espace Employé
            </h2>
            <p className="text-white/90 text-sm">
              Connectez-vous pour saisir vos ventes
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs text-white/70">
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" /> Gestion stock
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Ventes quotidiennes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PARTIE DROITE - FORMULAIRE DE CONNEXION */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 md:left-auto md:right-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Connexion Employé</h1>
            <p className="text-gray-500 mt-2">Entrez votre code pour accéder</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showCode ? "text" : "password"}
                maxLength={6}
                placeholder="Code employé"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="text-center text-2xl tracking-widest py-6 font-mono"
                autoFocus
              />
              <button
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="text-center">
              <button
                onClick={onRegister}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 mx-auto"
              >
                <UserPlus className="h-3 w-3" />
                Nouvel employé ? S'inscrire
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}