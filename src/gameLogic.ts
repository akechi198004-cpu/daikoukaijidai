import { Port, Product } from './types';
import { PORTS } from './data';

export function calculatePrice(product: Product, portId: string): number {
  const port = PORTS.find(p => p.id === portId);
  const modifier = port?.priceModifiers[product.id] || 1;
  return Math.floor(product.basePrice * modifier);
}

export function getUsedCapacity(cargo: Record<string, number>, products: Product[]): number {
  let used = 0;
  Object.keys(cargo).forEach(itemId => {
    const p = products.find(prod => prod.id === itemId);
    if (p) used += cargo[itemId] * p.volume;
  });
  return used;
}

export function calculateTravelDays(port1: Port, port2: Port): number {
  const dx = port1.x - port2.x;
  const dy = port1.y - port2.y;
  const distance = Math.hypot(dx, dy);
  return Math.max(1, Math.ceil(distance / 5));
}

export function generateMarketHint(portId: string, products: Product[]): string {
  const port = PORTS.find(p => p.id === portId)!;
  let bestToBuy = products[0];
  let bestToSell = products[0];
  
  products.forEach(p => {
    if (port.priceModifiers[p.id] < port.priceModifiers[bestToBuy.id]) bestToBuy = p;
    if (port.priceModifiers[p.id] > port.priceModifiers[bestToSell.id]) bestToSell = p;
  });

  return `近期流传：本港的[${bestToBuy.name}]大丰收价格走低，而无数商人正溢价收购[${bestToSell.name}]！`;
}
