import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useSettings } from "../context/SettingsContext";
import ProductCard from "../components/ProductCard";
import Marquee from "../components/Marquee";

export default function Home() {
  const s = useSettings();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.getProducts({ featured: true }).then(setFeatured).catch(() => setFeatured([]));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b hairline">
        <div className="container-kavo grid min-h-[82vh] items-center gap-8 py-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow animate-fadein">{s.hero_eyebrow || "KAVO — VOL. 01"}</p>
            <h1 className="mt-6 font-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.88] tracking-tightest animate-fadeup">
              {s.hero_title || "WEAR THE SILENCE."}
            </h1>
            <p className="mt-8 max-w-md text-base text-smoke animate-fadeup">
              {s.hero_subtitle ||
                "Minimal streetwear engineered for the ones who move different."}
            </p>
            <div className="mt-10 flex flex-wrap gap-4 animate-fadeup">
              <Link to="/shop" className="btn-solid">
                {s.hero_cta || "SHOP THE DROP"}
              </Link>
              <Link to="/shop?category=outerwear" className="btn-outline">
                Outerwear
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:col-span-5 lg:block">
            <div className="relative aspect-[3/4] w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-carbon to-ink" />
              <div className="absolute inset-0 flex flex-col justify-between p-8 text-bone">
                <span className="text-[11px] uppercase tracking-ultra opacity-70">EST. MMXXVI</span>
                <div className="font-display text-[7rem] leading-none tracking-tightest">K</div>
                <span className="text-[11px] uppercase tracking-ultra opacity-70">
                  LIMITED RUN / NO RESTOCK
                </span>
              </div>
              <div className="pointer-events-none absolute -bottom-px left-0 right-0 h-24 bg-gradient-to-t from-bone/0 to-bone/0" />
            </div>
          </div>
        </div>
      </section>

      <Marquee text={s.marquee} />

      {/* FEATURED DROPS */}
      <section className="container-kavo py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow">{s.featured_subtitle || "Limited runs. No restocks promised."}</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
              {s.featured_title || "FEATURED DROPS"}
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden text-[11px] font-semibold uppercase tracking-ultra text-smoke hover:text-ink sm:block"
          >
            View All →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="py-16 text-center text-sm text-smoke">No featured drops yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {featured.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* STORY */}
      <section className="border-t hairline bg-ash/40">
        <div className="container-kavo grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
          <h2 className="font-display text-4xl leading-tight tracking-tight sm:text-6xl">
            {s.story_title || "BUILT ON RESTRAINT"}
          </h2>
          <p className="max-w-lg text-lg leading-relaxed text-smoke">
            {s.story_body ||
              "KAVO is a study in subtraction. No logos shouting, no noise — just considered cuts, heavyweight fabric and a palette that lets you do the talking."}
          </p>
        </div>
      </section>
    </div>
  );
}
