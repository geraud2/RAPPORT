// src/lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURATION
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase: Variables d\'environnement manquantes !');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ============================================
// GESTION DES EMPLOYÉS (À AJOUTER)
// ============================================

export interface Employee {
  id: number;
  name: string;
  code: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

// Vérifier si un employé existe par son code
export async function getEmployeeByCode(code: string): Promise<Employee | null> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();
    
    if (error) return null;
    return data;
  } catch (error) {
    console.error('Erreur getEmployeeByCode:', error);
    return null;
  }
}

// Enregistrer un nouvel employé
export async function registerEmployee(name: string, code: string): Promise<Employee | null> {
  try {
    // Vérifier si le code existe déjà
    const existing = await getEmployeeByCode(code);
    if (existing) {
      throw new Error("Ce code existe déjà");
    }
    
    const { data, error } = await supabase
      .from('employees')
      .insert({ name, code, is_active: true })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur registerEmployee:', error);
    return null;
  }
}

// Mettre à jour la date de dernier login
export async function updateEmployeeLastLogin(employeeId: number): Promise<void> {
  try {
    await supabase
      .from('employees')
      .update({ last_login: new Date().toISOString() })
      .eq('id', employeeId);
  } catch (error) {
    console.error('Erreur updateEmployeeLastLogin:', error);
  }
}

// Récupérer tous les employés (pour le boss)
export async function getAllEmployees(): Promise<Employee[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur getAllEmployees:', error);
    return [];
  }
}

// ============================================
// TYPES
// ============================================

export interface Product {
  id: number;
  name: string;
  stock: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: number;
  date: string;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  comment: string;
  created_at: string;
}

export interface DailyReportData {
  id: number;
  date: string;
  total_amount: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ReportLine {
  id: number;
  report_date: string;
  product_name: string;
  stock_initial: number;
  quantity_sold: number;
  remaining_stock: number;
  unit_price: number;
  total: number;
}

// ============================================
// FONCTIONS PRODUITS
// ============================================

/**
 * Récupérer tous les produits
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Erreur getAllProducts:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('❌ Exception getAllProducts:', error);
    return [];
  }
}

/**
 * Récupérer un produit par son nom
 */
export async function getProductByName(productName: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('name', productName)
      .maybeSingle();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('❌ Erreur getProductByName:', error);
      }
      return null;
    }
    return data;
  } catch (error) {
    console.error('❌ Exception getProductByName:', error);
    return null;
  }
}

/**
 * Récupérer le stock d'un produit
 */
export async function getProductStock(productName: string): Promise<number> {
  try {
    const product = await getProductByName(productName);
    return product?.stock ?? 0;
  } catch (error) {
    console.error('❌ Erreur getProductStock:', error);
    return 0;
  }
}

/**
 * Récupérer le prix d'un produit
 */
export async function getProductPrice(productName: string): Promise<number> {
  try {
    const product = await getProductByName(productName);
    return product?.unit_price ?? 0;
  } catch (error) {
    console.error('❌ Erreur getProductPrice:', error);
    return 0;
  }
}

/**
 * Mettre à jour le stock d'un produit
 */
export async function updateProductStock(productName: string, newStock: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ 
        stock: newStock, 
        updated_at: new Date().toISOString() 
      })
      .eq('name', productName);

    if (error) {
      console.error('❌ Erreur updateProductStock:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('❌ Exception updateProductStock:', error);
    return false;
  }
}

/**
 * Sauvegarder le prix d'un produit
 */
