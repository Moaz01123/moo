from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_admin
from ..database import get_db
from ..models import Category, Order, Product, Setting
from ..schemas import (
    CategoryCreate,
    CategoryOut,
    OrderOut,
    OrderStatusUpdate,
    ProductCreate,
    ProductOut,
    ProductUpdate,
    SettingsOut,
    SettingsUpdate,
)
from ..utils import slugify

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],
)


def _unique_slug(db: Session, base: str, model, current_id: int | None = None) -> str:
    slug = base
    i = 2
    while True:
        existing = db.query(model).filter(model.slug == slug).first()
        if not existing or existing.id == current_id:
            return slug
        slug = f"{base}-{i}"
        i += 1


# ---------- Stats ----------
@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    product_count = db.query(func.count(Product.id)).scalar() or 0
    sold_out = db.query(func.count(Product.id)).filter(Product.sold_out.is_(True)).scalar() or 0
    order_count = db.query(func.count(Order.id)).scalar() or 0
    revenue = (
        db.query(func.coalesce(func.sum(Order.total), 0.0))
        .filter(Order.status != "cancelled")
        .scalar()
        or 0.0
    )
    low_stock = db.query(func.count(Product.id)).filter(Product.stock <= 3).scalar() or 0
    return {
        "products": product_count,
        "sold_out": sold_out,
        "orders": order_count,
        "revenue": round(float(revenue), 2),
        "low_stock": low_stock,
    }


# ---------- Products ----------
@router.get("/products", response_model=list[ProductOut])
def admin_list_products(db: Session = Depends(get_db)):
    return (
        db.query(Product)
        .options(joinedload(Product.category))
        .order_by(Product.created_at.desc())
        .all()
    )


@router.post("/products", response_model=ProductOut, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    base_slug = slugify(payload.slug or payload.name)
    slug = _unique_slug(db, base_slug, Product)
    data = payload.model_dump(exclude={"slug"})
    product = Product(slug=slug, **data)
    if product.stock > 0 and not payload.sold_out:
        product.sold_out = False
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"]:
        data["slug"] = _unique_slug(db, slugify(data["slug"]), Product, product.id)
    for key, value in data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()


# ---------- Categories ----------
@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    slug = _unique_slug(db, slugify(payload.slug or payload.name), Category)
    category = Category(name=payload.name, slug=slug, description=payload.description)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()


# ---------- Orders ----------
@router.get("/orders", response_model=list[OrderOut])
def admin_list_orders(db: Session = Depends(get_db)):
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .order_by(Order.created_at.desc())
        .all()
    )


@router.put("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    allowed = {"pending", "paid", "fulfilled", "cancelled"}
    if payload.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of {allowed}")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


# ---------- Settings (homepage text etc.) ----------
@router.get("/settings", response_model=SettingsOut)
def admin_get_settings(db: Session = Depends(get_db)):
    rows = db.query(Setting).all()
    return SettingsOut(data={r.key: r.value for r in rows})


@router.put("/settings", response_model=SettingsOut)
def admin_update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    for key, value in payload.data.items():
        row = db.query(Setting).filter(Setting.key == key).first()
        if row:
            row.value = value
        else:
            db.add(Setting(key=key, value=value))
    db.commit()
    rows = db.query(Setting).all()
    return SettingsOut(data={r.key: r.value for r in rows})
