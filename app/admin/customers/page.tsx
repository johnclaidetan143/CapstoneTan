"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { isAdminLoggedIn } from "@/lib/admin";
import { getOrderHistory } from "@/lib/orderHistory";

type Customer = { name: string; email: string; phone: string; orderCount: number; totalSpent: number; lastOrder: string; };

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAdminLoggedIn()) { router.push("/admin"); return; }
    const orders = getOrderHistory();
    const map: Record<string, Customer> = {};
    orders.forEach((o) => {
      const key = o.customer.name;
      if (!map[key]) map[key] = { name: o.customer.name, email: "", phone: o.customer.phone, orderCount: 0, totalSpent: 0, lastOrder: o.date };
      map[key].orderCount += 1;
      map[key].totalSpent += o.total;
      map[key].lastOrder = o.date;
    });
    // Merge all registered users from API
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => {
        const apiUsers: { name: string; email: string }[] = d.users ?? [];
        apiUsers.forEach((u) => {
          if (!map[u.name]) map[u.name] = { name: u.name, email: u.email, phone: "", orderCount: 0, totalSpent: 0, lastOrder: "—" };
          else if (!map[u.name].email) map[u.name].email = u.email;
        });
        setCustomers(Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent));
      })
      .catch(() => {
        setCustomers(Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent));
      });
  }, [router]);

  if (!mounted) return null;

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div><p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Admin</p><h1 className="text-2xl font-extrabold text-gray-900">Customers</h1></div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="border rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 w-64" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center"><p className="text-2xl font-extrabold text-gray-900">{customers.length}</p><p className="text-xs text-gray-400 mt-1 font-semibold">Total Customers</p></div>
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center"><p className="text-2xl font-extrabold text-amber-600">₱{customers.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()}</p><p className="text-xs text-gray-400 mt-1 font-semibold">Total Revenue</p></div>
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center"><p className="text-2xl font-extrabold text-gray-900">{customers.reduce((s, c) => s + c.orderCount, 0)}</p><p className="text-xs text-gray-400 mt-1 font-semibold">Total Orders</p></div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-5 text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3 border-b border-gray-100">
          <span className="col-span-2">Customer</span><span>Orders</span><span>Total Spent</span><span>Last Order</span>
        </div>
        {filtered.length === 0 ? <div className="p-10 text-center text-gray-400 text-sm">No customers found.</div> : filtered.map((c, i) => (
          <div key={i} className="grid grid-cols-5 items-center px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <div className="col-span-2 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-600 flex-shrink-0">{c.name[0]?.toUpperCase()}</div>
              <div><p className="font-semibold text-sm text-gray-900">{c.name}</p><p className="text-xs text-gray-400">{c.email || "—"}</p></div>
            </div>
            <p className="font-semibold text-sm text-gray-700">{c.orderCount}</p>
            <p className="font-bold text-amber-600 text-sm">₱{c.totalSpent.toLocaleString()}.00</p>
            <p className="text-xs text-gray-500">{c.lastOrder}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
