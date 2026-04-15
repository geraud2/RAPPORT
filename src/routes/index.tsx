import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { ShoppingBag, Crown, ArrowRight, TrendingUp, Package, FileText } from "lucide-react";
import EmployeeSalesEntry from "@/components/EmployeeSalesEntry";
import BossReports from "@/components/BossReports";
import SplashScreen from "@/components/SplashScreen";
import EmployeeLogin from "@/components/EmployeeLogin";
import EmployeeRegister from "@/components/EmployeeRegister";
import BossAuth from "@/components/BossAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Daily Sales Report" },
      {
        name: "description",
        content: "Application de rapports quotidiens avec gestion des ventes",
      },
    ],
  }),
  component: Index,
});

type AuthState = "splash" | "role" | "employeeLogin" | "employeeRegister" | "bossAuth" | "employee" | "boss";

function Index() {
  const [authState, setAuthState] = useState<AuthState>("splash");
  const [employeeName, setEmployeeName] = useState("");

  // Vérifier si une session existe
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    const savedName = localStorage.getItem("employeeName");
    const savedTime = localStorage.getItem("loginTime");
    
    if (savedRole && savedTime) {
      const loginTime = parseInt(savedTime);
      const hoursSinceLogin = (Date.now() - loginTime) / (1000 * 60 * 60);
      
      if (hoursSinceLogin < 8) {
        if (savedRole === "employee" && savedName) {
          setEmployeeName(savedName);
          setAuthState("employee");
        } else if (savedRole === "boss") {
          setAuthState("boss");
        }
        return;
      }
    }
    setAuthState("role");
  }, []);

  const saveSession = (role: string, name?: string) => {
    localStorage.setItem("userRole", role);
    localStorage.setItem("loginTime", Date.now().toString());
    if (name) {
      localStorage.setItem("employeeName", name);
      setEmployeeName(name);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("employeeName");
    localStorage.removeItem("loginTime");
    setAuthState("role");
    setEmployeeName("");
  };

  const onSplashDone = useCallback(() => {
    setAuthState("role");
  }, []);

  // ========== SPLASH SCREEN ==========
  if (authState === "splash") {
    return <SplashScreen onDone={onSplashDone} />;
  }

  // ========== SÉLECTION DU RÔLE AVEC SPLIT HORIZONTAL (SANS OVERLAY) ==========
  if (authState === "role") {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* PARTIE GAUCHE - IMAGE PLEINE SANS OVERLAY */}
        <div className="relative md:flex-1 min-h-[40vh] md:min-h-screen overflow-hidden">
          {/* Image de fond - SANS OVERLAY */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format')",
            }}
          />
          
          {/* Contenu superposé avec texte blanc et fond semi-transparent uniquement sous le texte */}
          <div className="relative z-10 flex flex-col items-center justify-end h-full p-8 pb-12 text-center">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 max-w-sm">
              <div className="inline-block p-3 bg-white/20 backdrop-blur rounded-2xl mb-4">
                <ShoppingBag className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Daily Sales Report
              </h2>
              <p className="text-white/90 text-sm">
                Solution complète pour vos ventes
              </p>
            </div>
          </div>
        </div>

        {/* PARTIE DROITE - SÉLECTION DES PROFILS */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h1 className="text-2xl font-bold text-gray-800">Bienvenue</h1>
              <p className="text-gray-500 mt-2">Choisissez votre profil pour continuer</p>
            </div>

            <div className="space-y-4">
              {/* Bouton Employé */}
              <button
                onClick={() => setAuthState("employeeLogin")}
                className="group w-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left border-2 border-transparent hover:border-blue-200 flex items-center gap-4"
              >
                <div className="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <ShoppingBag className="h-7 w-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-800">Employé</h2>
                  <p className="text-gray-500 text-sm">Saisir les ventes quotidiennes</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Bouton Boss */}
              <button
                onClick={() => setAuthState("bossAuth")}
                className="group w-full bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left border-2 border-transparent hover:border-amber-200 flex items-center gap-4"
              >
                <div className="bg-amber-100 rounded-full w-14 h-14 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <Crown className="h-7 w-7 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-800">Boss</h2>
                  <p className="text-gray-500 text-sm">Consulter les rapports et statistiques</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-8">
              Application sécurisée • Données en temps réel
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========== LOGIN EMPLOYÉ ==========
  if (authState === "employeeLogin") {
    return (
      <EmployeeLogin
        onSuccess={(name) => {
          saveSession("employee", name);
          setAuthState("employee");
        }}
        onBack={() => setAuthState("role")}
        onRegister={() => setAuthState("employeeRegister")}
      />
    );
  }

  // ========== REGISTER EMPLOYÉ ==========
  if (authState === "employeeRegister") {
    return (
      <EmployeeRegister
        onSuccess={() => setAuthState("employeeLogin")}
        onBack={() => setAuthState("employeeLogin")}
      />
    );
  }

  // ========== AUTH BOSS ==========
  if (authState === "bossAuth") {
    return (
      <BossAuth
        onSuccess={() => {
          saveSession("boss");
          setAuthState("boss");
        }}
        onBack={() => setAuthState("role")}
      />
    );
  }

  // ========== DASHBOARD EMPLOYÉ ==========
  if (authState === "employee") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-3 flex justify-between items-center">
            <div>
              <span className="font-medium text-gray-700">👋 Bonjour, {employeeName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6">
          <EmployeeSalesEntry />
        </div>
      </div>
    );
  }

  // ========== DASHBOARD BOSS ==========
  if (authState === "boss") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-3 flex justify-between items-center">
            <span className="font-medium text-gray-700">👑 Boss</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6">
          <BossReports />
        </div>
      </div>
    );
  }

  return null;
}