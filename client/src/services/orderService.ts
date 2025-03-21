import { api, apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import type { Order } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';

/**
 * Servicio para gestionar operaciones relacionadas con órdenes
 */

// Obtener todas las órdenes
export async function getOrders(): Promise<Order[]> {
  return apiGet('/api/orders');
}

// Obtener una orden específica
export async function getOrder(id: number): Promise<Order> {
  return apiGet(`/api/orders/${id}`);
}

// Crear una nueva orden
export async function createOrder(orderData: any): Promise<Order> {
  const result = await apiPost('/api/orders', orderData);
  // Invalidar consultas relacionadas
  queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
  queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
  return result;
}

// Actualizar una orden existente
export async function updateOrder(id: number, orderData: any): Promise<Order> {
  const result = await apiPatch(`/api/orders/${id}`, orderData);
  // Invalidar consultas relacionadas
  queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
  queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
  return result;
}

// Confirmar entrega de una orden
export async function confirmOrder(id: number): Promise<Order> {
  const result = await apiPatch(`/api/orders/${id}/confirm`, {});
  // Invalidar consultas relacionadas
  queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
  queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
  return result;
}

// Cancelar una orden
export async function cancelOrder(id: number): Promise<Order> {
  const result = await apiPatch(`/api/orders/${id}/cancel`, {});
  // Invalidar consultas relacionadas
  queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
  queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
  return result;
}

// Marcar una orden como error
export async function markOrderAsError(id: number): Promise<Order> {
  const result = await apiPatch(`/api/orders/${id}/error`, {});
  // Invalidar consultas relacionadas
  queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
  queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
  return result;
}