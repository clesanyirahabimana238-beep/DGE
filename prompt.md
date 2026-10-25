# D&G E-COMMERCE MOBILE APPLICATION
## Complete Project Development and Deployment Instructions

### 1. PROJECT OVERVIEW

Develop a simple, functional, cross-platform mobile application called D&G E-Commerce for a retail business located in Rwamagana, Rwanda.

The application will allow customers to browse and purchase products while sellers manage their products and customer orders.

This is an academic project. Keep the application manageable, beginner-friendly, secure, and easy to demonstrate.

The application must run on Android and iOS.

The system has exactly two user roles:
1. Client
2. Seller

Do not create additional user roles or unnecessary features.

### 2. MANDATORY TECHNOLOGIES

#### Mobile application
- React Native CLI.
- JavaScript.
- React Navigation.
- Axios.
- React Context API.
- React Hook Form.
- A compatible validation library.
- i18next and react-i18next.
- Appropriate secure storage for authentication credentials.

#### Backend
- Node.js.
- Express.js.
- JavaScript.
- PostgreSQL driver: pg.
- JWT authentication.
- bcrypt password hashing.
- Environment variables.
- Parameterized SQL queries.

#### Database and deployment
- Neon PostgreSQL for the database.
- Render for hosting the backend API.
- Git and GitHub for version control, if available.

IMPORTANT:
- Use React Native CLI, not Expo.
- Do not use create-expo-app.
- Do not install Expo or expo-router.
- Do not replace React Native CLI with another mobile framework.
- Do not use Firebase.
- Do not put database credentials in the mobile application.
- Do not introduce unnecessary technologies.
- Use compatible package versions.
- Follow current official React Native setup instructions.

### 3. DEVELOPMENT ENVIRONMENT

First inspect the existing workspace.

Check:
- Node.js and npm.
- Java and Android development prerequisites.
- Android Studio and Android SDK.
- Existing React Native project files.
- Existing backend files.
- Installed dependencies.
- Existing Neon configuration.
- Existing environment variables.
- Existing database schema.

Do not overwrite or delete existing work unnecessarily.

If the mobile project does not exist, create it using the React Native Community CLI.

If the project already exists, inspect and reuse it.

Use PowerShell-compatible commands when working on Windows.

The project should have two separate directories:

DGECommerce/
    mobile/
    backend/

Adapt this structure if the existing project already uses a different organization.

Clearly explain which directory each command must run in.

### 4. USER ROLES AND RESPONSIBILITIES

#### A. CLIENT

Clients can:
1. Register an account.
2. Log in and log out.
3. Browse available products.
4. Search for products by name.
5. Filter products by category.
6. View product details, images, descriptions, prices, and stock.
7. Add products to the shopping cart.
8. Increase or decrease quantities.
9. Remove products from the cart.
10. View the cart total.
11. Enter a delivery address and place an order.
12. View their order history and order details.
13. Check order statuses.
14. Change the application language between English and Kinyarwanda.

Clients must not manage products or access seller functions.

Clients must only access their own orders and personal information.

#### B. SELLER

Sellers can:
1. Log in to a seller account.
2. View the products they manage.
3. Add products.
4. Edit product information.
5. Delete products.
6. View customer orders.
7. Update order statuses.
8. View a simple sales summary.

The sales summary should display the number of delivered orders and the total sales from delivered orders.

Do not build a complex seller dashboard.

#### SELLER ACCOUNT SECURITY

Public registration must always create a client account.

Do not let users become sellers by modifying a registration request or changing a role in the mobile application.

Provide a secure server-side seller account creation script or another documented, authorized setup process.

Read seller setup credentials from environment variables or use an interactive setup process.

Never hardcode real passwords or JWT secrets.

### 5. MOBILE APPLICATION SCREENS

Create these screens.

#### Authentication
- LoginScreen.js
- RegisterScreen.js

#### Client
- HomeScreen.js
- ProductsScreen.js
- ProductDetailsScreen.js
- CartScreen.js
- CheckoutScreen.js
- OrdersScreen.js
- OrderDetailsScreen.js
- ProfileScreen.js

