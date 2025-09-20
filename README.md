# Local Market Backend (Node.js + Express + MongoDB)

## Quick Start
1) Install Node.js 18+ and MongoDB (or use MongoDB Atlas).
2) Copy `.env.example` to `.env` and adjust values:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/local_market_mvp
JWT_SECRET=change_me
```
3) Install deps and run:
```
npm install
npm run dev
```
API will run at `http://localhost:5000`.

## REST Endpoints (MVP)
### Auth
- `POST /api/auth/register` { name, email, password, role: "customer"|"shop" }
- `POST /api/auth/login` { email, password }

### Shops
- `GET /api/shops` — List active shops
- `GET /api/shops/me` — Get my shop (role: shop, auth)
- `POST /api/shops` — Create/Update my shop (role: shop, auth)

### Products
- `GET /api/products?shopId=...` — Public list by shop
- `GET /api/products/mine` — Shop owner list (auth, role: shop)
- `POST /api/products` — Create (auth, role: shop)
- `PUT /api/products/:id` — Update (auth, role: shop)
- `DELETE /api/products/:id` — Delete (auth, role: shop)

### Orders
- `POST /api/orders` — Customer places order
  ```json
  {
    "shopId": "SHOP_ID",
    "address": "Some address",
    "items": [
      {"productId": "PROD_ID", "qty": 2}
    ]
  }
  ```
- `GET /api/orders` — If customer: my orders; If shop: orders for my shop (auth)
- `PUT /api/orders/:id/status` — Shop updates status to one of: accepted, packed, out_for_delivery, delivered, cancelled

## Notes
- Payment is simplified to COD for MVP.
- Add HTTPS, validation, rate limiting before production.
