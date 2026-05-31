import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { money } from "../lib/format";

export default function CartDrawer() {
  const { items, open, setOpen, updateQuantity, removeItem, total } = useCart();
  const currency = items[0]?.currency || "USD";

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-ink/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-bone shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b hairline px-6 py-5">
          <h2 className="font-display text-xl tracking-widest">CART</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-[11px] font-semibold uppercase tracking-ultra text-smoke hover:text-ink"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <p className="py-16 text-center text-sm text-smoke">Your cart is empty.</p>
          ) : (
            <ul className="divide-y hairline">
              {items.map((i) => (
                <li key={i.id} className="flex gap-4 py-5">
                  <div
                    className="h-20 w-16 flex-shrink-0"
                    style={{ background: i.accent || "#1a1a1a" }}
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{i.name}</p>
                        <p className="text-[11px] uppercase tracking-widest text-smoke">
                          Size {i.size || "OS"}
                        </p>
                      </div>
                      <span className="text-sm">{money(i.price * i.quantity, i.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border hairline">
                        <button
                          className="px-3 py-1 text-sm"
                          onClick={() => updateQuantity(i.id, i.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">{i.quantity}</span>
                        <button
                          className="px-3 py-1 text-sm"
                          onClick={() => updateQuantity(i.id, i.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-[11px] uppercase tracking-widest text-smoke hover:text-ink"
                        onClick={() => removeItem(i.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t hairline px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-ultra text-smoke">Subtotal</span>
            <span className="text-lg font-medium">{money(total, currency)}</span>
          </div>
          <Link
            to="/cart"
            onClick={() => setOpen(false)}
            className={`btn-solid w-full ${items.length === 0 ? "pointer-events-none opacity-40" : ""}`}
          >
            View Cart
          </Link>
        </div>
      </aside>
    </>
  );
}
