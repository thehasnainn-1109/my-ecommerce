# ShopEase — Simple E-commerce Store
**CodeAlpha Full Stack Development Internship — Task 1**

A basic e-commerce website built with **vanilla HTML/CSS/JavaScript** on the frontend and
**Express.js (Node.js)** on the backend.

## Features

- 🛍️ **Product listings** — browsable grid with category filter and search
- 📄 **Product details page** — full description, price, stock, quantity selector
- 🛒 **Shopping cart** — add/update/remove items (persisted in the browser)
- 🔐 **User registration & login** — passwords hashed with bcrypt, session-based auth
- 📦 **Order processing** — checkout with shipping details; stock is validated and
  deducted on the server; order total is always computed server-side (never trusted
  from the client)
- 🧾 **Order history** — logged-in users can view all their past orders
- 💾 **Database** — persistent JSON-file data store for Products, Users and Orders
  (see "About the database" below for why, and how to swap in a real SQL/NoSQL DB)

## Tech Stack

| Layer     | Technology                                   |
|-----------|-----------------------------------------------|
| Frontend  | HTML5, CSS3, vanilla JavaScript (fetch API)  |
| Backend   | Node.js, Express.js                          |
| Auth      | express-session + bcryptjs (hashed passwords)|
| Database  | JSON file (`server/data/db.json`)            |

## Project Structure

```
codealpha-ecommerce/
├── package.json
├── README.md
├── server/
│   ├── server.js            # App entry point
│   ├── data/
│   │   └── db.json          # "Database" — products, users, orders
│   ├── middleware/
│   │   └── auth.js          # requireAuth middleware
│   ├── routes/
│   │   ├── auth.js          # /api/auth/*  (register, login, logout, me)
│   │   ├── products.js      # /api/products/*
│   │   └── orders.js        # /api/orders/*
│   └── utils/
│       └── db.js            # Reads/writes db.json, all data-access logic
└── public/                  # Static frontend
    ├── index.html            # Home / product listing
    ├── product.html           # Product details page
    ├── cart.html               # Shopping cart
    ├── checkout.html            # Checkout / shipping form
    ├── orders.html                # Order history
    ├── login.html
    ├── register.html
    ├── css/style.css
    └── js/
        ├── app.js            # Shared helpers (API calls, cart in localStorage, header)
        ├── home.js
        ├── product.js
        ├── cart.js
        ├── checkout.js
        ├── orders.js
        ├── login.js
        └── register.js
```

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v16 or later (includes npm)

### 2. Install dependencies
```bash
cd codealpha-ecommerce
npm install
```

### 3. Run the server
```bash
npm start
```
You should see:
```
🛒 CodeAlpha E-commerce server running at http://localhost:3000
```

### 4. Open the app
Visit **http://localhost:3000** in your browser.

> During development you can also run `npm run dev` (uses `nodemon`) to auto-restart
> the server on file changes.

## How It Works

- **Cart**: item IDs/quantities are kept in the browser's `localStorage` so the cart
  survives page reloads without needing to be logged in. At checkout, the cart is
  sent to the server, which re-validates stock and re-computes the total (client
  numbers are never trusted).
- **Auth**: `POST /api/auth/register` and `/api/auth/login` create a server-side
  session (`express-session`) and set an HTTP-only cookie. Protected routes
  (`POST /api/orders`, `GET /api/orders`) use the `requireAuth` middleware to check
  `req.session.userId`.
- **Orders**: `POST /api/orders` looks up each product, checks stock, deducts stock,
  stores a snapshot of the purchased items (name/price at time of purchase), and
  returns the created order.

## API Reference

| Method | Endpoint              | Description                          | Auth required |
|--------|------------------------|---------------------------------------|:---:|
| GET    | `/api/products`        | List products (`?search=`, `?category=`) | No |
| GET    | `/api/products/:id`    | Get a single product                  | No |
| POST   | `/api/auth/register`   | Create an account                     | No |
| POST   | `/api/auth/login`      | Log in                                | No |
| POST   | `/api/auth/logout`     | Log out                               | No |
| GET    | `/api/auth/me`         | Get the current logged-in user        | No |
| POST   | `/api/orders`          | Place an order (checkout)             | **Yes** |
| GET    | `/api/orders`          | List the current user's orders        | **Yes** |
| GET    | `/api/orders/:id`      | Get one of the current user's orders  | **Yes** |

## About the Database

To keep this project dependency-free and easy to run anywhere (no database server or
native module compilation required), data is persisted in a single JSON file,
`server/data/db.json`, through a small data-access layer in `server/utils/db.js`.
Every route talks only to functions exported from `db.js`, so swapping this out for a
real database (MongoDB with Mongoose, PostgreSQL/MySQL with Sequelize or Prisma, etc.)
only requires rewriting that one file — no route or frontend code would need to change.

## Notes for Submission

- Sample products are pre-seeded in `server/data/db.json` so the store isn't empty on
  first run.
- Passwords are never stored in plain text (hashed with `bcryptjs`).
- This project was built for the **CodeAlpha Full Stack Development Internship –
  Task 1 (Simple E-commerce Store)**.
