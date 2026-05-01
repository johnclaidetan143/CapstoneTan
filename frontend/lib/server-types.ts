export type Product = {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  category: string;
  slug: string;
  img: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

export type OrderItem = {
  productId: number;
  name: string;
  subtitle: string;
  price: number;
  img: string;
  quantity: number;
};

export type OrderRecord = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  payment: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
};
