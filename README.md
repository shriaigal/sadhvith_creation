# SADHVITH CREATION — Full-Stack Application

A complete full-stack e-commerce catalogue for **Sadhvith Creation**, built
on the existing React frontend you provided, now connected to a real
**Python FastAPI** backend with **MongoDB Atlas** and **Cloudinary**.

```
sadhvith-creation-fullstack/
├── frontend/     React + Vite (your original UI, orange theme preserved)
├── backend/      FastAPI + PyMongo + JWT + Cloudinary
├── README.md     (this file)
└── .gitignore
```

## What's included

- Manager registration & login (JWT, bcrypt password hashing)
- Manager dashboard with stats (total / active / out-of-stock / featured)
- Full product CRUD (add / edit / delete), protected by JWT
- Up to 5 images per product, uploaded to Cloudinary, enforced server-side
- Automatic offer/discount calculation — the backend is the single source
  of truth for pricing (originalPrice, offerPercentage → discountAmount,
  finalPrice); a client-supplied final price is never trusted
- Public product catalogue backed by MongoDB Atlas (search, filter by
  category/material/availability/featured/badge, sort)
- Product details page with related products and a WhatsApp enquiry button
  that fills in the real product name, price, material, and size
- Swagger API docs at `/docs`

---

## 1. Requirements

- [Node.js](https://nodejs.org/) 18+
- [Python](https://www.python.org/) 3.10+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- A free [Cloudinary](https://cloudinary.com/) account

---

## 2. MongoDB Atlas setup

1. Create a free account at https://www.mongodb.com/cloud/atlas.
2. Create a new cluster (the free M0 tier is enough).
3. Under **Database Access**, create a database user with a username and
   password.
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` while
   developing, then restrict it later).
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority`
6. Paste it into `backend/.env` as `MONGODB_URI` (see step 4 below).

## 3. Cloudinary setup

1. Create a free account at https://cloudinary.com/.
2. On your [Cloudinary console](https://cloudinary.com/console), copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Paste them into `backend/.env` (see step 4 below).

## 4. Environment variables

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in:

| Variable                                                                       | Description                                                                           |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `MONGODB_URI`                                                                | Your MongoDB Atlas connection string                                                  |
| `MONGODB_DB_NAME`                                                            | Database name (default`sadhvith_creation`)                                          |
| `JWT_SECRET`                                                                 | Any long random string (e.g.`openssl rand -hex 32`)                                 |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From your Cloudinary console                                                          |
| `FRONTEND_URL`                                                               | `http://localhost:5173` for local dev                                               |
| `WHATSAPP_NUMBER`                                                            | Your business WhatsApp number, digits only, country code first (e.g.`919999999999`) |

```bash
cd ../frontend
cp .env.example .env
```

`frontend/.env` only needs:

```
VITE_API_URL=http://localhost:8000/api
```

**Never commit either `.env` file** — both are already in `.gitignore`.

## 5. Run the backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive Swagger docs are at
`http://localhost:8000/docs`.

### (Optional) Seed sample products

To load the original 8 sample products into Atlas so the catalogue isn't
empty:

```bash
python seed.py
```

Safe to re-run — it upserts by slug rather than duplicating.

## 6. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

## 7. Build for production

```bash
cd frontend
npm run build
```

Serve the `frontend/dist` folder with any static host, and run the
backend with a production ASGI setup (e.g. `uvicorn app.main:app --host 0.0.0.0 --port 8000` behind a reverse proxy). Remember to update
`FRONTEND_URL` (backend) and `VITE_API_URL` (frontend) to your real
domains, and to use a strong, unique `JWT_SECRET` in production.

---

## Manager account

There's no default manager account — register one yourself:

1. Go to `http://localhost:5173/manager/register` (also linked from the
   footer, "Manager Login").
2. Fill in name, email, password, confirm password.
3. You'll be logged in immediately and taken to `/manager/dashboard`.

From the dashboard you can **Add Product**, **Manage Products** (view /
edit / delete, with a confirmation prompt before delete), and see live
stats.

## Product management

- **Add Product** (`/manager/products/add`) — title, short description,
  full description, original price, offer %, category, material, size,
  finish, availability, optional badge, featured toggle, tags,
  specifications, and 1–5 images.
- **Edit Product** — same form, pre-filled; you can remove existing
  images, add new ones, or replace them, up to 5 total.
- **Delete Product** — asks for confirmation, then removes the MongoDB
  document and its Cloudinary images.

## Image limit

**Maximum 5 images per product.** This is enforced both in the frontend
form (the "Add Image" control disappears at 5) and — authoritatively —
in the FastAPI backend, which rejects any request with more than 5 total
images regardless of what the frontend sends.

## Offer / discount calculation

The manager only enters **Original Price** and **Offer Percentage**. The
backend calculates and stores the rest:

```
discountAmount = originalPrice × offerPercentage / 100
finalPrice     = originalPrice − discountAmount
```

If `offerPercentage` is 0, `discountAmount` is 0 and `finalPrice` equals
`originalPrice`. The frontend shows a live preview of this math while
the manager types, but the **value that gets saved and displayed to
customers always comes from the backend** — a tampered or stale
frontend value is never trusted.

---

## Troubleshooting

- **"Failed to connect to MongoDB Atlas"** — check `MONGODB_URI`, that
  your IP is allowed under Atlas Network Access, and that the database
  user's username/password in the connection string are correct.
- **"Image upload is not configured"** — check the three `CLOUDINARY_*`
  variables in `backend/.env`.
- **CORS errors in the browser console** — make sure `FRONTEND_URL` in
  `backend/.env` matches the URL you're loading the frontend from.
- **401 errors after being logged in for a while** — your session
  (JWT) expired (`JWT_EXPIRE_MINUTES`, default 24h); just log in again.
