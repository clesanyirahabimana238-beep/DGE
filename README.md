# D&G E-Commerce Mobile Application

[![React Native CLI](https://img.shields.io/badge/React%20Native%20CLI-0.78.0-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%204.21-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-00E599?logo=postgresql&logoColor=white)](https://neon.tech/)
[![License](https://img.shields.io/badge/License-Academic-blue.svg)](#license)

---

## 1. Project Overview

**D&G E-Commerce** is a functional, cross-platform mobile commerce application built for a retail business located in **Rwamagana, Rwanda**. The application allows local customers to browse products, search and filter goods, manage a persistent shopping cart, and place orders with a local **Pay-on-Delivery** model. It also provides a dedicated seller portal for store owners to manage product inventory, track customer orders, update order fulfillment stages, and monitor sales revenue.

This project was built as a clean, production-grade academic system emphasizing:
- **Cross-platform support** for Android and iOS using **React Native CLI** (strictly without Expo or Firebase).
- **Strict Role-Based Access Control (RBAC)** supporting exactly two roles: `client` and `seller`.
- **Authoritative server-side pricing & stock validation** using PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) in transactions to prevent race conditions and price tampering.
- **Multilingual interface** supporting **English (en)** and **Kinyarwanda (rw)**.
- **Modern, high-contrast Rwandan retail aesthetic**: Forest Green (`#1B5E20`), Warm Orange (`#E65100`), crisp white cards (`#FFFFFF`), and slate text.

---

## 2. User Roles & System Requirements

The system enforces two distinct roles without unnecessary complexity:

```mermaid
graph TD
    User([App User]) -->|Public App Registration| Client[Client Role]
    BackendCLI([Backend CLI Script]) -->|Admin Provisioning| Seller[Seller Role]

    Client -->|Browse & Search| Catalog[Product Catalog]
    Client -->|Add to Cart & Checkout| Orders[Place Orders - Pay on Delivery]
    Client -->|View Own| OrderHistory[Client Order History]

    Seller -->|CRUD Operations| Inventory[Product Management]
    Seller -->|Update Status FSM| OrderFulfillment[Order Status: Confirmed / Shipped / Delivered / Cancelled]
    Seller -->|Delivered Orders Summary| Metrics[Sales Summary & Revenue]
```

### A. Client Role
- **Self-Registration & Authentication**: Public sign-up strictly assigns the `client` role. Attempts to escalate privileges via request payload tampering are rejected by the backend.
- **Catalog Browsing**: Real-time search by product name, category filtering (Electronics, Fashion, Food & Groceries, Home & Living, Beauty & Health, Other), and detailed product view with stock availability.
- **Shopping Cart**: Client-side persistent cart with automated stock upper-bound clamping.
- **Checkout & Orders**: Cash on Delivery in Rwamagana. Prices are computed authoritatively on the backend from the database. Cart is preserved if checkout fails and cleared only upon backend success.
- **Order Tracking**: Real-time order history showing status chips: `Pending` ⏳, `Confirmed` 📦, `Shipped` 🚚, `Delivered` ✅, and `Cancelled` ❌.

### B. Seller Role
- **Strict Provisioning**: Sellers cannot register publicly; seller accounts are provisioned exclusively via the backend CLI script `npm run create-seller`.
- **Product Management**: Full CRUD capability (Add, Edit, Delete, Stock Update). Sellers can only modify and delete their own products.
- **Order Management**: View incoming orders containing their products, customer contact numbers, delivery addresses, and line items.
- **Finite-State Machine (FSM) Order Processing**:
  - `Pending` ➡️ `Confirmed` ➡️ `Shipped` ➡️ `Delivered`
  - Cancellation allowed from `Pending` or `Confirmed`
  - Terminal states (`Delivered`, `Cancelled`) are immutable.
- **Sales Analytics**: Aggregated dashboard displaying total fulfilled orders and total revenue in Rwandan Francs (RWF).

---

## 3. Technology Stack

### Mobile Application (`/mobile`)
- **Framework**: React Native CLI (`0.78.0`)
- **Language**: JavaScript / TypeScript
- **Navigation**: React Navigation v7 (Native Stack & Bottom Tabs)
- **HTTP Client**: Axios with automated JWT Bearer authorization interceptors
- **State Management**: React Context API (`AuthContext`, `CartContext`)
- **Localization**: `i18next` and `react-i18next` with `AsyncStorage` language persistence
- **Storage**: `@react-native-async-storage/async-storage`
- **Linting & Quality**: ESLint with strict React Native configuration

### Backend API (`/backend`)
- **Runtime**: Node.js (v18+) with Express.js (`4.21.2`)
- **Database Driver**: `pg` (Node-Postgres) with SSL support
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` password hashing
- **Security**: Strict CORS policies, input validation middleware, parameterized SQL queries
- **Testing**: Jest (`29.7.0`) and Supertest (`7.0.0`)

### Cloud Database & Deployment
- **Database**: [Neon](https://neon.tech/) Serverless PostgreSQL (Project: `patient-scene-48311921`)
- **API Hosting**: [Render](https://render.com/) (Web Service with dynamic port binding)

---

## 4. Directory Structure

```
DGECommerce/
├── backend/                     # Node.js Express Backend API
│   ├── migrations/              # PostgreSQL SQL schema migrations
│   │   └── 001_initial_schema.sql
│   ├── scripts/                 # CLI administrative & setup scripts
│   │   ├── createSeller.js      # Seller account provisioning script
│   │   ├── inspectDb.js         # Database table schema inspector
│   │   └── migrate.js           # Automated migration runner
│   ├── src/
│   │   ├── config/              # Database pool & environment loader
│   │   ├── controllers/         # auth, product, order, seller controllers
│   │   ├── middleware/          # authenticate, authorize, errorHandler
│   │   ├── routes/              # Express route declarations
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # HTTP server entry point
│   ├── tests/                   # Automated integration test suites
│   │   ├── health.test.js
│   │   ├── db.test.js
│   │   ├── auth.test.js
│   │   ├── product.test.js
│   │   └── order.test.js
│   ├── package.json
│   └── .env.example
├── mobile/                      # React Native CLI Mobile Application
│   ├── android/                 # Native Android Gradle configuration
│   ├── ios/                     # Native iOS CocoaPods configuration
│   ├── src/
│   │   ├── components/          # Reusable UI (ProductCard, EmptyState, etc.)
│   │   ├── context/             # AuthContext and CartContext
│   │   ├── localization/        # i18n configuration, en.json, rw.json
│   │   ├── navigation/          # AppNavigator, ClientNavigator, SellerNavigator
│   │   ├── screens/             # 12 complete application screens
│   │   ├── services/            # Axios API client and feature services
│   │   └── config/              # Dynamic environment configuration
│   ├── __tests__/               # Jest unit & snapshot tests
│   ├── App.tsx                  # Root application entry component
│   └── package.json
├── prompt.md                    # Project requirements and prompt specification
├── TESTING_REPORT.md            # Comprehensive test execution report
└── ACADEMIC_REPORT_TEMPLATE.md  # Formal university defense documentation template
```

---

## 5. Prerequisites & Environment Setup

Before building and running the project, ensure your workstation has:
1. **Node.js**: `v18.x` or `v20.x` LTS ([Download](https://nodejs.org/))
2. **Java Development Kit**: JDK 17 (Recommended: Eclipse Temurin JDK 17)
3. **Android Studio**: Installed with Android SDK Platform 34 and Android Virtual Device (AVD)
4. **Environment Variables (Windows)**:
   - `JAVA_HOME` pointing to JDK 17 directory (e.g., `C:\Program Files\Eclipse Adoptium\jdk-17...`)
   - `ANDROID_HOME` pointing to Android SDK (e.g., `%LOCALAPPDATA%\Android\Sdk`)
   - `Path` updated with `%ANDROID_HOME%\platform-tools`, `%ANDROID_HOME%\emulator`, and `%JAVA_HOME%\bin`

---

## 6. Installation & Local Execution

### Step 1: Install Backend Dependencies
In a terminal, navigate to the `backend` directory:
```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment Variables
Create a `.env` or `.env.local` file inside `backend/`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:npg_YOUR_PASSWORD@ep-patient-scene-48311921.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=dgecommerce_super_secure_jwt_secret_key_2026
```

### Step 3: Run Database Migrations & Provision Seller
```bash
# Execute schema migrations on Neon PostgreSQL
npm run migrate

# (Optional) Verify created tables in database
npm run inspect-db

# Provision an initial seller account
npm run create-seller
```

### Step 4: Start Backend API
```bash
# Development mode with live reload
npm run dev

# Or standard production mode
npm start
```
The server will start listening at `http://localhost:5000`. You can verify by opening `http://localhost:5000/health` in your browser.

---

### Step 5: Install Mobile Application Dependencies
In a separate terminal, navigate to the `mobile` directory:
```bash
cd mobile
npm install
```

### Step 6: Start Metro Bundler
```bash
npm start
```

### Step 7: Run on Android
Make sure your Android Emulator is running (or a physical Android phone is connected with USB Debugging enabled):
```bash
# In mobile/ directory
npm run android
```
> **Networking Note for Android**:
> - The Android Emulator accesses the development machine host via `10.0.2.2`.
> - The mobile application automatically configures `http://10.0.2.2:5000` in `mobile/src/config/environment.js`.
> - Alternatively, execute `adb reverse tcp:5000 tcp:5000` to allow `http://localhost:5000`.

### Step 8: Run on iOS (macOS only)
```bash
cd ios
pod install
cd ..
npm run ios
```

---

## 7. Database Architecture & Schema

The relational schema is hosted on **Neon PostgreSQL** and enforces data integrity through foreign keys, check constraints, and unique indices.

```mermaid
erDiagram
    USERS ||--o{ PRODUCTS : "owns / sells"
    USERS ||--o{ ORDERS : "places (client)"
    PRODUCTS ||--o{ ORDER_ITEMS : "included in"
    ORDERS ||--|{ ORDER_ITEMS : "contains"

    USERS {
        serial id PK
        varchar name
        varchar email UK
        varchar password_hash
        varchar role "CHECK: client | seller"
        timestamp created_at
    }

    PRODUCTS {
        serial id PK
        integer seller_id FK
        varchar name
        text description
        numeric price "CHECK: >= 0"
        integer stock "CHECK: >= 0"
        varchar category
        varchar image_url
        timestamp created_at
        timestamp updated_at
    }

    ORDERS {
        serial id PK
        integer client_id FK
        numeric total_amount "CHECK: >= 0"
        varchar status "CHECK: Pending|Confirmed|Shipped|Delivered|Cancelled"
        text delivery_address
        varchar phone_number
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        serial id PK
        integer order_id FK
        integer product_id FK
        integer quantity "CHECK: > 0"
        numeric unit_price "CHECK: >= 0"
    }
```

---

## 8. REST API Reference

All protected endpoints require the HTTP header:  
`Authorization: Bearer <JWT_TOKEN>`

### Health & Monitoring
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/health` | Public | System status, database connection, and timestamp |

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Request Body | Description |
|:---|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | Public | `{ name, email, password }` | Registers a client account (strictly client role) |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticates user; returns JWT token and profile |
| `GET` | `/api/auth/me` | Authenticated | *None* | Returns the currently authenticated user session |

### Products (`/api/products`)
| Method | Endpoint | Access | Query / Body | Description |
|:---|:---|:---|:---|:---|
| `GET` | `/api/products` | Public | `?search=...&category=...` | List all products with optional filters |
| `GET` | `/api/products/:id` | Public | *None* | Get details of a single product |
| `GET` | `/api/products/seller/my-products` | Seller | *None* | List products belonging to the logged-in seller |
| `POST` | `/api/products` | Seller | `{ name, price, stock, category, ... }` | Create a new product |
| `PUT` | `/api/products/:id` | Seller | `{ name, price, stock, category, ... }` | Update product details (ownership checked) |
| `DELETE` | `/api/products/:id` | Seller | *None* | Delete a product (ownership checked) |

### Orders & Checkout (`/api/orders`)
| Method | Endpoint | Access | Request Body | Description |
|:---|:---|:---|:---|:---|
| `POST` | `/api/orders` | Client | `{ items: [{ productId, quantity }], deliveryAddress, phoneNumber }` | Transactional checkout with `FOR UPDATE` stock locking |
| `GET` | `/api/orders/my-orders` | Client | *None* | Retrieve client's historical orders |
| `GET` | `/api/orders/:id` | Client/Seller | *None* | Retrieve order details and items (ownership checked) |

### Seller Operations (`/api/seller`)
| Method | Endpoint | Access | Request Body | Description |
|:---|:---|:---|:---|:---|
| `GET` | `/api/seller/orders` | Seller | *None* | Retrieve all orders containing seller's items |
| `PATCH` | `/api/seller/orders/:id/status` | Seller | `{ status: "Confirmed" \| "Shipped" \| "Delivered" \| "Cancelled" }` | Update order state with FSM transition rules |
| `GET` | `/api/seller/sales-summary` | Seller | *None* | Summary analytics (delivered count and revenue) |

---

## 9. Automated Testing & Verification

The project includes unit, integration, and lint test suites verifying database transactions, privilege escalation security, and mobile rendering.

### Running Backend Tests
From the `backend/` directory:
```bash
npm test
```
**Test Results**:
- `tests/health.test.js`: Health endpoint response verification.
- `tests/db.test.js`: Live Neon PostgreSQL pool connection verification.
- `tests/auth.test.js`: Registration validation, role tampering rejection, and login JWT issuance.
- `tests/product.test.js`: Catalog listing, seller creation, and cross-seller ownership guards.
- `tests/order.test.js`: Multi-item checkout transactions, stock deduction, FSM status transitions, and revenue aggregation.
- **Summary**: **5 Test Suites Passed, 32 Tests Passed (100% Success Rate)**.

### Running Mobile Tests & Linter
From the `mobile/` directory:
```bash
# Run Jest Component Tests
npm test

# Run ESLint Static Code Analysis
npm run lint
```
**Summary**: **1 Test Suite Passed, 0 ESLint errors, 0 ESLint warnings**.

---

## 10. Render Deployment Guide

Follow these steps to deploy the backend API to [Render](https://render.com):

1. **Create Web Service**:
   - Log into Render dashboard and click **New + > Web Service**.
   - Connect your GitHub repository containing the `DGECommerce` project.
2. **Configure Service Settings**:
   - **Name**: `dgecommerce-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. **Configure Environment Variables**:
   In the Render service settings, add:
   - `DATABASE_URL`: `postgresql://neondb_owner:PASSWORD@ep-patient-scene-48311921.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - `JWT_SECRET`: A secure random secret string
   - `NODE_ENV`: `production`
4. **Deploy Service**:
   - Click **Create Web Service**. Render will provision your container, execute `npm install`, and start `node src/server.js`.
5. **Update Mobile Client API URL**:
   In `mobile/src/config/environment.js`, set `RENDER_API_URL` to your live Render endpoint:
   ```javascript
   export const RENDER_API_URL = 'https://dgecommerce-api.onrender.com';
   ```

---

## 11. Troubleshooting & FAQ

| Problem | Cause | Solution |
|:---|:---|:---|
| **Network request failed on Android Emulator** | Android cannot connect to `localhost:5000` | Ensure `mobile/src/config/environment.js` points to `http://10.0.2.2:5000`, or run `adb reverse tcp:5000 tcp:5000`. |
| **Metro bundler syntax / stale cache error** | Metro cached old dependencies | Restart Metro with: `npm start -- --reset-cache`. |
| **PostgreSQL SSL Warning in logs** | Node `pg` warning regarding libpq aliases | The connection operates securely under `ssl: { rejectUnauthorized: false }`. No code change is needed. |
| **Jest Hook Timeout (5000ms)** | Remote Neon PostgreSQL latency during multiple roundtrips | Jest test script is configured with `--testTimeout=30000` to accommodate cloud database latency. |
| **Gradle Android Build Failure** | Stale build artifacts | In `mobile/android/`, run `./gradlew clean` and rebuild. |

---

## 12. Academic Defense Deliverables

For project examination and academic reporting, refer to:
- **[TESTING_REPORT.md](TESTING_REPORT.md)**: Full test execution matrix with input data, expected vs. actual results, and status.
- **[ACADEMIC_REPORT_TEMPLATE.md](ACADEMIC_REPORT_TEMPLATE.md)**: Formal academic project documentation template matching university submission guidelines.
