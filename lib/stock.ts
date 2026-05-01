import { allProducts } from "./products";

export type StockMap = Record<number, number>;

const DEFAULT_STOCK = 10;

export function getStock(): StockMap {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem("stockMap");
  if (!stored) {
    const initial: StockMap = {};
    allProducts.forEach((p) => { initial[p.id] = DEFAULT_STOCK; });
    localStorage.setItem("stockMap", JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
}

export function getProductStock(productId: number): number {
  return getStock()[productId] ?? DEFAULT_STOCK;
}

export function setProductStock(productId: number, qty: number) {
  const stock = getStock();
  stock[productId] = Math.max(0, qty);
  localStorage.setItem("stockMap", JSON.stringify(stock));
}

export function saveStockMap(map: StockMap) {
  localStorage.setItem("stockMap", JSON.stringify(map));
}

// Deduct stock for all items in an order
export function deductStock(items: { productId: number; quantity: number }[]) {
  const stock = getStock();
  items.forEach(({ productId, quantity }) => {
    stock[productId] = Math.max(0, (stock[productId] ?? DEFAULT_STOCK) - quantity);
  });
  localStorage.setItem("stockMap", JSON.stringify(stock));
}

// Restore stock when order is cancelled
export function restoreStock(items: { productId: number; quantity: number }[]) {
  const stock = getStock();
  items.forEach(({ productId, quantity }) => {
    stock[productId] = (stock[productId] ?? 0) + quantity;
  });
  localStorage.setItem("stockMap", JSON.stringify(stock));
}

export function getStockLabel(qty: number): { label: string; color: string } | null {
  if (qty === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-600" };
  if (qty <= 3)  return { label: `Only ${qty} left!`, color: "bg-orange-100 text-orange-600" };
  if (qty <= 5)  return { label: `${qty} left`, color: "bg-yellow-100 text-yellow-600" };
  return null;
}

export function getLowStockProducts(): { id: number; name: string; qty: number }[] {
  const stock = getStock();
  return allProducts
    .filter((p) => (stock[p.id] ?? DEFAULT_STOCK) <= 3)
    .map((p) => ({ id: p.id, name: p.name, qty: stock[p.id] ?? DEFAULT_STOCK }));
}
