"""KAVO support assistant.

Uses OpenAI when ``OPENAI_API_KEY`` is configured, otherwise falls back to a
deterministic rule-based engine that answers questions about sizing, shipping,
products and availability using live data from the database.
"""

from __future__ import annotations

import httpx
from sqlalchemy.orm import Session

from .config import get_settings
from .models import Product

settings = get_settings()

BRAND = "KAVO"

SIZING_GUIDE = (
    "KAVO pieces are designed with a relaxed, boxy streetwear fit. "
    "If you prefer a closer fit, size down. "
    "S fits chest 36-38\", M 39-41\", L 42-44\", XL 45-47\". "
    "Outerwear runs true to size."
)

SHIPPING_INFO = (
    "We ship worldwide. Standard shipping is 3-5 business days (free over $150), "
    "express is 1-2 business days. Each drop ships within 48 hours of order. "
    "Returns are accepted within 14 days on unworn items."
)


def _catalog_context(db: Session) -> str:
    products = db.query(Product).order_by(Product.created_at.desc()).limit(40).all()
    lines = []
    for p in products:
        status = "SOLD OUT" if p.sold_out or p.stock <= 0 else f"{p.stock} in stock"
        lines.append(
            f"- {p.name}: {p.currency} {p.price:.0f} | sizes {p.sizes} | {status}"
        )
    return "\n".join(lines) if lines else "No products are currently listed."


def _rule_based_reply(message: str, db: Session) -> str:
    text = message.lower().strip()

    if not text:
        return f"Hey, welcome to {BRAND}. Ask me about sizing, shipping, or any drop."

    greetings = ("hi", "hello", "hey", "yo", "sup")
    if text in greetings or any(text.startswith(g + " ") for g in greetings):
        return (
            f"Welcome to {BRAND}. I can help with sizing, shipping, product details "
            "and availability. What are you looking for?"
        )

    if any(k in text for k in ("size", "sizing", "fit", "measurement", "true to size")):
        return SIZING_GUIDE

    if any(k in text for k in ("ship", "shipping", "delivery", "deliver", "return", "refund")):
        return SHIPPING_INFO

    if any(k in text for k in ("available", "availability", "in stock", "stock", "sold out", "restock")):
        products = db.query(Product).order_by(Product.created_at.desc()).all()
        available = [p for p in products if not (p.sold_out or p.stock <= 0)]
        if not available:
            return "Everything is currently sold out — new drops land regularly, stay tuned."
        names = ", ".join(p.name for p in available[:8])
        return f"Currently available: {names}. Want details or sizing on any of these?"

    if any(k in text for k in ("price", "cost", "how much", "$")):
        products = db.query(Product).order_by(Product.price).all()
        if products:
            cheapest = products[0]
            priciest = products[-1]
            return (
                f"Pieces range from {cheapest.currency} {cheapest.price:.0f} "
                f"({cheapest.name}) to {priciest.currency} {priciest.price:.0f} "
                f"({priciest.name}). Ask about any item for its exact price."
            )

    # Try to match a product by name keyword.
    products = db.query(Product).all()
    for p in products:
        if p.name.lower() in text or any(
            word in text for word in p.name.lower().split() if len(word) > 3
        ):
            status = "sold out" if p.sold_out or p.stock <= 0 else f"{p.stock} in stock"
            return (
                f"{p.name} — {p.currency} {p.price:.0f}. Sizes: {p.sizes}. "
                f"Currently {status}. {p.description[:160]}".strip()
            )

    if any(k in text for k in ("payment", "pay", "stripe", "paymob", "card")):
        return (
            "Checkout is secure and supports card payments (Stripe / Paymob ready). "
            "Your order is confirmed once payment is processed."
        )

    if "thank" in text:
        return "Anytime. Welcome to the KAVO family."

    return (
        "I can help with sizing, shipping, pricing, product details and availability. "
        "Try asking 'what's in stock?' or 'how does the fit run?'"
    )


def _openai_reply(message: str, db: Session, history: list[dict]) -> str | None:
    if not settings.openai_api_key:
        return None
    catalog = _catalog_context(db)
    system = (
        f"You are the {BRAND} support assistant for a premium minimal streetwear brand. "
        "Be concise, confident and on-brand (calm, editorial, lowercase-friendly). "
        "Only answer about sizing, shipping, products, pricing and availability. "
        f"Sizing guide: {SIZING_GUIDE} Shipping: {SHIPPING_INFO} "
        f"Live catalog:\n{catalog}"
    )
    messages = [{"role": "system", "content": system}]
    messages.extend(history[-6:])
    messages.append({"role": "user", "content": message})
    try:
        resp = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.openai_api_key}"},
            json={"model": settings.openai_model, "messages": messages, "temperature": 0.4},
            timeout=20,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception:
        return None


def generate_reply(message: str, db: Session, history: list[dict] | None = None) -> str:
    history = history or []
    ai = _openai_reply(message, db, history)
    if ai:
        return ai
    return _rule_based_reply(message, db)
