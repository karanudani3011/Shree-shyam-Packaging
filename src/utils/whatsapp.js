export const openWhatsApp = (productName, details = {}) => {
  const phoneNumber = "919574504098"; 

  let message = `Hello, I want to order this product:\n\n`;
  message += `Product: ${productName}\n`;
  if (details.sku) message += `SKU: ${details.sku}\n`;
  if (details.dimensions) message += `Dimensions: ${details.dimensions}\n`;
  if (details.material) message += `Material: ${details.material}\n`;

  if (details.name || details.phone) {
    message += `\nCustomer Details:\n`;
    if (details.name) message += `Name: ${details.name}\n`;
    if (details.phone) message += `Mobile: ${details.phone}\n`;
  }

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
};

export const openWhatsAppCart = (cartItems) => {
  const phoneNumber = "919574504098"; 

  let message = "Hello, I want to order the following items from my cart:\n\n";

  let total = 0;
  cartItems.forEach((item, index) => {
    message += `${index + 1}. ${item.name} - Qty: ${item.quantity}`;
    if (item.price) {
      message += ` (₹${(item.price * item.quantity).toFixed(2)})\n`;
      total += (item.price * item.quantity);
    } else {
      message += ` (Price on Request)\n`;
    }
  });

  if (total > 0) {
    message += `\nEstimated Total: $${total.toFixed(2)}`;
  }

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
};
