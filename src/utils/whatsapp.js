export const openWhatsApp = (productName) => {
  const phoneNumber = "1234567890"; // Placeholder phone number
  const message = `Hello, I want to order this product: ${productName}`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
};

export const openWhatsAppCart = (cartItems) => {
  const phoneNumber = "1234567890"; // Placeholder phone number
  
  let message = "Hello, I want to order the following items from my cart:\n\n";
  
  let total = 0;
  cartItems.forEach((item, index) => {
    message += `${index + 1}. ${item.name} - Qty: ${item.quantity}`;
    if (item.price) {
      message += ` ($${(item.price * item.quantity).toFixed(2)})\n`;
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
