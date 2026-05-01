import { allProducts } from "./products";
import { getOrderHistory } from "./orderHistory";
import { getAverageRating, getReviews } from "./reviews";

export type RankedProduct = typeof allProducts[0] & {
  totalSold: number;
  revenue: number;
  avgRating: number;
  reviewCount: number;
};

export function getBestsellers(limit = 6): RankedProduct[] {
  const orders = getOrderHistory();
  const salesMap: Record<number, { totalSold: number; revenue: number }> = {};

  orders
    .filter((o) => o.trackingStatus !== "Cancelled")
    .forEach((o) => {
      o.items.forEach((item) => {
        if (!salesMap[item.productId]) salesMap[item.productId] = { totalSold: 0, revenue: 0 };
        salesMap[item.productId].totalSold += item.quantity;
        salesMap[item.productId].revenue  += item.price * item.quantity;
      });
    });

  return allProducts
    .map((p) => ({
      ...p,
      totalSold:   salesMap[p.id]?.totalSold ?? 0,
      revenue:     salesMap[p.id]?.revenue   ?? 0,
      avgRating:   getAverageRating(p.id),
      reviewCount: getReviews(p.id).length,
    }))
    .filter((p) => p.totalSold > 0)
    .sort((a, b) => b.totalSold - a.totalSold || b.revenue - a.revenue)
    .slice(0, limit);
}

export function getTrending(limit = 6): RankedProduct[] {
  // Trending = highest rated + most reviewed, fallback to newest products if no reviews
  const rated = allProducts
    .map((p) => ({
      ...p,
      totalSold:   0,
      revenue:     0,
      avgRating:   getAverageRating(p.id),
      reviewCount: getReviews(p.id).length,
    }))
    .filter((p) => p.avgRating > 0)
    .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
    .slice(0, limit);

  // If not enough rated products, fill with newest (highest id)
  if (rated.length < limit) {
    const ratedIds = new Set(rated.map((p) => p.id));
    const fallback = allProducts
      .filter((p) => !ratedIds.has(p.id))
      .sort((a, b) => b.id - a.id)
      .slice(0, limit - rated.length)
      .map((p) => ({ ...p, totalSold: 0, revenue: 0, avgRating: 0, reviewCount: 0 }));
    return [...rated, ...fallback];
  }

  return rated;
}
