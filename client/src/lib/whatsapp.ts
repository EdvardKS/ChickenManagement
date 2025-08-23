import type { Order } from "@shared/schema";

/**
 * Generates a WhatsApp message URL with order details
 * @param order - The order object containing customer and order information
 * @param phoneNumber - The WhatsApp phone number (optional, defaults to restaurant number)
 * @param messageType - Type of message: 'confirmation' | 'reminder' | 'custom'
 * @returns WhatsApp web/app URL with pre-filled message
 */
export function generateWhatsAppMessage(
  order: Order, 
  phoneNumber?: string, 
  messageType: 'confirmation' | 'reminder' | 'custom' = 'confirmation'
): string {
  // Default restaurant phone number (replace with actual number)
  const defaultPhone = "34123456789"; // Replace with actual restaurant WhatsApp number
  const targetPhone = phoneNumber || order.customerPhone || defaultPhone;
  
  // Clean phone number (remove spaces, dashes, etc.)
  const cleanPhone = targetPhone.replace(/[^\d+]/g, '');
  
  // Format pickup time
  const pickupDate = new Date(order.pickupTime);
  const formattedDate = pickupDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = pickupDate.toISOString().substring(11, 16);

  // Format quantity
  const quantity = parseFloat(order.quantity.toString());
  const quantityText = quantity === 1 ? '1 pollo' : 
                      quantity === 0.5 ? 'medio pollo' : 
                      `${quantity} pollos`;

  // Generate message based on type
  let message = '';
  
  switch (messageType) {
    case 'confirmation':
      message = `¡Hola ${order.customerName}! 👋

Tu pedido ha sido confirmado:

🐔 *Cantidad:* ${quantityText}
📅 *Fecha de recogida:* ${formattedDate}
🕐 *Hora de recogida:* ${formattedTime}
💰 *Total:* ${order.totalAmount ? `${parseFloat(order.totalAmount.toString()).toFixed(2)}€` : 'Por confirmar'}

${order.details ? `📝 *Detalles:* ${order.details}\n\n` : ''}Te esperamos en la hora acordada. ¡Gracias por tu confianza!

*Restaurante* 🍽️`;
      break;

    case 'reminder':
      message = `¡Hola ${order.customerName}! 👋

Te recordamos que tienes tu pedido programado para hoy:

🐔 *Cantidad:* ${quantityText}  
🕐 *Hora de recogida:* ${formattedTime}
💰 *Total:* ${order.totalAmount ? `${parseFloat(order.totalAmount.toString()).toFixed(2)}€` : 'Por confirmar'}

¡Te esperamos!

*Restaurante* 🍽️`;
      break;

    case 'custom':
      message = `Pedido #${order.id} - ${order.customerName}
${quantityText} - ${formattedDate} ${formattedTime}`;
      break;

    default:
      message = `Información del pedido: ${quantityText} para ${order.customerName}`;
  }

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Generate WhatsApp URL
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  
  return whatsappUrl;
}

/**
 * Opens WhatsApp with the pre-filled message
 * @param order - The order object
 * @param phoneNumber - Optional phone number to send to
 * @param messageType - Type of message to send
 */
export function sendWhatsAppMessage(
  order: Order, 
  phoneNumber?: string, 
  messageType: 'confirmation' | 'reminder' | 'custom' = 'confirmation'
): void {
  const url = generateWhatsAppMessage(order, phoneNumber, messageType);
  window.open(url, '_blank');
}

/**
 * Validates if a phone number can be used for WhatsApp
 * @param phoneNumber - Phone number to validate
 * @returns boolean indicating if the number is valid
 */
export function isValidWhatsAppNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return false;
  
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Check if it's a valid international format (starts with +)
  // or has at least 9 digits (minimum for most countries)
  return cleaned.length >= 9 && (cleaned.startsWith('+') || cleaned.length >= 10);
}