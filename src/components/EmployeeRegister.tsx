import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UserPlus, ArrowLeft, Eye, EyeOff, CheckCircle, ShoppingBag, Package, Sparkles } from "lucide-react";
import { registerEmployee } from "@/lib/supabase-client";

interface EmployeeRegisterProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function EmployeeRegister({ onSuccess, onBack }: EmployeeRegisterProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showConfirmCode, setShowConfirmCode] = useState(false);

  const handleSubmit = async () => {
    setError("");
    
    if (!name.trim()) {
      setError("Veuillez entrer votre nom");
      return;
    }
    
    if (code.length < 4) {
      setError("Le code doit contenir au moins 4 chiffres");
      return;
    }
    
    if (code !== confirmCode) {
      setError("Les codes ne correspondent pas");
      return;
    }
    
    setLoading(true);
    
    try {
      const employee = await registerEmployee(name, code);
      
      if (employee) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError("Ce code est déjà utilisé. Veuillez en choisir un autre.");
      }
    } catch (err) {
      setError("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="relative md:flex-1 min-h-[40vh] md:min-h-screen overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format')",
            }}
          />
          <div className="relative z-10 flex flex-col items-center justify-end h-full p-8 pb-12 text-center">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6">
              <div className="inline-block p-3 bg-white/20 backdrop-blur rounded-2xl mb-4">
                <ShoppingBag className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Bienvenue !</h2>
              <p className="text-white/90 text-sm">Votre compte a été créé</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="text-center p-8">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Inscription réussie !</h1>
            <p className="text-gray-600">Vous allez être redirigé...</p>
          </div>
        </div>
      </div>
    );
  }

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
        
        <div className="relative z-10 flex flex-col items-center justify-end h-full p-8 pb-12 text-center">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 max-w-sm">
            <div className="inline-block p-3 bg-white/20 backdrop-blur rounded-2xl mb-4">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Rejoignez l'équipe
            </h2>
            <p className="text-white/90 text-sm">
              Créez votre compte employé
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs text-white/70">
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" /> Accès sécurisé
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PARTIE DROITE - FORMULAIRE D'INSCRIPTION */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 md:left-auto md:right-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Inscription</h1>
            <p className="text-gray-500 mt-2">Créez votre compte employé</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Nom complet
              </label>
              <Input
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Code employé (4 chiffres minimum)
              </label>
              <div className="relative">
                <Input
                  type={showCode ? "text" : "password"}
                  maxLength={6}
                  placeholder="1234"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="pr-10"
                />
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Confirmer le code
              </label>
              <div className="relative">
                <Input
                  type={showConfirmCode ? "text" : "password"}
                  maxLength={6}
                  placeholder="1234"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ""))}
                  className="pr-10"
                />
                <button
                  onClick={() => setShowConfirmCode(!showConfirmCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button 
              className="w-full bg-green-600 hover:bg-green-700 h-12"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}