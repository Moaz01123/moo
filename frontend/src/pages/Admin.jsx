import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { money } from "../lib/format";

const EMPTY_PRODUCT = {
  name: "",
  price: 0,
  stock: 0,
  description: "",
  sizes: "S,M,L,XL",
  category_id: "",
  accent: "#1a1a1a",
  drop_label: "",
  featured: false,
  sold_out: false,
};

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-kavo flex min-h-[70vh] items-center justify-center py-20">
      <form onSubmit={submit} className="w-full max-w-sm border hairline p-8">
        <p className="eyebrow">Restricted</p>
        <h1 className="mt-3 font-display text-4xl tracking-widest">ADMIN</h1>
        <p className="mt-2 text-sm text-smoke">Sign in to manage the KAVO store.</p>
        <div className="mt-8 space-y-4">
          <input
            className="field"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <input
            className="field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="btn-solid mt-6 w-full">
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="border hairline p-5">
      <p className="text-[11px] uppercase tracking-widest text-smoke">{label}</p>
      <p className="mt-2 font-display text-3xl tracking-tight">{value}</p>
    </div>
  );
}

function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = Boolean(product.id);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT, ...product, category_id: product.category_id || "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: form.category_id ? Number(form.category_id) : null,
    };
    try {
      if (isEdit) await api.adminUpdateProduct(product.id, payload);
      else await api.adminCreateProduct(payload);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 py-10">
      <form onSubmit={save} className="w-full max-w-lg bg-bone p-7 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl tracking-widest">
            {isEdit ? "EDIT PRODUCT" : "NEW PRODUCT"}
          </h3>
          <button type="button" onClick={onClose} className="text-sm text-smoke hover:text-ink">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <input className="field" placeholder="Product name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
          <textarea className="field resize-none" rows={3} placeholder="Description" value={form.description} onChange={(e) => update("description", e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-widest text-smoke">Price</span>
              <input className="field" type="number" min="0" step="1" value={form.price} onChange={(e) => update("price", e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-widest text-smoke">Stock</span>
              <input className="field" type="number" min="0" step="1" value={form.stock} onChange={(e) => update("stock", e.target.value)} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-widest text-smoke">Category</span>
              <select className="field" value={form.category_id} onChange={(e) => update("category_id", e.target.value)}>
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-widest text-smoke">Drop label</span>
              <input className="field" placeholder="VOL.01" value={form.drop_label} onChange={(e) => update("drop_label", e.target.value)} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-widest text-smoke">Sizes (comma)</span>
              <input className="field" value={form.sizes} onChange={(e) => update("sizes", e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-widest text-smoke">Accent color</span>
              <input className="field h-[46px] p-1" type="color" value={form.accent} onChange={(e) => update("accent", e.target.value)} />
            </label>
          </div>
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.sold_out} onChange={(e) => update("sold_out", e.target.checked)} />
              Sold out
            </label>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-7 flex gap-3">
          <button type="submit" disabled={busy} className="btn-solid flex-1">
            {busy ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
          </button>
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);

  function load() {
    api.adminProducts().then(setProducts).catch(() => {});
    api.getCategories().then(setCategories).catch(() => {});
  }
  useEffect(load, []);

  async function quickUpdate(p, patch) {
    await api.adminUpdateProduct(p.id, patch);
    load();
  }

  async function remove(p) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await api.adminDeleteProduct(p.id);
    load();
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-widest">PRODUCTS</h2>
        <button onClick={() => setEditing({ ...EMPTY_PRODUCT })} className="btn-solid">
          + New Product
        </button>
      </div>

      <div className="overflow-x-auto border hairline">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b hairline bg-ash/40 text-[11px] uppercase tracking-widest text-smoke">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8" style={{ background: p.accent }} />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-[11px] uppercase tracking-widest text-smoke">
                        {p.category?.name || "—"} {p.featured && "· Featured"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    defaultValue={p.price}
                    className="w-20 border hairline bg-transparent px-2 py-1"
                    onBlur={(e) =>
                      Number(e.target.value) !== p.price &&
                      quickUpdate(p, { price: Number(e.target.value) })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    defaultValue={p.stock}
                    className="w-16 border hairline bg-transparent px-2 py-1"
                    onBlur={(e) =>
                      Number(e.target.value) !== p.stock &&
                      quickUpdate(p, { stock: Number(e.target.value) })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => quickUpdate(p, { sold_out: !p.sold_out })}
                    className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                      p.sold_out || p.stock <= 0
                        ? "bg-ink text-bone"
                        : "border hairline text-smoke"
                    }`}
                  >
                    {p.sold_out || p.stock <= 0 ? "Sold Out" : "Live"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(p)} className="mr-3 text-[11px] uppercase tracking-widest hover:underline">
                    Edit
                  </button>
                  <button onClick={() => remove(p)} className="text-[11px] uppercase tracking-widest text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductModal
          product={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const STATUSES = ["pending", "paid", "fulfilled", "cancelled"];

  function load() {
    api.adminOrders().then(setOrders).catch(() => {});
  }
  useEffect(load, []);

  async function setStatus(id, status) {
    await api.adminUpdateOrderStatus(id, status);
    load();
  }

  return (
    <div>
      <h2 className="mb-5 font-display text-2xl tracking-widest">ORDERS</h2>
      {orders.length === 0 ? (
        <p className="border hairline p-8 text-center text-sm text-smoke">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border hairline p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    Order #{o.id} · {money(o.total, o.currency)}
                  </p>
                  <p className="text-[11px] uppercase tracking-widest text-smoke">
                    {o.customer_name || "—"} · {o.customer_email || "no email"}
                  </p>
                </div>
                <select
                  value={o.status}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                  className="border hairline bg-transparent px-3 py-2 text-[11px] uppercase tracking-widest"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <ul className="mt-3 border-t hairline pt-3 text-sm text-smoke">
                {o.items.map((it) => (
                  <li key={it.id}>
                    {it.product_name} · {it.size || "OS"} × {it.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentTab() {
  const [data, setData] = useState({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.adminGetSettings().then((r) => setData(r.data || {})).catch(() => {});
  }, []);

  const FIELDS = [
    ["hero_eyebrow", "Hero eyebrow"],
    ["hero_title", "Hero title"],
    ["hero_subtitle", "Hero subtitle"],
    ["hero_cta", "Hero button text"],
    ["marquee", "Marquee strip"],
    ["featured_title", "Featured section title"],
    ["featured_subtitle", "Featured subtitle"],
    ["story_title", "Story title"],
    ["story_body", "Story body"],
    ["footer_note", "Footer note"],
  ];

  async function save() {
    setBusy(true);
    await api.adminUpdateSettings(data);
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-5 font-display text-2xl tracking-widest">HOMEPAGE CONTENT</h2>
      <div className="space-y-4">
        {FIELDS.map(([key, label]) => (
          <label key={key} className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-widest text-smoke">{label}</span>
            {key === "story_body" || key === "hero_subtitle" ? (
              <textarea
                rows={2}
                className="field resize-none"
                value={data[key] || ""}
                onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
              />
            ) : (
              <input
                className="field"
                value={data[key] || ""}
                onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
              />
            )}
          </label>
        ))}
      </div>
      <button onClick={save} disabled={busy} className="btn-solid mt-6">
        {busy ? "Saving…" : saved ? "Saved ✓" : "Save Content"}
      </button>
    </div>
  );
}

export default function Admin() {
  const { user, ready, logout } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) api.adminStats().then(setStats).catch(() => {});
  }, [user, tab]);

  if (!ready) return <div className="container-kavo py-32 text-center text-sm text-smoke">Loading…</div>;
  if (!user) return <Login />;

  const tabs = [
    ["dashboard", "Dashboard"],
    ["products", "Products"],
    ["orders", "Orders"],
    ["content", "Content"],
  ];

  return (
    <div className="container-kavo py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b hairline pb-6">
        <div>
          <p className="eyebrow">KAVO Control</p>
          <h1 className="mt-2 font-display text-4xl tracking-widest">ADMIN</h1>
        </div>
        <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest text-smoke">
          <span>{user.username}</span>
          <button onClick={logout} className="hover:text-ink">Log out</button>
        </div>
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-ultra transition ${
              tab === key ? "bg-ink text-bone" : "border hairline text-smoke hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCard label="Products" value={stats?.products ?? "—"} />
            <StatCard label="Sold Out" value={stats?.sold_out ?? "—"} />
            <StatCard label="Orders" value={stats?.orders ?? "—"} />
            <StatCard label="Revenue" value={stats ? money(stats.revenue) : "—"} />
            <StatCard label="Low Stock" value={stats?.low_stock ?? "—"} />
          </div>
          <p className="mt-8 text-sm text-smoke">
            Manage products, prices and stock under <button onClick={() => setTab("products")} className="text-ink underline">Products</button>,
            fulfil orders under <button onClick={() => setTab("orders")} className="text-ink underline">Orders</button>, and edit the homepage under{" "}
            <button onClick={() => setTab("content")} className="text-ink underline">Content</button>.
          </p>
        </div>
      )}
      {tab === "products" && <ProductsTab />}
      {tab === "orders" && <OrdersTab />}
      {tab === "content" && <ContentTab />}
    </div>
  );
}
