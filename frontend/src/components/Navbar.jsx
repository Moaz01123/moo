import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop?category=hoodies", label: "Drops" },
];

export default function Navbar() {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-bone/85 backdrop-blur-md">
      <div className="container-kavo flex h-16 items-center justify-between">
        <button
          className="flex h-8 w-8 flex-col justify-center gap-1.5 md:hidden"
          onClick={() => setMenu((m) => !m)}
          aria-label="Menu"
        >
          <span className="h-px w-6 bg-ink" />
          <span className="h-px w-6 bg-ink" />
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `text-[11px] font-semibold uppercase tracking-ultra transition-colors hover:text-ink ${
                  isActive ? "text-ink" : "text-smoke"
                }`
              }
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 font-display text-2xl tracking-[0.3em]"
        >
          KAVO
        </Link>

        <div className="flex items-center gap-5">
          <Link
            to="/admin"
            className="hidden text-[11px] font-semibold uppercase tracking-ultra text-smoke hover:text-ink sm:block"
          >
            Admin
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="relative text-[11px] font-semibold uppercase tracking-ultra hover:text-ink"
          >
            Cart
            <span className="ml-1 tabular-nums">({count})</span>
          </button>
        </div>
      </div>

      {menu && (
        <nav className="flex flex-col gap-1 border-t hairline px-5 py-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={() => setMenu(false)}
              className="py-2 text-sm font-medium uppercase tracking-widest text-smoke"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/admin"
            onClick={() => setMenu(false)}
            className="py-2 text-sm font-medium uppercase tracking-widest text-smoke"
          >
            Admin
          </Link>
        </nav>
      )}
    </header>
  );
}
