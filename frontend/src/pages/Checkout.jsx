import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api } from "../api";
import { money } from "../lib/format";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: "", customer_email: "", address: "" });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const currency = items[0]?.currency || "USD";
  const shipping = total >= 150 || total === 0 ? 0 : 12;

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function placeOrder(e) {
    e.preventDefault();
    setPlacing(true);
    setError("");
    try {
      const payload = {
        ...form,
        items: items.map((i) => ({ product_id: i.productId, size: i.size, quantity: i.quantity })),
      };
      const created = await api.createOrder(payload);
      setOrder(created);
      clear();
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (order) {
    return (
      <div className="container-kavo py-28 text-center">
        <p className="eyebrow">Order #{order.id} · {order.status}</p>
        <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">ORDER CONFIRMED</h1>
        <p className="mx-auto mt-6 max-w-md text-sm text-smoke">
          Thank you, {order.customer_name || "friend"}. Your KAVO order totalling{" "}
          {money(order.total, order.currency)} is being processed. A confirmation has been logged.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link to="/shop" className="btn-solid">Continue Shopping</Link>
          <button onClick={() => navigate("/")} className="btn-outline">Home</button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-kavo py-32 text-center">
        <h1 className="font-display text-4xl tracking-tight">NOTHING TO CHECK OUT</h1>
        <Link to="/shop" className="btn-solid mt-8">Shop the Drop</Link>
      </div>
    );
  }

  return (
    <div className="container-kavo py-12">
      <h1 className="mb-10 font-display text-5xl tracking-tight sm:text-6xl">CHECKOUT</h1>

      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        <form onSubmit={placeOrder} className="space-y-8">
          <div>
            <p className="eyebrow mb-4 text-ink">Contact</p>
            <div className="grid gap-4">
              <input
                required
                placeholder="Full name"
                className="field"
                value={form.customer_name}
                onChange={(e) => update("customer_name", e.target.value)}
              />
              <input
                required
                type="email"
                placeholder="Email"
                className="field"
                value={form.customer_email}
                onChange={(e) => update("customer_email", e.target.value)}
              />
            </div>
          </div>

          <div>
            <p className="eyebrow mb-4 text-ink">Shipping Address</p>
            <textarea
              required
              rows={3}
              placeholder="Address, city, postal code, country"
              className="field resize-none"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>

          <div>
            <p className="eyebrow mb-4 text-ink">Payment</p>
            <div className="border hairline bg-ash/40 p-5 text-sm text-smoke">
              Card payment is handled at confirmation via our secure provider
              (Stripe / Paymob ready). This demo places the order with a{" "}
              <span className="text-ink">pending</span> status — no card is charged.
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={placing} className="btn-solid w-full sm:w-auto sm:min-w-[18rem]">
            {placing ? "Placing Order…" : `Place Order · ${money(total + shipping, currency)}`}
          </button>
        </form>

        <aside className="h-fit border hairline p-6">
          <h2 className="font-display text-xl tracking-widest">SUMMARY</h2>
          <ul className="mt-5 space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between text-sm">
                <span className="text-smoke">
                  {i.name} <span className="text-xs">×{i.quantity}</span> · {i.size || "OS"}
                </span>
                <span>{money(i.price * i.quantity, i.currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t hairline pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-smoke">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : money(shipping, currency)}</dd>
            </div>
            <div className="flex justify-between text-base font-medium">
              <dt>Total</dt>
              <dd>{money(total + shipping, currency)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
