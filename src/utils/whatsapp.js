export const openWhatsApp = (productName) => {
  const phoneNumber = "1234567890"; // Placeholder phone number
  const message = `Hello, I want to order this product: ${productName}`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
};