#### Seller
- SellerDashboardScreen.js
- ManageProductsScreen.js
- AddEditProductScreen.js
- SellerOrdersScreen.js
- SalesSummaryScreen.js

Do not add more screens unless a feature genuinely requires them.

Use one login screen for both user roles.

After authentication:
- Clients should enter client navigation.
- Sellers should enter seller navigation.

Use React Navigation with protected navigation flows.

Do not rely only on hiding buttons to secure seller functionality. Enforce permissions on the backend.

### 6. MOBILE INTERFACE DESIGN

Create a clean and modern shopping application.

Use this color scheme:
- Dark green as the primary color.
- White for cards and main surfaces.
- Orange for important buttons and accents.
- Light gray for the background.

The home screen should include:
- D&G E-Commerce branding.
- Search bar.
- Product categories.
- Product listing.
- Product cards.
- Product images.
- Product names and prices.
- Stock availability.
- Shopping cart access.
- Profile access.

Use standard React Native components:
- View.
- Text.
- TextInput.
- Image.
- Pressable.
- FlatList.
- ScrollView.
- ActivityIndicator.

Use FlatList for product lists.

Provide loading indicators, error messages, success messages, empty states, and form validation.

Ensure that layouts work on different Android and iOS screen sizes.

### 7. NEON POSTGRESQL CONFIGURATION

Use the existing Neon organization, project, and branch provided for this application.

Organization ID:
org-solitary-flower-89261455

Project ID:
patient-scene-48311921

Branch:
production

Service:
postgres

Do not create another Neon project unless the existing project cannot be accessed or I explicitly authorize a replacement.

#### Step 7.1: Inspect Neon configuration

Inspect the backend project directory and determine whether the Neon CLI is installed.

Attempt:

npm i -g neon@latest

If global installation fails, use:

npx neon@latest

If a Neon command opens a browser sign-in, ask me to finish authentication in the browser.

If authentication times out or fails, ask me to run:

neon login

Then retry the command.

Do not claim that authentication succeeded unless the command confirms it.

#### Step 7.2: Initialize Neon

From the appropriate project root, execute:

neon init -y --org-id org-solitary-flower-89261455 --project-id patient-scene-48311921 --branch production --services postgres

Inspect the generated configuration before modifying other files.

Preserve existing application code and database data.

#### Step 7.3: Deploy Neon configuration

Execute:

neon deploy

Inspect the output and determine which services were provisioned and which environment variables were created.

The command may create or update .env.local or .env, depending on the project's configuration.

Do not assume that environment variables were configured successfully. Verify the actual result.

Do not display secrets in logs or reports.

If the command fails, report the actual error and explain how to resolve it.

Do not create a new database connection string manually when Neon can provide the correct one.

#### Step 7.4: Consult Neon documentation and agent skills

Consult installed Neon agent skills if available in the development environment.

If no suitable skills are installed, consult official Neon documentation.

Use the PostgreSQL driver appropriate for the backend architecture. For this Express.js application, use pg unless the existing implementation provides a compelling reason to use another supported driver.

Do not use a browser-oriented database driver in the Node.js backend without a clear technical reason.

#### Step 7.5: Configure environment variables

Use the following server-side environment variables as applicable:

DATABASE_URL
JWT_SECRET
PORT
NODE_ENV

Use additional variables only when required.

Provide a .env.example file containing placeholder values, not real secrets.

Configure the backend to load local environment variables when running in development.

Ensure .env and other secret files are excluded from Git.

Do not expose DATABASE_URL or JWT_SECRET in:
- App.js.
- React Native source files.
- Mobile application bundles.
- Public API responses.
- GitHub repositories.
- Screenshots or reports.

If a real database password has been exposed, stop and ask me to rotate it before using the connection string again.

Never print the complete connection string in terminal output or final reports.

### 8. DATABASE SCHEMA

Inspect the existing Neon database before applying schema changes.

Create or update the following tables using safe, repeatable database migrations where practical.

