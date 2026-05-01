export type Review = {
  id: number;
  productId: number;
  orderNumber: string;
  reviewer: string;
  rating: number; // 1-5
  comment: string;
  date: string;
};

export function getReviews(productId: number): Review[] {
  if (typeof window === "undefined") return [];
  const all = localStorage.getItem("reviews");
  const parsed: Review[] = all ? JSON.parse(all) : [];
  return parsed.filter((r) => r.productId === productId);
}

export function getAllReviews(): Review[] {
  if (typeof window === "undefined") return [];
  const all = localStorage.getItem("reviews");
  return all ? JSON.parse(all) : [];
}

export function saveReview(review: Omit<Review, "id" | "date">) {
  const all = getAllReviews();
  // prevent duplicate review per order per product
  const exists = all.find((r) => r.orderNumber === review.orderNumber && r.productId === review.productId);
  if (exists) return false;
  all.push({ ...review, id: Date.now(), date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) });
  localStorage.setItem("reviews", JSON.stringify(all));
  return true;
}

export function hasReviewed(orderNumber: string, productId: number): boolean {
  return getAllReviews().some((r) => r.orderNumber === orderNumber && r.productId === productId);
}

export function getAverageRating(productId: number): number {
  const reviews = getReviews(productId);
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
