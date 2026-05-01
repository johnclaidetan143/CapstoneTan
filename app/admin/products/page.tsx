"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { getAdminProducts, addAdminProduct, updateAdminProduct, deleteAdminProduct, AdminProduct } from "@/lib/adminProducts";
import { isAdminLoggedIn } from "@/lib/admin";
import { getStock, setProductStock, StockMap, getStockLabel } from "@/lib/stock";

const CATEGORIES = ["Bouquet", "Flower Pot", "Keychain"];
const SLUG_MAP: Record<string, string> = { "Bouquet": "bouquet", "Flower Pot": "flower-pot", "Keychain": "keychain" };

const empty = { name: "", subtitle: "", price: 0, category: "Bouquet", slug: "bouquet", img: "" };

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [stock, setStock] = useState<StockMap>({});
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState<Omit<AdminProduct, "id">>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace("/admin"); return; }
    setProducts(getAdminProducts());
    setStock(getStock());
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const updated = { ...form, [name]: name === "price" ? Number(value) : value };
    if (name === "category") updated.slug = SLUG_MAP[value] ?? "bouquet";
    setForm(updated);
  }

  function handleStockChange(id: number, qty: number) {
    setProductStock(id, qty);
    setStock((prev) => ({ ...prev, [id]: qty }));
  }

  function openAdd() { setForm(empty); setModal("add"); }

  function openEdit(p: AdminProduct) {
    setForm({ name: p.name, subtitle: p.subtitle, price: p.price, category: p.category, slug: p.slug, img: p.img });
    setEditId(p.id);
    setModal("edit");
  }

  function handleSave() {
    if (!form.name.trim() || !form.img.trim() || form.price <= 0) return;
    if (modal === "add") setProducts(addAdminProduct(form));
    else if (modal === "edit" && editId !== null) setProducts(updateAdminProduct({ ...form, id: editId }));
    setModal(null);
  }

  function handleDelete(id: number) {
    if (!confirm("Delete this product?")) return;
    setProducts(deleteAdminProduct(id));
  }

  const filtered = products
    .filter((p) => filterCat === "All" || p.category === filterCat)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const inputClass = "border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 w-full";

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Admin</p>
          <h1 className="text-2xl font-extrabold text-gray-900">Products</h1>
        </div>
        <button onClick={openAdd}
          className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors">
          + Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        {["All", ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filterCat === c ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400"
            }`}>
            {c}
          </button>
        ))}
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="ml-auto border rounded-xl px-4 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 w-52" />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3 border-b border-gray-100">
          <span className="col-span-2">Product</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Image</span>
          <span className="text-right">Actions</span>
        </div>
        {filtered.map((p) => {
          const qty = stock[p.id] ?? 10;
          const stockLabel = getStockLabel(qty);
          return (
          <div key={p.id} className="grid grid-cols-7 items-center px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <div className="col-span-2">
              <p className="font-semibold text-sm text-gray-900">{p.name}</p>
              <p className="text-xs text-gray-400">{p.subtitle}</p>
            </div>
            <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full w-fit">{p.category}</span>
            <p className="font-bold text-gray-800 text-sm">₱{p.price}.00</p>
            <div className="flex items-center gap-1">
              <input type="number" min={0} value={qty}
                onChange={(e) => handleStockChange(p.id, Number(e.target.value))}
                className="w-14 border rounded-lg px-2 py-1 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-300" />
              {stockLabel && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stockLabel.color}`}>{stockLabel.label}</span>}
            </div>
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
              {p.img && <Image src={p.img} alt={p.name} width={40} height={40} className="w-full h-full object-cover" />}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => openEdit(p)} className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors">Edit</button>
              <button onClick={() => handleDelete(p.id)} className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">Delete</button>
            </div>
          </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">No products found.</div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
            <h2 className="font-extrabold text-gray-900 text-lg">{modal === "add" ? "Add Product" : "Edit Product"}</h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Product Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Red Bouquet" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Subtitle</label>
              <input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="e.g. Classic Romance" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Price (₱)</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} min={1} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Category</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Image filename (from /public)</label>
              <input name="img" value={form.img} onChange={handleChange} placeholder="e.g. /red.jpg" className={inputClass} />
              {form.img && (
                <div className="mt-1 w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                  <Image src={form.img} alt="preview" width={64} height={64} className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={handleSave}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-2.5 rounded-full text-sm transition-colors">
                {modal === "add" ? "Add Product" : "Save Changes"}
              </button>
              <button onClick={() => setModal(null)}
                className="flex-1 border border-gray-200 hover:border-gray-400 text-gray-600 font-semibold py-2.5 rounded-full text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