Do not drop existing tables or erase existing data.

#### USERS TABLE

Fields:
- id: primary key.
- name: user's name.
- email: unique email address.
- password_hash: hashed password.
- role: client or seller.
- created_at: account creation timestamp.

Use appropriate PostgreSQL data types and constraints.

#### PRODUCTS TABLE

Fields:
- id: primary key.
- name.
- description.
- price.
- category.
- image_url.
- stock_quantity.
- seller_id: foreign key referencing users.
- created_at.
- updated_at.

Rules:
- Price cannot be negative.
- Stock cannot be negative.
- Only sellers may own products.
- Sellers may modify only their own products.

#### ORDERS TABLE

Fields:
- id: primary key.
- client_id: foreign key referencing users.
- total_amount.
- status.
- delivery_address.
- created_at.
- updated_at.

#### ORDER_ITEMS TABLE

Fields:
- id: primary key.
- order_id: foreign key referencing orders.
- product_id: foreign key referencing products.
- quantity.
- unit_price.

Save the product price at the time the order is placed.

Use suitable foreign keys, indexes, and constraints.

Use database transactions during checkout.

Prevent invalid quantities and orders that exceed available stock.

Do not trust prices or order totals sent by the mobile application. Calculate them using authoritative database values.

Do not create fake users or products unless I explicitly authorize test data.

### 9. BACKEND PROJECT STRUCTURE

Use a structure similar to:

backend/
    src/
        config/
            database.js
        middleware/
            authenticate.js
            authorize.js
            errorHandler.js
        controllers/
            authController.js
            productController.js
            orderController.js
            sellerController.js
        routes/
            authRoutes.js
            productRoutes.js
            orderRoutes.js
            sellerRoutes.js
        app.js
        server.js
    migrations/
    scripts/
        createSeller.js
    tests/
    .env.example
    package.json
    README.md

Keep the code modular and readable.

Use parameterized SQL queries.

Validate request bodies and query parameters.

Use centralized error handling.

Do not expose database details in error responses.

### 10. AUTHENTICATION AND AUTHORIZATION

Implement:
- Client registration.
- Client and seller login.
- JWT authentication.
- Password hashing using bcrypt.
- Authentication middleware.
- Role-based authorization middleware.
- Protected routes.
- Logout on the mobile application.
- Appropriate secure storage for authentication credentials.

The backend must never return password hashes.

A client must not be able to:
- Create or modify products.
- Delete products.
- View seller dashboards.
- Access another client's orders.
- Change order statuses.
- Create a seller account through public registration.

A seller must not be able to access another user's private account information or perform unauthorized operations.

Use JWT validation on protected backend routes.

For logout, clear the local authentication credentials. Explain any limitations if server-side token revocation is not implemented.

### 11. BACKEND API ENDPOINTS

Implement these endpoints.

#### Health

GET /health

Return a simple health response.

Provide a separate database readiness check or test script that verifies PostgreSQL connectivity without exposing secrets.

#### Authentication

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me

Public registration must always create a client.

#### Products

GET /api/products
GET /api/products/:id
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id

Support search and category filtering.

Example:

GET /api/products?search=shoes&category=Shoes

Only authenticated sellers can create, update, and delete products.

Enforce product ownership on the backend.

#### Client Orders

POST /api/orders
GET /api/orders/my-orders
GET /api/orders/:id

Clients can create orders and view their own order histories.

Verify ownership before returning an order.

#### Seller Orders

GET /api/seller/orders
PATCH /api/seller/orders/:id/status

Only authenticated sellers can access these endpoints.

Allow these statuses:
- Pending.
- Confirmed.
- Shipped.
- Delivered.
- Cancelled.

Validate status transitions.

Prevent invalid status changes and unauthorized order modifications.

#### Seller Sales Summary

GET /api/seller/sales-summary

Return:
- Number of delivered orders.
- Total sales from delivered orders.

Count each qualifying order once.

Document the sales calculation.

### 12. SHOPPING CART AND CHECKOUT

Implement the following process:

1. The client browses products.
2. The client adds products to the cart.
3. The client changes quantities or removes products.
4. The client reviews the cart.
5. The client enters a delivery address.
6. The client confirms the order.
7. The backend validates product availability, prices, and quantities.
8. The backend creates the order and order items in a transaction.
9. The backend reduces stock safely.
10. The application clears the cart only after successful order creation.
11. The client can view the order history.
12. The seller can view and update the order status.

Handle stock conflicts and repeated checkout requests appropriately.

Do not clear the cart if checkout fails.

Do not integrate real payment gateways or mobile money in this version.

Clearly explain that creating an order does not mean payment has been received.

### 13. MOBILE APPLICATION API INTEGRATION

Use Axios.

Create a centralized API configuration and separate service files for authentication, products, orders, and seller operations.

Read the backend API base URL from suitable mobile application configuration.

Use the development backend address when testing locally and the deployed Render backend URL in production.

Document the different configurations for:
- Android emulator.
- Physical Android device.
- Production backend on Render.

Do not hardcode localhost as the production API address.

Do not put the Neon database URL in mobile configuration.

Handle:
- Loading states.
- API errors.
- Network failures.
- Invalid credentials.
- Expired tokens.
- Empty product lists.
- Empty order histories.
- Failed checkout.
- Unauthorized access.

Show clear messages to users.

### 14. STATE MANAGEMENT

Use React Context API.

Create:
- AuthContext.js.
- CartContext.js.

AuthContext manages the logged-in user and role.

CartContext manages cart products, quantities, and displayed totals.

Keep state consistent across screens.

The backend must remain authoritative for prices, stock, and order totals.

Do not add Redux unless it becomes genuinely necessary.

### 15. MULTILINGUAL SUPPORT

Support:
- English.
- Kinyarwanda.

Use i18next and react-i18next or another compatible translation library.

Translate essential interface text:
- Login and registration.
- Navigation.
- Search.
- Product categories.
- Shopping cart.
- Checkout.
- Order history.
- Order statuses.
- Profile.
- Validation messages.
- Error and success messages.

Provide a language selector on the profile screen.

Do not invent translations for product information that has not been translated.

### 16. MOBILE PROJECT STRUCTURE

Use a structure similar to:

mobile/
    App.js
    src/
        navigation/
            AppNavigator.js
            AuthNavigator.js
            ClientNavigator.js
            SellerNavigator.js
        screens/
            LoginScreen.js
            RegisterScreen.js
            HomeScreen.js
            ProductsScreen.js
            ProductDetailsScreen.js
            CartScreen.js
            CheckoutScreen.js
            OrdersScreen.js
            OrderDetailsScreen.js
            ProfileScreen.js
            SellerDashboardScreen.js
            ManageProductsScreen.js
            AddEditProductScreen.js
            SellerOrdersScreen.js
            SalesSummaryScreen.js
        components/
            ProductCard.js
            Loading.js
            ErrorMessage.js
            EmptyState.js
        context/
            AuthContext.js
            CartContext.js
        services/
            api.js
            authService.js
            productService.js
            orderService.js
            sellerService.js
        localization/
            i18n.js
            en.json
            rw.json
        utils/
            validation.js
        config/
            environment.js

Adapt the structure when necessary, without creating unnecessary files.

Ensure all imports and exports are correct.

Do not leave incomplete screens or placeholder functions for features that are supposed to work.

### 17. RENDER DEPLOYMENT

Prepare the backend for deployment to Render.

Requirements:
- A valid package.json.
- A production start script.
- Correct use of process.env.PORT.
- A health endpoint.
- Neon PostgreSQL connectivity.
- Appropriate error handling.
- Environment variable configuration.
- Secure production settings.
- CORS configuration appropriate for the backend API.
- Instructions for deploying the backend.

Use the Neon connection string in Render's backend environment settings.

Do not assume local .env files are automatically uploaded to Render.

Document how to configure:
- DATABASE_URL.
- JWT_SECRET.
- NODE_ENV.
- Other necessary environment variables.

Use a persistent production database.

