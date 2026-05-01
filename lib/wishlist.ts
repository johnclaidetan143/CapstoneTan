export function getWishlist(): number[] {
  if (typeof window === "undefined") return [];
  const w = localStorage.getItem("wishlist");
  return w ? JSON.parse(w) : [];
}

export function toggleWishlist(productId: number): number[] {
  const list = getWishlist();
  const idx = list.indexOf(productId);
  if (idx > -1) list.splice(idx, 1);
  else list.push(productId);
  localStorage.setItem("wishlist", JSON.stringify(list));
  return list;
}

export function isWishlisted(productId: number): boolean {
  return getWishlist().includes(productId);
}

export function getWishlistCount(): number {
  return getWishlist().length;
}
