export type OrderRecord = {
  orderNumber: string;
  date: string;
  items: { productId: number; name: string; subtitle: string; price: number; img: string; quantity: number }[];
  total: number;
  customer: { name: string; phone: string; address: string; city: string };
  payment: {
    method: string;
    bank: string | null;
    accountUsed: string | null;
    referenceNumber: string;
    status: string;
  };
  trackingStatus: "Pending Verification" | "Pending Payment" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  cancelledAt?: string;
  notificationRead?: boolean;
};

export function getOrderHistory(): OrderRecord[] {
  if (typeof window === "undefined") return [];
  const h = localStorage.getItem("orderHistory");
  return h ? JSON.parse(h) : [];
}

export function saveOrder(order: OrderRecord) {
  const history = getOrderHistory();
  history.unshift({ ...order, notificationRead: false });
  localStorage.setItem("orderHistory", JSON.stringify(history));
  window.dispatchEvent(new Event("orderUpdated"));
}

export function updateOrder(orderNumber: string, updates: Partial<OrderRecord>) {
  const history = getOrderHistory().map((o) =>
    o.orderNumber === orderNumber ? { ...o, ...updates } : o
  );
  localStorage.setItem("orderHistory", JSON.stringify(history));
  return history;
}

export function getUnreadNotifications(): OrderRecord[] {
  return getOrderHistory().filter((o) => !o.notificationRead);
}

export function markAllNotificationsRead() {
  const history = getOrderHistory().map((o) => ({ ...o, notificationRead: true }));
  localStorage.setItem("orderHistory", JSON.stringify(history));
}
