import { deductStock } from "@/lib/stock";

export type CartItem = {
  productId: number;
  name: string;
  subtitle: string;
  price: number;
  img: string;
  quantity: number;
};

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

export function addToCart(product: { id: number; name: string; subtitle: string; price: number; img: string }) {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      subtitle: product.subtitle,
      price: product.price,
      img: product.img,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  deductStock([{ productId: product.id, quantity: 1 }]);
  return cart;
}

export function updateQuantity(productId: number, quantity: number) {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId);
  if (item) item.quantity = quantity;
  localStorage.setItem("cart", JSON.stringify(cart));
  return cart;
}

export function removeFromCart(productId: number) {
  const cart = getCart().filter((item) => item.productId !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  return cart;
}

export function clearCart() {
  localStorage.removeItem("cart");
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}
