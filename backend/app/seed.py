"""Idempotent database seeding for KAVO.

Creates the default admin (from settings), base categories, the homepage copy
and an initial set of products if the catalog is empty.
"""

from sqlalchemy.orm import Session

from .auth import hash_password
from .config import get_settings
from .models import Category, Product, Setting, User
from .utils import slugify

settings = get_settings()


DEFAULT_SETTINGS = {
    "hero_eyebrow": "KAVO — VOL. 01",
    "hero_title": "WEAR THE SILENCE.",
    "hero_subtitle": "Minimal streetwear engineered for the ones who move different.",
    "hero_cta": "SHOP THE DROP",
    "featured_title": "FEATURED DROPS",
    "featured_subtitle": "Limited runs. No restocks promised.",
    "marquee": "KAVO · MADE IN LIMITED RUNS · WORLDWIDE SHIPPING · NEW DROPS MONTHLY ·",
    "story_title": "BUILT ON RESTRAINT",
    "story_body": "KAVO is a study in subtraction. No logos shouting, no noise — just considered cuts, heavyweight fabric and a palette that lets you do the talking.",
    "footer_note": "KAVO® — All rights reserved.",
}


CATEGORIES = [
    ("Tops", "Heavyweight tees and longsleeves."),
    ("Hoodies", "Boxy, brushed-back fleece."),
    ("Outerwear", "Structured jackets and shells."),
    ("Bottoms", "Relaxed trousers and shorts."),
    ("Accessories", "Finishing pieces."),
]


def _product(name, cat, price, desc, stock, accent, drop, featured=False, sold_out=False):
    return {
        "name": name,
        "category": cat,
        "price": price,
        "description": desc,
        "stock": stock,
        "accent": accent,
        "drop_label": drop,
        "featured": featured,
        "sold_out": sold_out,
        "sizes": "S,M,L,XL",
    }


PRODUCTS = [
    _product(
        "Monolith Heavy Tee", "Tops", 68,
        "320gsm boxy tee in washed black. Dropped shoulders, ribbed collar, tonal KAVO mark at the hem.",
        24, "#1a1a1a", "VOL.01", featured=True,
    ),
    _product(
        "Static Hoodie", "Hoodies", 145,
        "Brushed-back heavyweight fleece hoodie. Oversized hood, raw-edge cuffs, beige colorway.",
        12, "#d8cfc2", "VOL.01", featured=True,
    ),
    _product(
        "Null Cargo Pant", "Bottoms", 130,
        "Relaxed cargo in soft grey ripstop. Tonal hardware, tapered ankle, utility pockets.",
        18, "#8a8a8a", "VOL.01", featured=True,
    ),
    _product(
        "Shell Jacket 001", "Outerwear", 240,
        "Minimal water-resistant shell. Concealed placket, articulated sleeves, matte finish.",
        6, "#222222", "VOL.01", featured=True,
    ),
    _product(
        "Blank Longsleeve", "Tops", 78,
        "Midweight longsleeve in bone white. Clean silhouette, double-needle stitching.",
        30, "#efe9df", "VOL.01",
    ),
    _product(
        "Form Sweatpant", "Bottoms", 110,
        "Tapered heavyweight sweatpant in charcoal. Elastic waist, zip pockets.",
        20, "#3a3a3a", "VOL.01",
    ),
    _product(
        "Quiet Beanie", "Accessories", 42,
        "Fine-gauge ribbed beanie in beige. Tonal woven label.",
        40, "#cfc4b2", "ESSENTIALS",
    ),
    _product(
        "Void Crewneck", "Hoodies", 120,
        "Boxy crewneck in soft black. Heavyweight loopback, dropped shoulders.",
        0, "#161616", "VOL.01", sold_out=True,
    ),
]


def seed(db: Session) -> None:
    # Admin
    admin = db.query(User).filter(User.username == settings.admin_username).first()
    if not admin:
        db.add(
            User(
                username=settings.admin_username,
                email="admin@kavo.store",
                hashed_password=hash_password(settings.admin_password),
                is_admin=True,
            )
        )

    # Settings / homepage copy (only fill missing keys)
    for key, value in DEFAULT_SETTINGS.items():
        if not db.query(Setting).filter(Setting.key == key).first():
            db.add(Setting(key=key, value=value))

    # Categories
    cat_map: dict[str, Category] = {}
    for name, desc in CATEGORIES:
        existing = db.query(Category).filter(Category.name == name).first()
        if not existing:
            existing = Category(name=name, slug=slugify(name), description=desc)
            db.add(existing)
            db.flush()
        cat_map[name] = existing

    # Products (only if catalog is empty)
    if db.query(Product).count() == 0:
        for data in PRODUCTS:
            cat = cat_map.get(data.pop("category"))
            db.add(Product(slug=slugify(data["name"]), category_id=cat.id if cat else None, **data))

    db.commit()
