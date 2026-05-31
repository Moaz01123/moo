import { Link } from "react-router-dom";

export default function Footer({ note }) {
  return (
    <footer className="mt-24 border-t hairline bg-ink text-bone">
      <div className="container-kavo grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-4xl tracking-[0.3em]">KAVO</div>
          <p className="mt-4 max-w-sm text-sm text-bone/60">
            Minimal luxury streetwear, made in limited runs. Engineered restraint
            for those who move different.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-4 text-bone/50">Shop</p>
          <ul className="space-y-2 text-sm text-bone/70">
            <li><Link to="/shop" className="hover:text-bone">All Products</Link></li>
            <li><Link to="/shop?category=hoodies" className="hover:text-bone">Hoodies</Link></li>
            <li><Link to="/shop?category=outerwear" className="hover:text-bone">Outerwear</Link></li>
            <li><Link to="/cart" className="hover:text-bone">Cart</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4 text-bone/50">Info</p>
          <ul className="space-y-2 text-sm text-bone/70">
            <li>Worldwide Shipping</li>
            <li>14-Day Returns</li>
            <li>Secure Checkout</li>
            <li><Link to="/admin" className="hover:text-bone">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-bone/10 py-6">
        <div className="container-kavo flex flex-col items-center justify-between gap-2 text-[11px] uppercase tracking-ultra text-bone/40 sm:flex-row">
          <span>{note || "KAVO® — All rights reserved."}</span>
          <span>VOL.01 / MMXXVI</span>
        </div>
      </div>
    </footer>
  );
}