export async function setProductPriceSupabase(productName: string, price: number): Promise<boolean> {
  try {
    const existing = await getProductByName(productName);
    
    if (existing) {
      const { error } = await supabase
        .from('products')
        .update({ 
          unit_price: price, 
          updated_at: new Date().toISOString() 
        })
        .eq('name', productName);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('products')
        .insert({ 
          name: productName, 
          unit_price: price, 
          stock: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur setProductPriceSupabase:', error);
    return false;
  }
}

/**
 * Créer ou mettre à jour un produit
 */
export async function upsertProduct(
  name: string,
  stock: number,
  unitPrice: number
): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .upsert(
        {
          name,
          stock,
          unit_price: unitPrice,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'name' }
      )
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur upsertProduct:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('❌ Exception upsertProduct:', error);
    return null;
  }
}

/**
 * Supprimer un produit
 */
export async function deleteProduct(productName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('name', productName);

    if (error) {
      console.error('❌ Erreur deleteProduct:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('❌ Exception deleteProduct:', error);
    return false;
  }
}

/**
 * Récupérer toutes les informations des produits (stock + prix)
 */
export async function getAllProductsInfo(): Promise<{ name: string; stock: number; price: number }[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('name, stock, unit_price')
      .order('name');
    
    if (error) {
      console.error('❌ Erreur getAllProductsInfo:', error);
      return [];
    }
    
    return data.map(p => ({ 
      name: p.name, 
      stock: p.stock || 0, 
      price: p.unit_price || 0 
    }));
  } catch (error) {
    console.error('❌ Exception getAllProductsInfo:', error);
    return [];
  }
}

// ============================================
// FONCTIONS VENTES
// ============================================

/**
 * Enregistrer une vente
 */
export async function saveSale(
  date: string,
  productName: string,
  quantity: number,
  unitPrice: number,
  total: number,
  comment: string = ''
): Promise<Sale | null> {
  try {
    // 1. S'assurer que le produit existe
    let product = await getProductByName(productName);
    
    if (!product) {
      product = await upsertProduct(productName, 0, unitPrice);
    }
    
    if (!product) {
      console.error('❌ Impossible de créer/récupérer le produit');
      return null;
    }
    
    // 2. Enregistrer la vente
    const { data, error } = await supabase
      .from('sales')
      .insert({
        date,
        product_id: product.id,
        product_name: productName,
        quantity,
        unit_price: unitPrice,
        total,
        comment,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur saveSale:', error);
      return null;
    }
    
    // 3. Mettre à jour le stock
    const newStock = Math.max(0, (product.stock || 0) - quantity);
    await updateProductStock(productName, newStock);
    
    return data;
  } catch (error) {
    console.error('❌ Exception saveSale:', error);
    return null;
  }
}

/**
 * Récupérer les ventes par date
 */
export async function getSalesByDate(date: string): Promise<Sale[]> {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erreur getSalesByDate:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('❌ Exception getSalesByDate:', error);
    return [];
  }
}

/**
 * Récupérer les ventes par période
 */
export async function getSalesByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('❌ Erreur getSalesByDateRange:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('❌ Exception getSalesByDateRange:', error);
    return [];
  }
}

/**
 * Supprimer une vente
 */
