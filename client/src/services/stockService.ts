import { api, apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import type { Stock, StockHistory } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';

/**
 * Servicio para gestionar operaciones relacionadas con el stock
 */

// Obtener el stock actual
export async function getCurrentStock(): Promise<Stock> {
  return apiGet('/api/stock');
}

// Obtener historial de stock
export async function getStockHistory(): Promise<StockHistory[]> {
  return apiGet('/api/stock/history');
}

// Añadir stock montado (pollos disponibles)
export async function addMountedStock(quantity: number): Promise<Stock> {
  const result = await apiPost('/api/stock/mounted/add', { quantity });
  // Invalidar consultas relacionadas
  queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
  queryClient.invalidateQueries({ queryKey: ['/api/stock/history'] });
  return result;
}

// Eliminar stock montado
export async function removeMountedStock(quantity: number): Promise<Stock> {
  const result = await apiPost('/api/stock/mounted/remove', { quantity });
  // Invalidar consultas relacionadas
  queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
  queryClient.invalidateQueries({ queryKey: ['/api/stock/history'] });
  return result;
}

// Realizar una corrección de stock montado
export async function correctMountedStock(quantity: number): Promise<Stock> {
  const result = await apiPost('/api/stock/mounted/correction', { quantity });
  // Invalidar consultas relacionadas
  queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
  queryClient.invalidateQueries({ queryKey: ['/api/stock/history'] });
  return result;
}

// Registrar una venta directa (sin pedido)
export async function registerDirectSale(quantity: number): Promise<Stock> {
  const result = await apiPost('/api/stock/direct-sale', { quantity });
  // Invalidar consultas relacionadas
  queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
  queryClient.invalidateQueries({ queryKey: ['/api/stock/history'] });
  return result;
}

// Corregir una venta directa
export async function correctDirectSale(quantity: number): Promise<Stock> {
  const result = await apiPost('/api/stock/direct-sale/correction', { quantity });
  // Invalidar consultas relacionadas
  queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
  queryClient.invalidateQueries({ queryKey: ['/api/stock/history'] });
  return result;
}

// Resetear todo el stock (operación peligrosa)
export async function resetStock(): Promise<Stock> {
  const result = await apiPost('/api/stock/reset', {});
  // Invalidar consultas relacionadas
  queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
  queryClient.invalidateQueries({ queryKey: ['/api/stock/history'] });
  queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
  return result;
}