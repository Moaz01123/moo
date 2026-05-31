from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Category, Product
from ..schemas import ProductOut

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def list_products(
    db: Session = Depends(get_db),
    category: str | None = Query(default=None, description="Category slug"),
    size: str | None = Query(default=None, description="Filter by available size"),
    min_price: float | None = Query(default=None),
    max_price: float | None = Query(default=None),
    featured: bool | None = Query(default=None),
    sort: str = Query(default="newest", description="newest|price_asc|price_desc"),
):
    query = db.query(Product).options(joinedload(Product.category))

    if category:
        query = query.join(Category).filter(Category.slug == category)
    if featured is not None:
        query = query.filter(Product.featured == featured)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if sort == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort == "price_desc":
        query = query.order_by(desc(Product.price))
    else:
        query = query.order_by(desc(Product.created_at))

    products = query.all()

    if size:
        size = size.strip().upper()
        products = [
            p for p in products if size in [s.strip().upper() for s in p.sizes.split(",")]
        ]
    return products


@router.get("/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(Product.slug == slug)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
