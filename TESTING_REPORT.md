# D&G E-Commerce Testing Report

**Project**: D&G E-Commerce Mobile Application  
**Location**: Rwamagana, Rwanda  
**Execution Date**: October 25, 2026  
**Environment**:
- **Backend**: Node.js v18+, Express.js 4.21.2, Jest 29.7.0, Supertest 7.0.0
- **Database**: Neon Serverless PostgreSQL (Branch: `production`, Project: `patient-scene-48311921`)
- **Mobile**: React Native CLI 0.78.0, Jest 29.7.0, ESLint 8.57.1

---

## 1. Executive Summary

| Test Domain | Suites | Executed Tests | Passed | Failed | Success Rate |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Backend Integration & Unit Tests** | 5 | 32 | 32 | 0 | **100%** |
| **Mobile Component & Snapshot Tests** | 1 | 1 | 1 | 0 | **100%** |
| **Static Code Analysis (ESLint)** | 1 | Full Codebase | 0 errors | 0 warnings | **100%** |
| **Overall Quality Gate** | **7** | **34 Checks** | **34** | **0** | **PASS** |

---

## 2. Automated Backend Test Suite Results

The following table documents all 32 automated tests executed against the live cloud **Neon PostgreSQL** database.

### Suite 1: System Health (`tests/health.test.js`)
| Test ID | Test Case | Expected Result | Actual Result | Pass / Fail | Notes |
|:---|:---|:---|:---|:---:|:---|
| `TC-BE-01` | `GET /health` returns server health | HTTP 200, `{ status: "OK", database: "connected" }` | HTTP 200, valid JSON payload with timestamp | **PASS** | Confirms server is running and database pool is active. |

### Suite 2: Database Connectivity (`tests/db.test.js`)
| Test ID | Test Case | Expected Result | Actual Result | Pass / Fail | Notes |
|:---|:---|:---|:---|:---:|:---|
| `TC-BE-02` | `checkDatabaseConnection()` function | Resolves boolean `true` | Resolved `true` | **PASS** | Direct pool query executed against Neon. |
| `TC-BE-03` | Schema Verification: `users` table | Table exists in `public` schema | Table confirmed present | **PASS** | Confirms initial schema migration executed. |
| `TC-BE-04` | Schema Verification: `products` table | Table exists in `public` schema | Table confirmed present | **PASS** | Confirms foreign key references to `users(id)`. |
| `TC-BE-05` | Schema Verification: `orders` table | Table exists in `public` schema | Table confirmed present | **PASS** | Confirms check constraint on `status`. |
| `TC-BE-06` | Schema Verification: `order_items` table | Table exists in `public` schema | Table confirmed present | **PASS** | Confirms join table between `orders` and `products`. |

### Suite 3: Authentication & Authorization (`tests/auth.test.js`)
| Test ID | Test Case | Expected Result | Actual Result | Pass / Fail | Notes |
|:---|:---|:---|:---|:---:|:---|
| `TC-BE-07` | `POST /api/auth/register` with missing fields | HTTP 400 with descriptive error message | HTTP 400, "Name, email, and password (min 6 characters) are required." | **PASS** | Validates input completeness and minimum password length. |
| `TC-BE-08` | `POST /api/auth/register` privilege escalation check | HTTP 201, user assigned role `client` even if `role: "seller"` passed | HTTP 201, `user.role === "client"` | **PASS** | **Security Rule**: Public registration must never grant seller privileges. |
| `TC-BE-09` | `POST /api/auth/register` duplicate email | HTTP 400, "Email is already registered" | HTTP 400, "Email is already registered" | **PASS** | Enforces `users.email` unique constraint. |
| `TC-BE-10` | `POST /api/auth/login` with missing fields | HTTP 400, "Email and password are required" | HTTP 400, "Email and password are required" | **PASS** | Input sanitation guard. |
| `TC-BE-11` | `POST /api/auth/login` with unregistered email | HTTP 401, "Invalid email or password" | HTTP 401, "Invalid email or password" | **PASS** | Constant-response error prevents account enumeration. |
| `TC-BE-12` | `POST /api/auth/login` with incorrect password | HTTP 401, "Invalid email or password" | HTTP 401, "Invalid email or password" | **PASS** | `bcrypt.compare` failure check. |
| `TC-BE-13` | `POST /api/auth/login` with valid credentials | HTTP 200, JWT token and user profile returned | HTTP 200, `token` string and `user` object returned | **PASS** | Signs JWT with 7-day expiration. |
| `TC-BE-14` | `GET /api/auth/me` without Bearer token | HTTP 401, "Authentication token missing" | HTTP 401, "Authentication token missing" | **PASS** | JWT authentication middleware guard. |
| `TC-BE-15` | `GET /api/auth/me` with valid token | HTTP 200 with authenticated user profile | HTTP 200, user id, email, and role match token | **PASS** | Session verification endpoint. |

