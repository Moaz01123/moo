import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { money, sizesOf } from "../lib/format";
import { useCart } from "../context/CartContext";
import ProductVisual from "../components/ProductVisual";

export default function Product() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setProduct(null);
    setError("");
    setSize("");
    api
      .getProduct(slug)
      .then((p) => {
        setProduct(p);
        const sizes = sizesOf(p);
        if (sizes.length) setSize(sizes[0]);
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) {
    return (
      <div className="container-kavo py-32 text-center">
        <p className="text-sm text-smoke">{error}</p>
        <Link to="/shop" className="btn-outline mt-6">Back to Shop</Link>
      </div>
    );
  }

  if (!product) {
    return <div className="container-kavo py-32 text-center text-sm text-smoke">Loading…</div>;
  }

  const sizes = sizesOf(product);
  const soldOut = product.sold_out || product.stock <= 0;

  function handleAdd() {
    if (soldOut) return;
    addItem(product, size, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="container-kavo py-10">
      <nav className="mb-8 text-[11px] uppercase tracking-widest text-smoke">
        <Link to="/" className="hover:text-ink">Home</Link> /{" "}
        <Link to="/shop" className="hover:text-ink">Shop</Link> /{" "}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-[4/5] w-full bg-ash">
          <ProductVisual product={product} className="h-full w-full" />
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-bone/70">
              <span className="border border-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-ultra">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className="lg:py-6">
          {product.drop_label && <p className="eyebrow">{product.drop_label}</p>}
          <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-4 text-2xl font-light">{money(product.price, product.currency)}</p>

          <p className="mt-8 max-w-md leading-relaxed text-smoke">{product.description}</p>

          <div className="mt-10">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest">Size</span>
              <span className="text-[11px] uppercase tracking-widest text-smoke">
                {soldOut ? "Out of stock" : `${product.stock} in stock`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSize(sz)}
                  disabled={soldOut}
                  className={`h-11 min-w-[3rem] border px-3 text-sm transition ${
                    size === sz
                      ? "border-ink bg-ink text-bone"
                      : "border-ink/20 text-ink hover:border-ink"
                  } ${soldOut ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={soldOut}
            className="btn-solid mt-10 w-full sm:w-auto sm:min-w-[18rem]"
          >
            {soldOut ? "Sold Out" : added ? "Added ✓" : "Add to Cart"}
          </button>

          <ul className="mt-10 space-y-2 border-t hairline pt-6 text-sm text-smoke">
            <li>· Free worldwide shipping over $150</li>
            <li>· 14-day returns on unworn items</li>
            <li>· Heavyweight, limited-run fabrication</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
