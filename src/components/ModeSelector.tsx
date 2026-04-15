import { Users, Crown, ArrowRight } from "lucide-react";

interface ModeSelectorProps {
  onSelectMode: (mode: "employee" | "boss") => void;
}

export default function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-4 inline-block mb-4 shadow-lg">
          <Users className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Bonjour !</h1>
        <p className="text-gray-500 mt-2">Qui êtes-vous ?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl w-full">
        {/* Mode Employé */}
        <button
          onClick={() => onSelectMode("employee")}
          className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center border-2 border-transparent hover:border-blue-200"
        >
          <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
            <Users className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Employé</h2>
          <p className="text-gray-500 text-sm mb-4">
            Saisir les ventes quotidiennes
          </p>
          <div className="flex items-center justify-center text-blue-600 font-medium text-sm">
            Continuer <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Mode Boss */}
        <button
          onClick={() => onSelectMode("boss")}
          className="group bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center border-2 border-transparent hover:border-amber-200"
        >
          <div className="bg-amber-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
            <Crown className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Boss</h2>
          <p className="text-gray-500 text-sm mb-4">
            Consulter les rapports et statistiques
          </p>
          <div className="flex items-center justify-center text-amber-600 font-medium text-sm">
            Continuer <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}