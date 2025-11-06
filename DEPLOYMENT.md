# BakeryHub Deployment Guide

This guide will help you deploy the BakeryHub application with the backend on Render and the frontend on Vercel.

## Prerequisites

- A GitHub repository with the code
- Render account for backend deployment
- Vercel account for frontend deployment
- MongoDB Atlas account for database
- SendGrid account for email services
- Cloudinary account for file storage
- Razorpay account for payment processing

## Backend Deployment (Render)

1. **Connect GitHub Repository**
   - Go to Render dashboard
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder as the root directory

2. **Configure Environment Variables**
   - Set the following environment variables in Render:
     ```
     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
     JWT_SECRET=your_jwt_secret
     SENDGRID_API_KEY=your_sendgrid_api_key
     SENDGRID_FROM_EMAIL=your_email@example.com
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     RAZORPAY_KEY_ID=your_razorpay_key_id
     RAZORPAY_KEY_SECRET=your_razorpay_key_secret
     ```

3. **Configure Build and Start Commands**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

4. **Deploy**
   - Click "Create Web Service" to deploy
   - Wait for the deployment to complete
   - Note the deployed URL for later use

## Frontend Deployment (Vercel)

1. **Connect GitHub Repository**
   - Go to Vercel dashboard
   - Click "Add New..." and select "Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

2. **Configure Environment Variables**
   - Add the following environment variable:
     ```
     VITE_API_URL=https://your-backend-render-url.com/api
     ```
   (Replace with your actual deployed backend URL)

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Deploy**
   - Click "Deploy" to deploy the frontend
   - Wait for the deployment to complete

## Post-Deployment Steps

1. **Update Frontend API URL**
   - Make sure the frontend is using the correct backend URL
   - If needed, update the environment variables in Vercel

2. **Test the Application**
   - Verify all features are working correctly
   - Test user authentication, product browsing, ordering, etc.

3. **Set Up Cron Jobs**
   - The backend includes a cron job for delivery reminders
   - Verify it's working correctly in the Render dashboard

## Troubleshooting

- **Backend Issues**: Check Render logs for any errors
- **Frontend Issues**: Check Vercel function logs for any errors
- **Database Connection**: Verify MongoDB URI is correct
- **API Calls**: Ensure CORS is properly configured
- **Environment Variables**: Double-check all environment variables are set correctly

## Maintenance

- Regularly update dependencies
- Monitor logs for any issues
- Keep backups of your database
- Update environment variables as needed
