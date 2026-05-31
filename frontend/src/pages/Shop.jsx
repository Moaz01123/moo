import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../components/ProductCard";

const SIZES = ["S", "M", "L", "XL"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = params.get("category") || "";
  const size = params.get("size") || "";
  const sort = params.get("sort") || "newest";
  const maxPrice = params.get("max_price") || "";

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .getProducts({ category, size, sort, max_price: maxPrice })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, size, sort, maxPrice]);

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  const activeCount = useMemo(
    () => [category, size, maxPrice].filter(Boolean).length,
    [category, size, maxPrice]
  );

  return (
    <div className="container-kavo py-12">
      <div className="mb-10 border-b hairline pb-8">
        <p className="eyebrow">The Collection</p>
        <h1 className="mt-3 font-display text-5xl tracking-tight sm:text-7xl">SHOP</h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* FILTERS */}
        <aside className="space-y-8">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="eyebrow text-ink">Filters</h3>
              {activeCount > 0 && (
                <button
                  onClick={() => setParams({}, { replace: true })}
                  className="text-[11px] uppercase tracking-widest text-smoke hover:text-ink"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-smoke">
              Category
            </p>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => setParam("category", "")}
                  className={`text-sm ${!category ? "text-ink underline underline-offset-4" : "text-smoke hover:text-ink"}`}
                >
                  All
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setParam("category", c.slug)}
                    className={`text-sm ${category === c.slug ? "text-ink underline underline-offset-4" : "text-smoke hover:text-ink"}`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-smoke">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setParam("size", size === sz ? "" : sz)}
                  className={`h-9 w-9 border text-xs ${
                    size === sz ? "border-ink bg-ink text-bone" : "border-ink/20 text-smoke hover:border-ink"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-smoke">
              Max Price {maxPrice && `· $${maxPrice}`}
            </p>
            <input
              type="range"
              min="40"
              max="260"
              step="10"
              value={maxPrice || 260}
              onChange={(e) => setParam("max_price", e.target.value === "260" ? "" : e.target.value)}
              className="w-full accent-ink"
            />
          </div>
        </aside>

        {/* GRID */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-smoke">
              {loading ? "Loading…" : `${products.length} items`}
            </span>
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              className="border hairline bg-transparent px-3 py-2 text-[11px] uppercase tracking-widest outline-none"
            >
              {SORTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {!loading && products.length === 0 ? (
            <p className="py-24 text-center text-sm text-smoke">No products match these filters.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
