// src/lib/sales-store.ts
import { supabase } from './supabase-client';

export interface SalesLine {
  id: string;
  product: string;
  stock: number;
  quantitySold: number;
  remainingStock: number;
  unitPrice: number;
  total: number;
}

export interface DailyReport {
  date: string;
  lines: SalesLine[];
  comment: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PRODUITS
// ============================================

export async function getProductInfo(productName: string): Promise<{ stock: number; price: number } | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('stock, unit_price')
      .eq('name', productName)
      .single();
    
    if (error) return null;
    return { stock: data.stock || 0, price: data.unit_price || 0 };
  } catch {
    return null;
  }
}

export async function updateProductStock(productName: string, newStock: number): Promise<void> {
  await supabase
    .from('products')
    .upsert({ name: productName, stock: newStock }, { onConflict: 'name' });
}

export async function updateProductPrice(productName: string, price: number): Promise<void> {
  await supabase
    .from('products')
    .upsert({ name: productName, unit_price: price }, { onConflict: 'name' });
}

// ============================================
// RAPPORTS
// ============================================

export async function saveReport(report: DailyReport): Promise<boolean> {
  try {
    await supabase
      .from('daily_reports')
      .upsert({
        date: report.date,
        total_amount: report.totalAmount,
        comment: report.comment,
        updated_at: new Date().toISOString()
      }, { onConflict: 'date' });
    
    await supabase.from('report_lines').delete().eq('report_date', report.date);
    
    for (const line of report.lines) {
      await supabase.from('report_lines').insert({
        report_date: report.date,
        product_name: line.product,
        stock_initial: line.stock,
        quantity_sold: line.quantitySold,
        remaining_stock: line.remainingStock,
        unit_price: line.unitPrice,
        total: line.total
      });
    }
    return true;
  } catch (error) {
    console.error('Erreur:', error);
    return false;
  }
}

export async function getReportByDate(date: string): Promise<DailyReport | null> {
  try {
    const { data: lines } = await supabase
      .from('report_lines')
      .select('*')
      .eq('report_date', date);
    
    if (!lines || lines.length === 0) return null;
    
    return {
      date,
      lines: lines.map(l => ({
        id: l.id.toString(),
        product: l.product_name,
        stock: l.stock_initial,
        quantitySold: l.quantity_sold,
        remainingStock: l.remaining_stock,
        unitPrice: l.unit_price,
        total: l.total
      })),
      comment: '',
      totalAmount: lines.reduce((sum, l) => sum + l.total, 0),
      createdAt: '',
      updatedAt: ''
    };
  } catch {
    return null;
  }
}

// ============================================
// UTILITAIRES
// ============================================

export function createEmptyLine(): SalesLine {
  return {
    id: Math.random().toString(36) + Date.now().toString(36),
    product: "",
    stock: 0,
    quantitySold: 0,
    remainingStock: 0,
    unitPrice: 0,
    total: 0
  };
}

export function computeLine(line: SalesLine): SalesLine {
  const remainingStock = Math.max(0, line.stock - line.quantitySold);
  const total = line.quantitySold * line.unitPrice;
  return { ...line, remainingStock, total };
}

export function formatDateFR(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('XAF', 'FCFA');
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function verifyBossPin(pin: string): boolean {
  return pin === '100905';
}