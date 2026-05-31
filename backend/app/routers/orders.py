from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Order, OrderItem, Product
from ..schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order = Order(
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        address=payload.address,
        status="pending",
    )

    total = 0.0
    currency = "USD"
    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.sold_out or product.stock < item.quantity:
            raise HTTPException(
                status_code=409, detail=f"'{product.name}' is out of stock"
            )

        product.stock -= item.quantity
        if product.stock <= 0:
            product.stock = 0
            product.sold_out = True

        currency = product.currency
        total += product.price * item.quantity
        order.items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                size=item.size,
                unit_price=product.price,
                quantity=item.quantity,
            )
        )

    order.total = round(total, 2)
    order.currency = currency
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