export async function deleteSale(saleId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', saleId);

    if (error) {
      console.error('❌ Erreur deleteSale:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('❌ Exception deleteSale:', error);
    return false;
  }
}

// ============================================
// FONCTIONS RAPPORTS QUOTIDIENS
// ============================================

/**
 * Sauvegarder un rapport quotidien complet
 */
export async function saveDailyReport(
  date: string,
  totalAmount: number,
  comment: string,
  lines: {
    product: string;
    stock: number;
    quantitySold: number;
    remainingStock: number;
    unitPrice: number;
    total: number;
  }[]
): Promise<boolean> {
  try {
    // 1. Sauvegarder le rapport principal
    const { error: reportError } = await supabase
      .from('daily_reports')
      .upsert(
        {
          date,
          total_amount: totalAmount,
          comment,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'date' }
      );

    if (reportError) {
      console.error('❌ Erreur saveDailyReport (report):', reportError);
      return false;
    }

    // 2. Supprimer les anciennes lignes
    await supabase
      .from('report_lines')
      .delete()
      .eq('report_date', date);

    // 3. Ajouter les nouvelles lignes
    for (const line of lines) {
      const { error: lineError } = await supabase
        .from('report_lines')
        .insert({
          report_date: date,
          product_name: line.product,
          stock_initial: line.stock,
          quantity_sold: line.quantitySold,
          remaining_stock: line.remainingStock,
          unit_price: line.unitPrice,
          total: line.total,
        });

      if (lineError) {
        console.error('❌ Erreur insert line:', lineError);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Exception saveDailyReport:', error);
    return false;
  }
}

/**
 * Récupérer un rapport quotidien par date
 */
export async function getDailyReport(date: string): Promise<{
  date: string;
  totalAmount: number;
  comment: string;
  lines: {
    id: number;
    product_name: string;
    stock_initial: number;
    quantity_sold: number;
    remaining_stock: number;
    unit_price: number;
    total: number;
  }[];
} | null> {
  try {
    // 1. Récupérer le rapport principal
    const { data: report, error: reportError } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('date', date)
      .maybeSingle();

    if (reportError) {
      console.error('❌ Erreur getDailyReport:', reportError);
      return null;
    }

    // 2. Récupérer les lignes
    const { data: lines, error: linesError } = await supabase
      .from('report_lines')
      .select('*')
      .eq('report_date', date);

    if (linesError) {
      console.error('❌ Erreur getReportLines:', linesError);
    }

    return {
      date: date,
      totalAmount: report?.total_amount || 0,
      comment: report?.comment || '',
      lines: lines || [],
    };
  } catch (error) {
    console.error('❌ Exception getDailyReport:', error);
    return null;
  }
}

/**
 * Récupérer toutes les dates qui ont des rapports
 */
export async function getDatesWithReports(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('date')
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ Erreur getDatesWithReports:', error);
      return [];
    }
    return data.map(d => d.date);
  } catch (error) {
    console.error('❌ Exception getDatesWithReports:', error);
    return [];
  }
}

// ============================================
// FONCTIONS STATISTIQUES
// ============================================

export interface SalesStats {
  totalRevenue: number;
  avgPerDay: number;
  bestDay: { date: string; amount: number } | null;
  bestProduct: { name: string; totalQuantity: number; totalRevenue: number } | null;
  totalDays: number;
  totalProductsSold: number;
}

/**
 * Calculer les statistiques globales
 */
export async function getSalesStats(): Promise<SalesStats> {
  try {
    // Récupérer tous les rapports
    const { data: reports, error: reportsError } = await supabase
      .from('daily_reports')
      .select('*');

    if (reportsError) {
      console.error('❌ Erreur getSalesStats:', reportsError);
      return {
        totalRevenue: 0,
        avgPerDay: 0,
        bestDay: null,
        bestProduct: null,
        totalDays: 0,
        totalProductsSold: 0,
      };
    }

    if (!reports || reports.length === 0) {
      return {
        totalRevenue: 0,
        avgPerDay: 0,
        bestDay: null,
        bestProduct: null,
        totalDays: 0,
        totalProductsSold: 0,
      };
    }

    // Total des ventes et meilleur jour
    let totalRevenue = 0;
    let bestDay: { date: string; amount: number } | null = null;

    for (const report of reports) {
      totalRevenue += report.total_amount;
      if (!bestDay || report.total_amount > bestDay.amount) {
        bestDay = { date: report.date, amount: report.total_amount };
      }
    }

    // Récupérer toutes les ventes pour les produits
    const { data: allSales, error: salesError } = await supabase
      .from('sales')
      .select('product_name, quantity, total');

    if (salesError) {
      console.error('❌ Erreur getSalesStats (sales):', salesError);
      return {
        totalRevenue,
        avgPerDay: totalRevenue / reports.length,
        bestDay,
        bestProduct: null,
        totalDays: reports.length,
        totalProductsSold: 0,
      };
    }

    // Calculer le meilleur produit
    const productMap: Record<string, { quantity: number; revenue: number }> = {};
    let totalProductsSold = 0;

    for (const sale of allSales || []) {
      if (!productMap[sale.product_name]) {
        productMap[sale.product_name] = { quantity: 0, revenue: 0 };
      }
      productMap[sale.product_name].quantity += sale.quantity;
      productMap[sale.product_name].revenue += sale.total;
      totalProductsSold += sale.quantity;
    }

    let bestProduct: { name: string; totalQuantity: number; totalRevenue: number } | null = null;
    for (const [name, data] of Object.entries(productMap)) {
      if (!bestProduct || data.revenue > bestProduct.totalRevenue) {
        bestProduct = {
          name,
          totalQuantity: data.quantity,
          totalRevenue: data.revenue,
        };
      }
    }

    return {
      totalRevenue,
      avgPerDay: totalRevenue / reports.length,
      bestDay,
      bestProduct,
      totalDays: reports.length,
      totalProductsSold,
    };
  } catch (error) {
    console.error('❌ Exception getSalesStats:', error);
    return {
      totalRevenue: 0,
      avgPerDay: 0,
      bestDay: null,
      bestProduct: null,
      totalDays: 0,
      totalProductsSold: 0,
    };
  }
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Vérifier la connexion à Supabase
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Connexion Supabase échouée:', error);
      return false;
    }
    console.log('✅ Connexion Supabase établie');
    return true;
  } catch (error) {
    console.error('❌ Exception checkConnection:', error);
    return false;
  }
}

/**
 * Nettoyer toutes les données (pour test)
 */
export async function clearAllData(): Promise<void> {
  try {
    await supabase.from('report_lines').delete().neq('id', 0);
    await supabase.from('daily_reports').delete().neq('id', 0);
    await supabase.from('sales').delete().neq('id', 0);
    await supabase.from('products').delete().neq('id', 0);
    console.log('🗑️ Toutes les données ont été supprimées');
  } catch (error) {
    console.error('❌ Erreur clearAllData:', error);
  }
}

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default supabase;