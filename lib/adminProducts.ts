import { allProducts } from "./products";

export type AdminProduct = {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  category: string;
  slug: string;
  img: string;
};

export function getAdminProducts(): AdminProduct[] {
  if (typeof window === "undefined") return allProducts;
  const stored = localStorage.getItem("adminProducts");
  if (!stored) {
    localStorage.setItem("adminProducts", JSON.stringify(allProducts));
    return allProducts;
  }
  return JSON.parse(stored);
}

export function saveAdminProducts(products: AdminProduct[]) {
  localStorage.setItem("adminProducts", JSON.stringify(products));
}

export function addAdminProduct(product: Omit<AdminProduct, "id">) {
  const products = getAdminProducts();
  const newId = Math.max(...products.map((p) => p.id), 0) + 1;
  const updated = [...products, { ...product, id: newId }];
  saveAdminProducts(updated);
  return updated;
}

export function updateAdminProduct(updated: AdminProduct) {
  const products = getAdminProducts().map((p) => (p.id === updated.id ? updated : p));
  saveAdminProducts(products);
  return products;
}

export function deleteAdminProduct(id: number) {
  const products = getAdminProducts().filter((p) => p.id !== id);
  saveAdminProducts(products);
  return products;
}
