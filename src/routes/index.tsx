import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { ShoppingBag, BarChart3 } from "lucide-react";
import EmployeeSalesEntry from "@/components/EmployeeSalesEntry";
import BossReports from "@/components/BossReports";
import SplashScreen from "@/components/SplashScreen";

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

type Role = "employee" | "boss";

function Index() {
  const [role, setRole] = useState<Role>("employee");
  const [splashDone, setSplashDone] = useState(false);
  const onSplashDone = useCallback(() => setSplashDone(true), []);

  return (
    <>
      {!splashDone && <SplashScreen onDone={onSplashDone} />}
      <div className="mx-auto min-h-screen max-w-lg px-4 py-6">
        {/* Role Switcher */}
        <div className="mb-6 flex rounded-2xl bg-muted p-1 shadow-sm">
          <button
            onClick={() => setRole("employee")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              role === "employee"
                ? "gradient-primary text-primary-foreground shadow-md"
                : "text-muted-foreground"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Employé
          </button>
          <button
            onClick={() => setRole("boss")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              role === "boss"
                ? "gradient-primary text-primary-foreground shadow-md"
                : "text-muted-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Boss
          </button>
        </div>

        {/* Content */}
        {role === "employee" ? <EmployeeSalesEntry /> : <BossReports />}
      </div>
    </>
  );
}