### Suite 4: Product Management & Access Control (`tests/product.test.js`)
| Test ID | Test Case | Expected Result | Actual Result | Pass / Fail | Notes |
|:---|:---|:---|:---|:---:|:---|
| `TC-BE-16` | `GET /api/products` (Catalog list) | HTTP 200 with array of products | HTTP 200, array of products returned | **PASS** | Publicly accessible without authentication. |
| `TC-BE-17` | `GET /api/products?search=...` | HTTP 200 returning filtered products | HTTP 200, case-insensitive ILIKE match | **PASS** | Parameterized query protects against SQL injection. |
| `TC-BE-18` | `GET /api/products?category=...` | HTTP 200 returning category matches | HTTP 200, category exact match | **PASS** | Category filter check. |
| `TC-BE-19` | `GET /api/products/:id` with valid ID | HTTP 200 with product details and seller name | HTTP 200, product object with seller name | **PASS** | Single product detail fetch. |
| `TC-BE-20` | `GET /api/products/999999` (Non-existent) | HTTP 404, "Product not found" | HTTP 404, "Product not found" | **PASS** | 404 error handling verified. |
| `TC-BE-21` | `POST /api/products` as client | HTTP 403, "Access denied. Seller role required." | HTTP 403, "Access denied" | **PASS** | Role authorization middleware blocks clients. |
| `TC-BE-22` | `POST /api/products` with missing fields | HTTP 400 with validation message | HTTP 400, "Name, price, and stock are required" | **PASS** | Data validation guard. |
| `TC-BE-23` | `POST /api/products` as seller | HTTP 201 with newly created product object | HTTP 201, product inserted with `seller_id` | **PASS** | Seller product creation. |
| `TC-BE-24` | `PUT /api/products/:id` cross-seller update | HTTP 403, "Access denied: You do not own this product" | HTTP 403, ownership error returned | **PASS** | **Security Rule**: Seller B cannot modify Seller A's items. |
| `TC-BE-25` | `PUT /api/products/:id` by owner seller | HTTP 200 with updated fields | HTTP 200, price and stock updated | **PASS** | Seller modifying own product. |
| `TC-BE-26` | `DELETE /api/products/:id` cross-seller | HTTP 403, "Access denied" | HTTP 403, ownership error returned | **PASS** | Cross-seller deletion prevention. |
| `TC-BE-27` | `DELETE /api/products/:id` by owner | HTTP 200, "Product deleted successfully" | HTTP 200, record removed from database | **PASS** | Seller deleting own product. |

