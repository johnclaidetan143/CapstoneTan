"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { isAdminLoggedIn } from "@/lib/admin";
import { getAdminProducts, saveAdminProducts, AdminProduct } from "@/lib/adminProducts";

const SLUG_MAP: Record<string, string> = {
  "Bouquet": "bouquet", "Flower Pot": "flower-pot", "Keychain": "keychain",
};

const CSV_TEMPLATE = `name,subtitle,price,category,img
Red Bouquet,Classic Romance,120,Bouquet,/static/images/products/red-bouquet.jpg
Chenipot Daisy,Bright & Blooming,160,Flower Pot,/static/images/products/chenipot-daisy.png
Fuzz Mirror,Fluffy & Unique,200,Keychain,/static/images/products/fuzz-mirror.jpg`;

export default function AdminImportPage() {
  const router = useRouter();
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<Omit<AdminProduct, "id">[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace("/admin"); return; }
  }, [router]);

  function parseCSV(text: string): Omit<AdminProduct, "id">[] {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const required = ["name", "subtitle", "price", "category", "img"];
    for (const r of required) {
      if (!headers.includes(r)) throw new Error(`Missing column: "${r}"`);
    }
    return lines.slice(1).map((line, i) => {
      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] ?? ""; });
      if (!row.name) throw new Error(`Row ${i + 2}: name is required`);
      if (!row.category || !SLUG_MAP[row.category]) throw new Error(`Row ${i + 2}: category must be Bouquet, Flower Pot, or Keychain`);
      const price = Number(row.price);
      if (isNaN(price) || price <= 0) throw new Error(`Row ${i + 2}: price must be a positive number`);
      return { name: row.name, subtitle: row.subtitle, price, category: row.category, slug: SLUG_MAP[row.category], img: row.img };
    });
  }

  function handlePreview() {
    setError(""); setSuccess(""); setPreview([]);
    try {
      const parsed = parseCSV(csvText);
      setPreview(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid CSV");
    }
  }

  function handleImport() {
    if (preview.length === 0) return;
    const existing = getAdminProducts();
    const maxId = Math.max(...existing.map((p) => p.id), 0);
    const newProducts: AdminProduct[] = preview.map((p, i) => ({ ...p, id: maxId + i + 1 }));
    saveAdminProducts([...existing, ...newProducts]);
    setSuccess(`✅ ${newProducts.length} products imported successfully!`);
    setPreview([]);
    setCsvText("");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target?.result as string ?? "");
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "products-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-amber-600 font-bold tracking-widest uppercase mb-1">Admin</p>
          <h1 className="text-2xl font-extrabold text-gray-900">Bulk Import Products</h1>
        </div>
        <button onClick={downloadTemplate}
          className="text-xs font-semibold text-amber-600 border border-amber-300 hover:bg-amber-50 px-4 py-2 rounded-full transition-colors">
          ⬇ Download CSV Template
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">CSV Format</p>
        <code className="block bg-gray-50 rounded-xl p-3 text-xs text-gray-600 font-mono">
          name,subtitle,price,category,img<br />
          Red Bouquet,Classic Romance,120,Bouquet,/static/images/products/red-bouquet.jpg
        </code>
        <p className="text-xs text-gray-400 mt-2">Category must be exactly: <span className="font-semibold">Bouquet</span>, <span className="font-semibold">Flower Pot</span>, or <span className="font-semibold">Keychain</span></p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">Upload CSV File</label>
          <input type="file" accept=".csv" onChange={handleFileUpload}
            className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">Or Paste CSV Content</label>
          <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={6}
            placeholder="name,subtitle,price,category,img&#10;Red Bouquet,Classic Romance,120,Bouquet,/red.jpg"
            className="border rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono resize-none" />
        </div>

        {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
        {success && <p className="text-xs text-green-500 font-semibold">{success}</p>}

        <div className="flex gap-3">
          <button onClick={handlePreview}
            className="bg-gray-900 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors">
            Preview
          </button>
          {preview.length > 0 && (
            <button onClick={handleImport}
              className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors">
              Import {preview.length} Products
            </button>
          )}
        </div>
      </div>

      {preview.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-5">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900">Preview — {preview.length} products to import</p>
          </div>
          <div className="grid grid-cols-5 text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3 border-b border-gray-100">
            <span className="col-span-2">Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Image</span>
          </div>
          {preview.map((p, i) => (
            <div key={i} className="grid grid-cols-5 items-center px-5 py-3 border-b border-gray-50">
              <div className="col-span-2">
                <p className="font-semibold text-sm text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-400">{p.subtitle}</p>
              </div>
              <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full w-fit">{p.category}</span>
              <p className="font-bold text-gray-800 text-sm">₱{p.price}.00</p>
              <p className="text-xs text-gray-500 truncate">{p.img}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
