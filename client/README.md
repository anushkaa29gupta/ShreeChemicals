# Shree Chemicals 🕯️

A full-stack e-commerce web application for **Shree Chemicals**, a handcrafted candle business. The platform allows customers to explore candle collections, register/login, manage their shopping cart, place orders, and complete payments through a WhatsApp-based manual payment verification workflow.

---

## ✨ Features

### 👤 User Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing using bcrypt
- Forgot password functionality

### 🕯️ Product Catalog
- Browse candle collections
- View candle products and details
- Product images and product information
- Category-based product browsing

### 🛒 Shopping Cart
- Add products to cart
- Manage cart items
- Update product quantities
- Proceed to checkout

### 📦 Order Management
- Place orders through the website
- Store order details in the backend
- Track order/payment status
- Admin-side order management

### 💳 Manual Payment Workflow
Payments are coordinated directly between the customer and business owner through WhatsApp.

1. Customer places an order on the website.
2. Customer contacts the owner through WhatsApp for payment details.
3. Customer transfers the requested amount.
4. Customer shares the payment screenshot with the owner.
5. Owner manually verifies the payment.
6. Owner approves the payment received.
7. The customer receives an order confirmation email.

> Payment is manually verified by the owner. The application does not use an automated payment gateway for this workflow.

### 📧 Email Notifications
- Order confirmation emails
- Email notification after payment approval
- Email functionality using Nodemailer

### 🔐 Admin Functionality
- Admin login
- Admin dashboard
- Product management
- Order management
- Payment approval workflow

---

## 🛠️ Tech Stack

### Frontend
- React
- JavaScript
- Vite
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication & Security
- JWT (JSON Web Token)
- bcryptjs
- dotenv
- CORS

### Additional Libraries
- Multer – File uploads
- Nodemailer – Email notifications
- Nodemon – Backend development

---

## 📁 Project Structure

```text
ShreeChemicals/
│
├── client/
│   ├── public/
│   │   ├── videos/
│   │   └── assets/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- MongoDB (local installation or MongoDB Atlas)
- Visual Studio Code

---

## 🚀 Running the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/anushkaa29gupta/ShreeChemicals.git
```

Navigate into the project:

```bash
cd ShreeChemicals
```

### 2. Setup Frontend

Open a terminal:

```bash
cd client
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

### 3. Setup Backend

Open a second terminal from the project root:

```bash
cd server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` folder.

Add the environment variables required by the backend configuration, such as:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

> These are example placeholders. Use the actual variable names referenced in the backend source code. Never commit credentials, secrets, or your `.env` file to GitHub.

### 5. Start the Backend

Development mode:

```bash
npm run dev
```

Or production-style start:

```bash
npm start
```

---

## 🔄 Application Workflow

```text
Customer
   │
   ▼
Register / Login
   │
   ▼
Browse Candle Products
   │
   ▼
Add Products to Cart
   │
   ▼
Place Order
   │
   ▼
Contact Owner via WhatsApp
   │
   ▼
Complete Payment & Share Screenshot
   │
   ▼
Owner Verifies Payment
   │
   ▼
Owner Approves Payment
   │
   ▼
Order Confirmation Email
```

---

## 🔒 Security

- Password hashing
- JWT-based authentication
- Environment variables for sensitive configuration
- Credentials excluded from version control
- Backend validation and authorization

---

## 📌 Notes

- Payment verification is handled manually by the business owner.
- Customers coordinate payment through WhatsApp.
- Order confirmation email is sent after the owner approves payment.
- MongoDB is used to store application data.
- Email services require valid email configuration.

---

## 👩‍💻 Developer

Developed for **Shree Chemicals** — handcrafted candles and products.
