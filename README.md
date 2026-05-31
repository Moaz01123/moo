# KAVO — Minimal Luxury Streetwear

A full-stack ecommerce store for **KAVO**, a Gen-Z streetwear brand with a premium,
minimal, editorial aesthetic (black / white / beige / soft grey — no people, no
lifestyle photos, typography-driven abstract visuals only).

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18 + Vite + Tailwind CSS + React Router |
| Backend  | FastAPI + SQLAlchemy 2 + JWT auth |
| Database | SQLite by default · Postgres-ready via `DATABASE_URL` |
| AI       | Support assistant (rule-based, with optional OpenAI) |
| Payments | Stripe / Paymob–compatible order structure |

## Features

**Storefront**
- Home — editorial hero (KAVO branding), animated marquee, featured drops, brand story
- Shop — product grid with filters (category, size, max price) and sorting
- Product — sizes, stock, description, add-to-cart
- Cart — slide-over drawer + full cart page with totals & free-shipping logic
- Checkout — customer details → order persisted to the database
- AI support chat — answers sizing, shipping, product and availability questions

**Admin panel** (`/admin`, JWT-secured)
- Dashboard with live stats (products, sold-out, orders, revenue, low stock)
- Products: create / edit / delete, inline price & stock editing, mark sold out, featured
- Orders: view orders and update fulfilment status
- Content: edit all homepage copy (hero, marquee, story, footer)

**Data model**: products, categories, users, orders, order items, support messages, settings.

## Local development

### Backend
```bash
cd backend
pip install -e .
uvicorn app.main:app --reload --port 8001
```
The database is created and seeded automatically on first run (default admin +
catalog + homepage copy).

### Frontend
```bash
cd frontend
cp .env.example .env   # point VITE_API_URL at the backend
npm install
npm run dev
```

## Configuration

See `backend/.env.example` and `frontend/.env.example`. Key variables:

- `DATABASE_URL` — SQLite (default) or Postgres
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — bootstrap admin credentials
- `JWT_SECRET` — token signing secret (set a long random value in production)
- `CORS_ORIGINS` — allowed frontend origins
- `OPENAI_API_KEY` — optional; enables LLM-backed support chat (rule-based otherwise)
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — optional payment keys
- `VITE_API_URL` (frontend) — base URL of the backend API

## Default admin

```
username: admin
password: kavo-admin-2026
```
Change these via environment variables before deploying to production.

## Project structure

```
backend/
  app/
    main.py          # FastAPI app + startup seeding
    models.py        # SQLAlchemy models
    schemas.py       # Pydantic schemas
    auth.py          # JWT + password hashing
    assistant.py     # support chat engine
    seed.py          # idempotent seed data
    routers/         # auth, products, categories, orders, admin, chat, settings
frontend/
  src/
    pages/           # Home, Shop, Product, Cart, Checkout, Admin
    components/       # Navbar, Footer, ProductCard, ProductVisual, CartDrawer, ChatWidget
    context/          # Cart, Auth, Settings providers
    api.js            # typed API client
```
