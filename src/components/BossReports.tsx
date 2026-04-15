import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Download,
  BarChart3,
  Lock,
  RefreshCw,
} from "lucide-react";
import {
  formatDateFR,
  formatCurrency,
  verifyBossPin,
} from "@/lib/sales-store";
import { supabase } from "@/lib/supabase-client";

export default function BossReports() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const handlePin = () => {
    if (verifyBossPin(pin)) {
      setAuthenticated(true);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500 shadow-lg">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold">Accès Boss</h2>
          <p className="text-sm text-gray-500 mt-1">Entrez le code PIN pour continuer</p>
        </div>
        <div className="w-48 space-y-3">
          <Input
            type="password"
            maxLength={6}
            placeholder="Code PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePin()}
            className="text-center text-lg tracking-widest"
          />
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handlePin}>
            Valider
          </Button>
          {pinError && (
            <p className="text-center text-sm text-red-500 font-medium">Code incorrect</p>
          )}
        </div>
      </div>
    );
  }

  return <BossReportsContent />;
}

function BossReportsContent() {
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const loadDates = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('date')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      const datesList = data.map(d => d.date);
      setDates(datesList);
      
      if (datesList.length > 0 && !selectedDate) {
        setSelectedDate(datesList[0]);
      }
      return datesList;
    } catch (error) {
      console.error('Erreur chargement dates:', error);
      return [];
    }
  };

  const loadReport = async (date: string) => {
    if (!date) return;
    
    setLoading(true);
    try {
      const { data: linesData, error: linesError } = await supabase
        .from('report_lines')
        .select('*')
        .eq('report_date', date);
      
      if (linesError) {
        console.error('Erreur lignes:', linesError);
      }
      
      const { data: reportData } = await supabase
        .from('daily_reports')
        .select('comment, total_amount')
        .eq('date', date)
        .maybeSingle();
      
      if (linesData && linesData.length > 0) {
        setReport({
          date: date,
          lines: linesData,
          comment: reportData?.comment || '',
          totalAmount: reportData?.total_amount || linesData.reduce((sum, l) => sum + l.total, 0)
        });
      } else {
        setReport(null);
      }
    } catch (error) {
      console.error('Erreur chargement rapport:', error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const { data: reports, error: reportsError } = await supabase
        .from('daily_reports')
        .select('*');
      
      if (reportsError) throw reportsError;
      
      let totalRevenue = 0;
      let bestDay = null;
      const productMap: Record<string, { qty: number; rev: number }> = {};
      
      const { data: allSales, error: salesError } = await supabase
        .from('sales')
        .select('product_name, quantity, total');
      
      if (!salesError && allSales) {
        for (const sale of allSales) {
          if (!productMap[sale.product_name]) {
            productMap[sale.product_name] = { qty: 0, rev: 0 };
          }
          productMap[sale.product_name].qty += sale.quantity;
          productMap[sale.product_name].rev += sale.total;
        }
      }
      
      for (const report of reports || []) {
        totalRevenue += report.total_amount;
        if (!bestDay || report.total_amount > bestDay.amount) {
          bestDay = { date: report.date, amount: report.total_amount };
        }
      }
      
      let bestProduct = null;
      for (const [name, data] of Object.entries(productMap)) {
        if (!bestProduct || data.rev > bestProduct.totalRevenue) {
          bestProduct = { name, totalQuantity: data.qty, totalRevenue: data.rev };
        }
      }
      
      setStats({
        totalRevenue,
        avgPerDay: reports?.length ? totalRevenue / reports.length : 0,
        bestDay,
        bestProduct,
        totalDays: reports?.length || 0
      });
    } catch (error) {
      console.error('Erreur stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    await loadDates();
    if (selectedDate) {
      await loadReport(selectedDate);
    }
    if (showStats) {
      await loadStats();
    }
    setRefreshing(false);
  };

  useEffect(() => {
    const init = async () => {
      await loadDates();
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadReport(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (showStats) {
      loadStats();
    }
  }, [showStats]);

  const navigateDay = (dir: -1 | 1) => {
    const idx = dates.indexOf(selectedDate);
    const newIdx = idx + dir;
    if (newIdx >= 0 && newIdx < dates.length) {
      setSelectedDate(dates[newIdx]);
    }
  };

  // EXPORT PDF CORRIGÉ
  const handleExportPDF = async () => {
    if (!reportRef.current || !report) return;
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      // Créer un élément temporaire pour le PDF
      const printContent = document.createElement('div');
      printContent.style.padding = '20px';
      printContent.style.fontFamily = 'Arial, sans-serif';
      printContent.style.backgroundColor = 'white';
      printContent.style.width = '800px';
      
      // En-tête
      printContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin-bottom: 5px;">RAPPORT DES VENTES</h1>
          <p style="color: #6b7280; font-size: 14px;">${formatDateFR(report.date)}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Produit</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Stock initial</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Vendu</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Restant</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Prix unit.</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${report.lines.map((line: any) => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${line.product_name || '—'}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${line.stock_initial ?? 0}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${line.quantity_sold ?? 0}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${line.remaining_stock ?? 0}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${formatCurrency(line.unit_price)}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${formatCurrency(line.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="background-color: #eff6ff; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600;">TOTAL DU JOUR</span>
            <span style="font-size: 20px; font-weight: bold; color: #2563eb;">${formatCurrency(report.totalAmount)}</span>
          </div>
        </div>
        ${report.comment ? `
          <div style="background-color: #f9fafb; padding: 12px; border-radius: 8px;">
            <p style="font-weight: 600; margin-bottom: 5px;">Commentaire</p>
            <p style="color: #4b5563;">${report.comment}</p>
          </div>
        ` : ''}
        <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 10px;">
          Document généré le ${new Date().toLocaleDateString('fr-FR')}
        </div>
      `;
      
      document.body.appendChild(printContent);
      
      const canvas = await html2canvas(printContent, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`rapport-${report.date}.pdf`);
      
      document.body.removeChild(printContent);
    } catch (error) {
      console.error("Erreur export PDF:", error);
      alert("Erreur lors de la génération du PDF");
    }
  };

  const handleExportAllPDF = async () => {
    try {
      const jsPDF = (await import("jspdf")).default;
      
      const { data: reports } = await supabase
        .from('daily_reports')
        .select('*')
        .order('date', { ascending: true });
      
      if (!reports || reports.length === 0) {
        alert("Aucun rapport à exporter");
        return;
      }
      
      const pdf = new jsPDF("p", "mm", "a4");
      let first = true;

      for (const r of reports) {
        const { data: lines } = await supabase
          .from('report_lines')
          .select('*')
          .eq('report_date', r.date);
        
        if (!first) pdf.addPage();
        first = false;
        
        let y = 20;
        
        // Titre
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("RAPPORT DES VENTES", 15, y);
        y += 10;
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.text(formatDateFR(r.date), 15, y);
        y += 15;
        
        // En-têtes tableau
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("Produit", 15, y);
        pdf.text("Stock", 70, y);
        pdf.text("Vendu", 95, y);
        pdf.text("Restant", 120, y);
        pdf.text("P.U.", 145, y);
        pdf.text("Total", 170, y);
        y += 2;
        pdf.line(15, y, 195, y);
        y += 6;
        
        // Lignes
        pdf.setFont("helvetica", "normal");
        for (const line of lines || []) {
          if (y > 270) {
            pdf.addPage();
            y = 20;
          }
          pdf.text(line.product_name || "—", 15, y);
          pdf.text(String(line.stock_initial ?? 0), 70, y);
          pdf.text(String(line.quantity_sold ?? 0), 95, y);
          pdf.text(String(line.remaining_stock ?? 0), 120, y);
          pdf.text(formatCurrency(line.unit_price).replace('FCFA', '').trim(), 145, y);
          pdf.text(formatCurrency(line.total).replace('FCFA', '').trim(), 170, y);
          y += 7;
        }
        
        y += 4;
        pdf.setFont("helvetica", "bold");
        pdf.text(`Total: ${formatCurrency(r.total_amount)}`, 15, y);
        
        if (r.comment) {
          y += 8;
          pdf.setFont("helvetica", "italic");
          pdf.text(`Commentaire: ${r.comment}`, 15, y);
        }
      }

      pdf.save("tous-les-rapports.pdf");
    } catch (error) {
      console.error("Erreur export PDF:", error);
      alert("Erreur lors de la génération du PDF");
    }
  };

  if (loading && dates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  if (showStats) {
    return (
      <div className="space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500 shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold">Statistiques</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshAll} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowStats(false)}>
              Rapports
            </Button>
          </div>
        </div>

        {statsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <TrendingUp className="mb-2 h-5 w-5 text-blue-500" />
              <p className="text-xs text-gray-500">Revenu total</p>
              <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </Card>
            <Card className="p-4">
              <Calendar className="mb-2 h-5 w-5 text-yellow-500" />
              <p className="text-xs text-gray-500">Moyenne / jour</p>
              <p className="text-lg font-bold">{formatCurrency(stats.avgPerDay)}</p>
            </Card>
            <Card className="p-4">
              <Award className="mb-2 h-5 w-5 text-red-500" />
              <p className="text-xs text-gray-500">Meilleur jour</p>
              {stats.bestDay ? (
                <>
                  <p className="text-sm font-bold">{formatCurrency(stats.bestDay.amount)}</p>
                  <p className="text-xs text-gray-500">{formatDateFR(stats.bestDay.date)}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">—</p>
              )}
            </Card>
            <Card className="p-4">
              <Star className="mb-2 h-5 w-5 text-yellow-500" />
              <p className="text-xs text-gray-500">Produit star</p>
              {stats.bestProduct ? (
                <>
                  <p className="text-sm font-bold">{stats.bestProduct.name}</p>
                  <p className="text-xs text-gray-500">
                    {stats.bestProduct.totalQuantity} vendus • {formatCurrency(stats.bestProduct.totalRevenue)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">—</p>
              )}
            </Card>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Aucune statistique disponible</p>
          </Card>
        )}

        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleExportAllPDF}>
          <Download className="mr-2 h-4 w-4" />
          Exporter tout en PDF
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500 shadow-lg">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-bold">Rapports</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshAll} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowStats(true)}>
            <BarChart3 className="mr-1 h-4 w-4" />
            Stats
          </Button>
        </div>
      </div>

      {dates.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">Aucun rapport disponible</p>
          <p className="text-sm text-gray-400">
            Les rapports apparaîtront ici après la saisie des ventes
          </p>
          <Button variant="outline" className="mt-4" onClick={refreshAll}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDay(1)}
              disabled={dates.indexOf(selectedDate) >= dates.length - 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dates.map((d) => (
                  <SelectItem key={d} value={d}>
                    {formatDateFR(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDay(-1)}
              disabled={dates.indexOf(selectedDate) <= 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : report && report.lines && report.lines.length > 0 ? (
            <div className="space-y-3">
              <Card className="overflow-hidden">
                <div className="bg-blue-500 px-4 py-2">
                  <p className="text-sm font-semibold capitalize text-white">
                    {formatDateFR(report.date)}
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right">Stock initial</TableHead>
                      <TableHead className="text-right">Vendu</TableHead>
                      <TableHead className="text-right">Reste</TableHead>
                      <TableHead className="text-right">Prix unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.lines.map((line: any) => (
                      <TableRow key={line.id}>
                        <TableCell className="font-medium">{line.product_name || "—"}</TableCell>
                        <TableCell className="text-right">{line.stock_initial ?? 0}</TableCell>
                        <TableCell className="text-right">{line.quantity_sold ?? 0}</TableCell>
                        <TableCell className="text-right">{line.remaining_stock ?? 0}</TableCell>
                        <TableCell className="text-right">{formatCurrency(line.unit_price)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(line.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <Card className="p-4 border-blue-200 bg-blue-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Total du jour</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(report.totalAmount)}
                  </span>
                </div>
              </Card>

              {report.comment && (
                <Card className="p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Commentaire</p>
                  <p className="text-sm">{report.comment}</p>
                </Card>
              )}

              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Exporter ce rapport en PDF
              </Button>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">Aucune vente enregistrée pour cette date</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}