Do not expose secrets in GitHub.

### 18. TESTING

Write tests for important features.

At minimum, test:
- Client registration.
- Validation of invalid registration data.
- Successful login.
- Rejection of incorrect passwords.
- Product listing.
- Product creation permissions.
- Product ownership restrictions.
- Order creation.
- Stock validation.
- Order ownership.
- Seller order status updates.
- Sales summary calculations.
- Database connectivity.

Use appropriate test tools.

Run tests and report actual results.

Do not claim that tests passed unless they were executed successfully.

If a test cannot run because of a missing dependency, database configuration, or unavailable service, explain the reason.

### 19. BUILD AND VALIDATION

Inspect the available scripts before running build commands.

For the backend, run its actual build, lint, and test scripts where available.

If npm run build does not exist, do not invent a successful result. Explain the appropriate validation steps for this JavaScript project.

For React Native CLI, validate the project using the actual available scripts and supported Android build commands.

Run the application and test the implemented functionality.

Verify:
- Backend starts.
- Neon connection works.
- API requests return expected responses.
- Authentication works.
- Role restrictions work.
- Products load.
- Cart operations work.
- Orders are saved.
- Seller order updates work.
- Errors are handled correctly.

Report the actual output of the commands executed.

### 20. DOCUMENTATION AND DELIVERABLES

Create a README.md documenting:
- Project overview.
- Requirements.
- Technologies.
- Installation.
- React Native CLI setup.
- Android execution.
- iOS execution.
- Backend setup.
- Neon configuration.
- Database schema and migrations.
- Render deployment.
- Environment variables.
- API endpoints.
- Testing.
- Troubleshooting.

Create a testing report template containing:
- Test case.
- Expected result.
- Actual result.
- Pass or fail.
- Notes.

Create an academic project report template containing:
1. Introduction.
2. Problem statement.
3. Objectives.
4. Requirements analysis.
5. System design.
6. Database design.
7. Implementation.
8. Testing results.
9. Screenshots.
10. Challenges.
11. Conclusion.
12. Recommendations.

Do not fabricate screenshots, test results, or deployment status.

### 21. DEVELOPMENT PHASES

Work through these phases in order.

PHASE 1: Inspect the environment and initialize the React Native CLI mobile project and Express backend.

PHASE 2: Configure Neon, initialize its CLI integration, deploy the configured Neon services, and establish database connectivity.

PHASE 3: Create and verify the database schema and implement authentication.

PHASE 4: Implement product browsing, search, filtering, and seller product management.

PHASE 5: Implement shopping cart, checkout, order history, and order management.

PHASE 6: Implement multilingual support and sales summaries.

PHASE 7: Test the application, resolve errors, and prepare documentation.

PHASE 8: Deploy the backend to Render and connect the mobile application to the deployed API.

For each phase:
1. Explain the objective.
2. Give exact commands.
3. Specify the correct working directory.
4. Create or update the necessary files.
5. Provide complete, working code.
6. Explain important parts in simple English.
7. Execute appropriate tests.
8. Report the actual results.
9. Wait for my confirmation before moving to the next phase.

Do not generate the entire application in one huge response.

Do not skip required steps.

If authentication or another interactive action is required, ask me to complete it.

If a command fails, diagnose the failure before continuing.

### 22. FINAL ACCEPTANCE CRITERIA

The project is complete when:

- The mobile application uses React Native CLI, not Expo.
- The application supports Android and iOS.
- Clients can register, log in, browse products, manage their carts, and place orders.
- Clients can view their own order histories.
- Sellers can manage their products and customer orders.
- Seller functions are protected.
- Authentication is implemented securely.
- The backend uses Neon PostgreSQL.
- The backend can be deployed to Render.
- The mobile application communicates with the backend API.
- Essential features have been tested.
- Documentation and testing reports are provided.

Do not report the project as complete until these requirements have been implemented and verified.

START NOW.

Begin with PHASE 1 by inspecting the existing workspace. Do not use Expo. Preserve existing work. Do not reveal database credentials. Work incrementally and report actual results.