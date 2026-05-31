import { Link } from "react-router-dom";
import { money } from "../lib/format";
import ProductVisual from "./ProductVisual";

export default function ProductCard({ product }) {
  const soldOut = product.sold_out || product.stock <= 0;
  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ash">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]">
          <ProductVisual product={product} className="h-full w-full" />
        </div>
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-bone/70 backdrop-blur-[1px]">
            <span className="border border-ink px-4 py-2 text-[11px] font-semibold uppercase tracking-ultra">
              Sold Out
            </span>
          </div>
        )}
        {product.featured && !soldOut && (
          <span className="absolute left-3 top-3 bg-ink px-2.5 py-1 text-[9px] font-semibold uppercase tracking-ultra text-bone">
            Drop
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium tracking-tight">{product.name}</h3>
          <p className="mt-0.5 text-[11px] uppercase tracking-widest text-smoke">
            {product.category?.name || "KAVO"}
          </p>
        </div>
        <span className="text-sm font-medium">{money(product.price, product.currency)}</span>
      </div>
    </Link>
  );
}
