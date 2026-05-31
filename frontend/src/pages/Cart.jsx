import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { money } from "../lib/format";

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const currency = items[0]?.currency || "USD";
  const shipping = total >= 150 || total === 0 ? 0 : 12;

  if (items.length === 0) {
    return (
      <div className="container-kavo py-32 text-center">
        <h1 className="font-display text-5xl tracking-tight">YOUR CART IS EMPTY</h1>
        <p className="mt-4 text-sm text-smoke">No pieces yet. The drops are waiting.</p>
        <Link to="/shop" className="btn-solid mt-8">Shop the Drop</Link>
      </div>
    );
  }

  return (
    <div className="container-kavo py-12">
      <h1 className="mb-10 font-display text-5xl tracking-tight sm:text-6xl">CART</h1>

      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y hairline border-y hairline">
          {items.map((i) => (
            <li key={i.id} className="flex gap-5 py-6">
              <div className="h-28 w-24 flex-shrink-0" style={{ background: i.accent || "#1a1a1a" }} />
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link to={`/product/${i.slug}`} className="text-base font-medium hover:underline">
                      {i.name}
                    </Link>
                    <p className="mt-1 text-[11px] uppercase tracking-widest text-smoke">
                      Size {i.size || "OS"}
                    </p>
                  </div>
                  <span className="text-base">{money(i.price * i.quantity, i.currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border hairline">
                    <button className="px-3 py-1.5" onClick={() => updateQuantity(i.id, i.quantity - 1)}>−</button>
                    <span className="w-10 text-center text-sm tabular-nums">{i.quantity}</span>
                    <button className="px-3 py-1.5" onClick={() => updateQuantity(i.id, i.quantity + 1)}>+</button>
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

        <aside className="h-fit border hairline p-6">
          <h2 className="font-display text-xl tracking-widest">SUMMARY</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-smoke">Subtotal</dt>
              <dd>{money(total, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-smoke">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : money(shipping, currency)}</dd>
            </div>
            <div className="flex justify-between border-t hairline pt-3 text-base font-medium">
              <dt>Total</dt>
              <dd>{money(total + shipping, currency)}</dd>
            </div>
          </dl>
          <Link to="/checkout" className="btn-solid mt-6 w-full">Checkout</Link>
          <p className="mt-4 text-center text-[11px] uppercase tracking-widest text-smoke">
            Secure · Stripe / Paymob ready
          </p>
        </aside>
      </div>
    </div>
  );
}
