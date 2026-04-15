import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ShoppingBag,
  Package,
  AlertCircle,
  Clock,
  Lock,
  Unlock,
  Loader2,
} from "lucide-react";
import {
  type SalesLine,
  type DailyReport,
  createEmptyLine,
  computeLine,
  getReportByDate,
  saveReport,
  todayISO,
  formatDateFR,
  formatCurrency,
  getProductInfo,
  updateProductStock,
  updateProductPrice,
} from "@/lib/sales-store";

export default function EmployeeSalesEntry() {
  const [date] = useState(todayISO);
  const [lines, setLines] = useState<SalesLine[]>([createEmptyLine()]);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stockErrors, setStockErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productExists, setProductExists] = useState<Record<string, boolean>>({});
  const [loadingProduct, setLoadingProduct] = useState<Record<string, boolean>>({});
  
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fermeture à 22h30
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      setCurrentTime(now);
      const hours = now.getHours();
      const minutes = now.getMinutes();
      setIsClosed(hours > 22 || (hours === 22 && minutes >= 30));
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Réinitialiser quand on revient sur la page
  useEffect(() => {
    const resetForm = () => {
      setLines([createEmptyLine()]);
      setComment("");
      setSaved(false);
      setStockErrors({});
      setProductExists({});
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };

    resetForm();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        resetForm();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setLoading(false);
    }
    loadData();
  }, [date]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const loadProductInfo = async (productName: string, lineId: string) => {
    if (!productName.trim()) return;
    
    setLoadingProduct(prev => ({ ...prev, [lineId]: true }));
    
    try {
      const info = await getProductInfo(productName);
      const exists = info !== null && (info.stock > 0 || info.price > 0);
      
      setProductExists(prev => ({ ...prev, [productName]: exists }));
      
      setLines(prev => prev.map(line => {
        if (line.id !== lineId) return line;
        
        let updated = { ...line };
        
        if (exists) {
          updated.stock = info.stock;
          updated.unitPrice = info.price;
          updated.remainingStock = info.stock;
          updated.total = 0;
          updated.quantitySold = 0;
        } else {
          updated.stock = 0;
          updated.unitPrice = 0;
          updated.remainingStock = 0;
          updated.total = 0;
          updated.quantitySold = 0;
        }
        
        return updated;
      }));
    } catch (error) {
      console.error("Erreur chargement produit:", error);
    } finally {
      setLoadingProduct(prev => ({ ...prev, [lineId]: false }));
    }
  };

  const updateLine = useCallback(
    (id: string, field: keyof SalesLine, value: string | number) => {
      if (isClosed) return;

      setLines(prev => prev.map(line => {
        if (line.id !== id) return line;
        return { ...line, [field]: value };
      }));

      if (field === "product") {
        const productName = value as string;
        
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        
        if (productName.trim()) {
          typingTimeout.current = setTimeout(() => {
            loadProductInfo(productName, id);
          }, 500);
        }
      }

      setSaved(false);
    },
    [isClosed]
  );

  useEffect(() => {
    setLines(prev => prev.map(line => computeLine(line)));
  }, [lines.map(l => l.quantitySold + l.stock + l.unitPrice).join()]);

  useEffect(() => {
    const errors: Record<string, string> = {};
    for (const line of lines) {
      if (line.quantitySold > line.stock && line.stock > 0) {
        errors[line.id] = `Stock max: ${line.stock}`;
      }
    }
    setStockErrors(errors);
  }, [lines]);

  const addLine = () => {
    setLines([...lines, createEmptyLine()]);
  };

  const removeLine = (id: string) => {
    if (lines.length === 1) {
      setLines([createEmptyLine()]);
    } else {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  const totalAmount = lines.reduce((sum, l) => sum + l.total, 0);
  
  const isValid = lines.every(
    (l) => l.product.trim() !== "" && l.quantitySold >= 0 && l.quantitySold <= l.stock && l.stock > 0
  );

  const handleSave = async () => {
    if (isClosed) {
      alert("❌ Délai dépassé ! Plus de vente après 22h30.");
      return;
    }
    
    if (!isValid) {
      alert("Veuillez corriger les erreurs");
      return;
    }

    setSaving(true);

    try {
      for (const line of lines) {
        if (line.product && line.quantitySold > 0) {
          const newStock = line.stock - line.quantitySold;
          await updateProductStock(line.product, newStock);
          
          if (line.unitPrice > 0) {
            await updateProductPrice(line.product, line.unitPrice);
          }
        }
      }

      const report: DailyReport = {
        date,
        lines,
        comment,
        totalAmount,
        createdAt: "",
        updatedAt: "",
      };

      const success = await saveReport(report);
      
      if (success) {
        setSaved(true);
        setLines([createEmptyLine()]);
        setComment("");
        setProductExists({});
        
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Clock className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Fermeture</h1>
        <p className="text-gray-600 mb-1">Il est {formatTime(currentTime)}</p>
        <p className="text-gray-500">Plus aucune vente ne peut être enregistrée</p>
        <p className="text-sm text-gray-400 mt-4">Réouverture demain à 00h00</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 px-4">
      {/* Header avec dégradé */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Saisie des ventes</h1>
              <p className="text-blue-100 text-sm mt-0.5">{formatDateFR(date)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur">
              🕐 {formatTime(currentTime)}
            </div>
            <p className="text-blue-100 text-xs mt-1">Fermeture 22h30</p>
          </div>
        </div>
      </div>

      {/* Lignes de vente */}
      {lines.map((line, idx) => {
        const isExistingProduct = productExists[line.product] === true;
        const isLoadingProduct = loadingProduct[line.id];
        
        return (
          <Card key={line.id} className="p-5 shadow-md hover:shadow-lg transition-shadow duration-200 border-0 bg-white">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-bold">{idx + 1}</span>
                </div>
                <span className="text-sm font-medium text-gray-500">Produit</span>
              </div>
              {lines.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLine(line.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Nom du produit */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                🏷️ Nom du produit
              </label>
              <div className="relative">
                <Input
                  placeholder="Ex: MOMO, SAVON, PARFUM..."
                  value={line.product}
                  onChange={(e) => updateLine(line.id, "product", e.target.value)}
                  className="pl-4 py-2.5 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
                {isLoadingProduct && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {isExistingProduct ? "✅ Produit existant - Stock et prix chargés" : "🆕 Nouveau produit - Remplissez les champs ci-dessous"}
              </p>
            </div>

            {/* Stock et Quantité */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  📦 Stock disponible
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    value={line.stock}
                    className={`pl-4 py-2.5 ${!isExistingProduct && line.product ? "bg-yellow-50 border-yellow-300" : "bg-gray-50 border-gray-200"} pr-10`}
                    disabled={isExistingProduct}
                    readOnly={isExistingProduct}
                    onChange={(e) => updateLine(line.id, "stock", Number(e.target.value))}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isExistingProduct ? (
                      <Lock className="h-4 w-4 text-gray-400" />
                    ) : line.product && (
                      <Unlock className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {isExistingProduct ? "🔒 Calculé automatiquement" : "✏️ À saisir une fois"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  🛒 Quantité vendue
                </label>
                <Input
                  type="number"
                  min={0}
                  max={line.stock}
                  value={line.quantitySold}
                  className={`pl-4 py-2.5 ${stockErrors[line.id] ? "border-red-500 ring-red-500" : "border-gray-200"}`}
                  disabled={!line.product}
                  placeholder={!line.product ? "D'abord le produit" : "Quantité"}
                  onChange={(e) => updateLine(line.id, "quantitySold", Number(e.target.value))}
                />
                {stockErrors[line.id] && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {stockErrors[line.id]}
                  </p>
                )}
              </div>
            </div>

            {/* Prix, Restant, Total */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">💰 Prix unitaire</label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    step={100}
                    value={line.unitPrice}
                    className={`pl-3 py-2 text-sm ${!isExistingProduct && line.product ? "bg-yellow-50 border-yellow-300" : "bg-gray-50 border-gray-200"} pr-7`}
                    disabled={isExistingProduct}
                    readOnly={isExistingProduct}
                    onChange={(e) => updateLine(line.id, "unitPrice", Number(e.target.value))}
                  />
                  {isExistingProduct && (
                    <Lock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">📊 Stock restant</label>
                <div className="h-10 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl flex items-center justify-center font-bold text-green-700 border border-green-100">
                  {line.remainingStock}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">💵 Total</label>
                <div className="h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center font-bold text-white shadow-sm">
                  {formatCurrency(line.total)}
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Bouton ajouter */}
      <Button 
        variant="outline" 
        className="w-full border-2 border-dashed border-gray-300 py-6 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all duration-200"
        onClick={addLine}
      >
        <Plus className="mr-2 h-5 w-5" />
        Ajouter un produit
      </Button>

      {/* Commentaire */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          📝 Commentaire du jour
        </label>
        <textarea
          className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:border-blue-400 focus:ring-blue-400 transition-all"
          placeholder="Notes, observations..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>

      {/* Total */}
      <Card className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-md">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">💰 Total de la vente</span>
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </Card>

      {/* Bouton enregistrer */}
      <Button 
        className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-200"
        onClick={handleSave}
        disabled={!isValid || saving}
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Enregistrement...
          </>
        ) : saved ? (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Enregistré !
          </>
        ) : (
          <>
            <Save className="mr-2 h-5 w-5" />
            Enregistrer la vente
          </>
        )}
      </Button>

      {/* Toast de confirmation */}
      {saved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300 z-50">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Vente enregistrée ! Stock mis à jour.</span>
        </div>
      )}
    </div>
  );
}