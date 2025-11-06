# MERN Bakery E-commerce + Course Platform

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application for a bakery e-commerce platform with integrated baking courses. Features manual UPI payment verification and role-based access control.

## 🚀 Features

### Customer Features
- **User Authentication**: Register/Login with OTP verification via email
- **Product Browsing**: View bakery products by categories (cakes, cupcakes, pastries, etc.)
- **Shopping Cart**: Add/remove products, manage quantities
- **Manual UPI Payment**: Display bakery's UPI QR code, upload payment proof
- **Order Management**: Track order status (Pending, Verified, Rejected)
- **Course Access**: Purchase and access recorded/live baking courses
- **Profile Management**: Update personal information and view order history

### Admin Features
- **Product Management**: Add/Edit/Delete bakery products with images
- **Course Management**: Upload and manage baking courses (recorded/live)
- **Order Verification**: Manually verify UPI payments and update order status
- **User Management**: View all users and their details
- **Analytics Dashboard**: Basic statistics (orders, users, revenue)

## 🛠 Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB Atlas** for database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer + Cloudinary** for file uploads
- **Nodemailer** for email services
- **Express Validator** for input validation

### Frontend
- **React.js** with **Vite**
- **React Router** for navigation
- **Bootstrap 5** for responsive design
- **Axios** for API calls
- **Sonner** for toast notifications
- **React Icons** for UI elements

## 📁 Project Structure

```
mern-bakery-platform/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── courseController.js
│   │   ├── orderController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Course.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── courses.js
│   │   ├── orders.js
│   │   └── admin.js
│   ├── utils/
│   │   ├── otp.js
│   │   └── email.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyOTP.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Cloudinary account (for image uploads)
- Email service (Gmail/SMTP for OTP emails)

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in backend root:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   FRONTEND_URL=http://localhost:5173
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Backend Deployment (Render)
1. Push backend code to GitHub
2. Connect Render account to GitHub repository
3. Set environment variables in Render dashboard
4. Deploy the backend

### Frontend Deployment (Vercel)
1. Push frontend code to GitHub
2. Connect Vercel account to GitHub repository
3. Set environment variables in Vercel dashboard
4. Deploy the frontend

## 📱 Usage

### For Customers
1. **Register**: Create account with email and password
2. **Verify Email**: Check email for OTP and verify account
3. **Login**: Access your account
4. **Browse Products**: View bakery items by category
5. **Add to Cart**: Select products and quantities
6. **Checkout**: View UPI QR code and upload payment proof
7. **Track Orders**: Monitor order status in profile
8. **Access Courses**: Purchase and view baking courses

### For Admins
1. **Login**: Use admin credentials
2. **Manage Products**: Add/edit/delete bakery products
3. **Manage Courses**: Upload course content and materials
4. **Verify Payments**: Check uploaded payment proofs
5. **Update Orders**: Change order status after verification
6. **View Analytics**: Monitor platform statistics

## 🔐 Default Admin Credentials
- **Email**: admin@bakery.com
- **Password**: admin123

## 📧 Email Configuration
The application uses Nodemailer for sending OTP emails. Configure your email service in the `.env` file.

## 💳 Payment System
- **Manual UPI Payment**: Static UPI QR code display, customer uploads payment screenshot or UPI reference ID, admin manually verifies payments
- **Razorpay Integration**: Online payment gateway for seamless checkout experience
  - Create Razorpay account at https://razorpay.com
  - Get API keys from Razorpay Dashboard
  - Configure environment variables
  - Supports both manual and online payment methods

## 🎨 UI/UX Features
- Responsive Bootstrap 5 design
- Bakery-themed color scheme
- Smooth animations and transitions
- Mobile-friendly interface
- Toast notifications for user feedback

## 🔒 Security Features
- JWT authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Role-based access control
- Protected routes and API endpoints

## 📈 Future Enhancements
- [x] Real payment gateway integration (Razorpay)
- [ ] Live course streaming
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Advanced search and filtering
- [ ] Wishlist functionality
- [ ] Review and rating system

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License
This project is licensed under the MIT License.

## 📞 Support
For support or questions, please contact the development team.

---

**Note**: This is a complete MERN stack application ready for production deployment. Make sure to configure all environment variables properly before deployment.