### Suite 5: Orders, Checkout & Fulfillment (`tests/order.test.js`)
| Test ID | Test Case | Expected Result | Actual Result | Pass / Fail | Notes |
|:---|:---|:---|:---|:---:|:---|
| `TC-BE-28` | `POST /api/orders` transactional checkout | HTTP 201, computes authoritative DB total, decrements product stock | HTTP 201, total = `quantity * db_unit_price`, stock decremented by quantity | **PASS** | Uses `SELECT ... FOR UPDATE` row lock inside transaction. |
| `TC-BE-29` | `POST /api/orders` stock overflow | HTTP 400, "Insufficient stock for product..." | HTTP 400, transaction aborted, no order created | **PASS** | Transaction rollback verified. |
| `TC-BE-30` | `GET /api/orders/my-orders` client history | HTTP 200 with list of client's orders | HTTP 200, only orders belonging to client returned | **PASS** | Client order privacy enforced. |
| `TC-BE-31` | `GET /api/orders/:id` unauthorized client | HTTP 403, "Access denied" | HTTP 403, "Access denied" | **PASS** | Client B cannot view Client A's order details. |
| `TC-BE-32` | `PATCH /api/seller/orders/:id/status` FSM | Status transitions through Pending ➡️ Confirmed ➡️ Shipped ➡️ Delivered. Invalid transitions rejected. | HTTP 200 on valid transitions; HTTP 400 when attempting transition from terminal state | **PASS** | Finite-state machine prevents illegal transitions. |

---

## 3. Mobile Automated Testing Results

### Jest Unit & Snapshot Suite (`mobile/__tests__/App.test.tsx`)
| Test ID | Test Case | Expected Result | Actual Result | Pass / Fail | Notes |
|:---|:---|:---|:---|:---:|:---|
| `TC-MO-01` | App Root Component Rendering | Mounts `App` with `AuthProvider`, `CartProvider`, `AppNavigator` | Component renders cleanly without exceptions | **PASS** | Validates navigation container and context binding. |

### Static Code Analysis (`npm run lint` in `mobile/`)
| Metric | Expected Standard | Actual Measurement | Pass / Fail |
|:---|:---|:---|:---:|
| **ESLint Error Count** | 0 Errors | **0 Errors** | **PASS** |
| **ESLint Warning Count** | 0 Warnings | **0 Warnings** | **PASS** |
| **Code Style Compliance** | React Native ESLint Rules | Full conformance across 12 screens | **PASS** |

---

## 4. End-to-End Manual Testing Matrix

| Flow # | User Action / Flow | Expected System Response | Verification Method | Status |
|:---:|:---|:---|:---|:---:|
| **1** | New customer registers via mobile app | Account created with `role: 'client'`. Automatically redirected to client tab navigation. | Verified in mobile UI & DB table inspection | **PASS** |
| **2** | Client searches "Beans" in Search bar | Products list dynamically filters to display products matching "Beans". | Dynamic text input test | **PASS** |
| **3** | Client filters by "Electronics" | Displays only electronics category products. | Filter pill selection | **PASS** |
| **4** | Client adds 2 items to cart | Cart badge increments to 2. Stock upper limit prevents adding more than available inventory. | Button click & badge check | **PASS** |
| **5** | Client checks out with Delivery Address in Rwamagana | Order placed with status `Pending`. Cart is cleared only after server returns HTTP 201. | Checkout form submission | **PASS** |
| **6** | Client views Order History | Placed order appears with date, total RWF, and status chip `Pending`. | Orders tab navigation | **PASS** |
| **7** | Seller logs in with seller credentials | App renders Seller Navigation (Dashboard, Manage Products, Sales Summary, Profile). | Role-based router switch | **PASS** |
| **8** | Seller adds new product | Product appears immediately in seller inventory and public catalog. | Form submission & refresh | **PASS** |
| **9** | Seller progresses order from `Pending` to `Confirmed` | Order status changes to `Confirmed` with blue chip. | Dropdown status picker | **PASS** |
| **10** | Seller progresses order to `Delivered` | Order status changes to `Delivered` with green chip. Sales summary total revenue updates. | Status update & Sales screen | **PASS** |
| **11** | User changes language from English to Kinyarwanda | All UI labels (buttons, tabs, headers, status chips) translate to Kinyarwanda. Selection persists across app restart. | Language toggle in Profile | **PASS** |

---

## 5. Conclusion & Certification

All 32 backend automated integration tests and mobile unit tests executed with a **100% pass rate**. The application meets all architectural, functional, security, and academic standards established in the project specification.
