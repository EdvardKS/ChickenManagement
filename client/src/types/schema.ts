// Tipos compartidos con el servidor
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  categoryId: number | null;
  featured: boolean | null;
  featuredOrder: number | null;
  deleted: boolean | null;
}

export interface Order {
  id: number;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  customerDNI: string | null;
  customerAddress: string | null;
  quantity: string;
  details: string | null;
  status: string | null;
  pickupTime: Date;
  totalAmount: number | null;
  invoiceNumber: string | null;
  invoicePDF: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deleted: boolean | null;
}