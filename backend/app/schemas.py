from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Categories ----------
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: str = ""


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Products ----------
class ProductBase(BaseModel):
    name: str
    description: str = ""
    price: float = 0.0
    currency: str = "USD"
    sizes: str = "S,M,L,XL"
    stock: int = 0
    sold_out: bool = False
    featured: bool = False
    accent: str = "#1a1a1a"
    drop_label: str = ""
    category_id: int | None = None


class ProductCreate(ProductBase):
    slug: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    currency: str | None = None
    sizes: str | None = None
    stock: int | None = None
    sold_out: bool | None = None
    featured: bool | None = None
    accent: str | None = None
    drop_label: str | None = None
    category_id: int | None = None
    slug: str | None = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    category: CategoryOut | None = None
    created_at: datetime
    updated_at: datetime


# ---------- Auth ----------
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: str
    is_admin: bool


# ---------- Orders ----------
class OrderItemIn(BaseModel):
    product_id: int
    size: str = ""
    quantity: int = Field(default=1, ge=1)


class OrderCreate(BaseModel):
    customer_name: str = ""
    customer_email: str = ""
    address: str = ""
    items: list[OrderItemIn]


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int | None
    product_name: str
    size: str
    unit_price: float
    quantity: int


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    customer_name: str
    customer_email: str
    address: str
    total: float
    currency: str
    status: str
    payment_ref: str
    created_at: datetime
    items: list[OrderItemOut]


class OrderStatusUpdate(BaseModel):
    status: str


# ---------- Support chat ----------
class ChatRequest(BaseModel):
    message: str
    session_id: str = ""


class ChatResponse(BaseModel):
    reply: str
    session_id: str


# ---------- Settings ----------
class SettingsOut(BaseModel):
    data: dict[str, str]


class SettingsUpdate(BaseModel):
    data: dict[str, str]
