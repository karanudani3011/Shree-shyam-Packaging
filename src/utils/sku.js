/**
 * Generates the next available sequential SKU for a given product category.
 * Suffixes numeric counters to a series prefix based on the selected category.
 * 
 * Series prefix map:
 * - A ➔ Pal Bopp bag
 * - B ➔ tape bopp bag / Bag / Bags
 * - C ➔ PP Bag
 * - E ➔ LD Bag
 * - F ➔ plastic Box / Box
 * - G ➔ Dabbi
 * - H ➔ Fashion / customised card / Cards
 * - I ➔ Cartoon
 * - J ➔ Pati
 * - K ➔ Label
 * - L ➔ Bubble / Polythene
 * - M ➔ customised/small box
 * - N ➔ machines / Machine
 * - O ➔ peach
 * - P ➔ Bags
 * - Q ➔ Tapes
 * - R ➔ Parcel packing items
 * - S ➔ Stationary Roll
 * - T ➔ Koba
 * - U ➔ Ad Metalren
 * - V ➔ Raw Material
 * - W ➔ Soldier Wire
 * - X ➔ All Other Items
 */

export const generateSKU = (category, existingProducts = []) => {
  const prefixMap = {
    'Pal Bopp bag': 'a',
    'tape bopp bag': 'b',
    'PP Bag': 'c',
    'LD Bag': 'e',
    'plastic Box': 'f',
    'Dabbi': 'g',
    'Fashion / customised card': 'h',
    'Cartoon': 'i',
    'Pati': 'j',
    'Label': 'k',
    'Bubble': 'l',
    'customised/small box': 'm',
    'machines': 'n',
    'peach': 'o',
    'Bags': 'p',
    'Tapes': 'q',
    'Parcel packing items': 'r',
    'Stationary': 's',
    'Roll': 't',
    'Koba': 'u',
    'Ad Metalren': 'v',
    'Raw Material': 'w',
    'Soldier Wire': 'x',
    'All Other Items': 'y',

    // User-facing / legacy aliases
    'bags': 'b',
    'Bag': 'b',
    'bag': 'b',
    'cards': 'h',
    'Cards': 'h',
    'Box': 'f',
    'box': 'f',
    'plastic box': 'f',
    'paper boxes': 'm',
    'Polythene': 'l',
    'polythene': 'l',
    'Machine': 'n',
    'machine': 'n',
    'Tap': 'b',
    'tapes': 'q',
    'tape': 'q',
    'parcel': 'r',
  };

  const prefix = prefixMap[category] || 'x';
  const regex = new RegExp(`^${prefix}(\\d+)$`, 'i');
  let maxNum = 0;

  if (Array.isArray(existingProducts)) {
    existingProducts.forEach(p => {
      if (p.sku) {
        const match = p.sku.trim().match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
    });
  }

  return `${prefix}${maxNum + 1}`;
};
