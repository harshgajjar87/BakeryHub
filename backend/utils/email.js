const sgMail = require('@sendgrid/mail');

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Your OTP for Bakery Platform Registration',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Our Bakery Platform!</h2>
        <p>Your OTP for email verification is:</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, order) => {
  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Order Confirmation - Bakery Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmation</h2>
        <p>Thank you for your order! Your order has been confirmed.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Status:</strong> ${order.status.replace('_', ' ').toUpperCase()}</p>
        <h3>Order Items:</h3>
        <ul>
          ${order.items.map(item => `
            <li>${item.type === 'product' ? 'Product' : 'Course'}: ${item.quantity} x ₹${item.price}</li>
          `).join('')}
        </ul>
        <p>We will process your order shortly.</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send password reset OTP
const sendPasswordResetOTP = async (email, otp) => {
  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Password Reset OTP - Bakery Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Your OTP for password reset is:</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (email, order) => {
  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Payment Confirmed - Bakery Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Confirmed!</h2>
        <p>Great news! Your payment has been verified and your order is now being processed.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Status:</strong> Payment Verified - In Progress</p>
        <h3>Order Items:</h3>
        <ul>
          ${order.items.map(item => `
            <li>${item.type === 'product' ? 'Product' : 'Course'}: ${item.quantity} x ₹${item.price}</li>
          `).join('')}
        </ul>
        <p>You will receive updates as your order progresses. Thank you for choosing our bakery!</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send delivery reminder email
const sendDeliveryReminderEmail = async (email, order) => {
  const deliveryTime = new Date(order.deliveryDate).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  let deliveryInstructions = '';
  if (order.deliveryMethod === 'pickup') {
    deliveryInstructions = `
      <p><strong>Pickup Instructions:</strong></p>
      <ul>
        <li>Please arrive at our store 5-10 minutes before your scheduled pickup time.</li>
        <li>Bring a valid ID and your order confirmation (this email).</li>
        <li>Our team will have your order ready for pickup.</li>
      </ul>
    `;
  } else {
    deliveryInstructions = `
      <p><strong>Delivery Instructions:</strong></p>
      <ul>
        <li>Our delivery team will arrive within 30 minutes of the scheduled time.</li>
        <li>Please ensure someone is available to receive the order.</li>
        <li>Have your payment ready if not already paid.</li>
      </ul>
    `;
  }

  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Your Order is Ready - Delivery Reminder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🎂 Your Order is Ready!</h2>
        <p>Hi there!</p>
        <p>Great news! Your order is now ready and will be ${order.deliveryMethod === 'pickup' ? 'available for pickup' : 'delivered'} soon.</p>

        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0;">Order Details:</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>${order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'} Date & Time:</strong> ${deliveryTime}</p>
          <p><strong>Status:</strong> Ready for ${order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}</p>
        </div>

        ${deliveryInstructions}

        <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0;"><strong>Important:</strong> If you need to reschedule or have any questions, please contact us immediately at ${process.env.SUPPORT_PHONE || 'your support number'} or reply to this email.</p>
        </div>

        <h3>Order Summary:</h3>
        <ul>
          ${order.items.map(item => `
            <li>${item.type === 'product' ? 'Product' : 'Course'}: ${item.quantity} x ₹${item.price}</li>
          `).join('')}
        </ul>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>

        <p>We can't wait for you to enjoy your delicious treats! Thank you for choosing our bakery.</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send order placement confirmation email
const sendOrderPlacementEmail = async (email, order) => {
  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Order Placed Successfully - Bakery Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for your order! We have received your order and it is currently pending admin approval.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Status:</strong> Pending Approval</p>
        <h3>Order Items:</h3>
        <ul>
          ${order.items.map(item => `
            <li>${item.type === 'product' ? 'Product' : 'Course'}: ${item.quantity} x ₹${item.price}</li>
          `).join('')}
        </ul>
        ${order.customizationRequired ? `
          <h3>Customization Requested:</h3>
          <p>${order.customizationDetails}</p>
        ` : ''}
        <p>You will receive an email once your order is approved. Our team will review your order shortly.</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send order approval email
const sendOrderApprovalEmail = async (email, order) => {
  const nextStepMessage = order.customizationRequired
    ? 'Please check your chat for customization discussion with our baker.'
    : 'Please complete your payment to proceed with the order.';

  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Order Approved - Bakery Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Great News! Your Order Has Been Approved</h2>
        <p>Congratulations! Your order has been approved and is now ready for the next steps.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Status:</strong> ${order.customizationRequired ? 'Customization Pending' : 'Payment Pending'}</p>
        <h3>Order Items:</h3>
        <ul>
          ${order.items.map(item => `
            <li>${item.type === 'product' ? 'Product' : 'Course'}: ${item.quantity} x ₹${item.price}</li>
          `).join('')}
        </ul>
        ${order.customizationRequired ? `
          <h3>Customization Details:</h3>
          <p>${order.customizationDetails}</p>
          <div style="background-color: #d1ecf1; padding: 15px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <p style="margin: 0;"><strong>Next Step:</strong> ${nextStepMessage}</p>
          </div>
        ` : `
          <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>Next Step:</strong> ${nextStepMessage} You can upload your payment proof in your order details page.</p>
          </div>
        `}
        <p>Thank you for choosing our bakery! We're excited to prepare your delicious treats.</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send payment request email for customized orders
const sendPaymentRequestEmail = async (email, order) => {
  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Payment Request for Your Customized Order - Bakery Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Request for Your Customized Order</h2>
        <p>Hi there!</p>
        <p>Great news! The customization discussion for your order has been completed. Your order is now ready for payment.</p>

        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0;">Order Details:</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Original Price:</strong> ₹${order.originalPrice}</p>
          <p><strong>Customization Price:</strong> ₹${order.customizationPrice}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
          <p><strong>Status:</strong> Payment Pending</p>
        </div>

        <h3>Order Items:</h3>
        <ul>
          ${order.items.map(item => `
            <li>${item.type === 'product' ? 'Product' : 'Course'}: ${item.quantity} x ₹${item.price}</li>
          `).join('')}
        </ul>

        ${order.customizationRequired ? `
          <h3>Customization Details:</h3>
          <p>${order.customizationDetails}</p>
        ` : ''}

        <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0;"><strong>Important:</strong> Please complete your payment to proceed with the order preparation. You can upload your payment proof in your order details page.</p>
        </div>

        <p>Thank you for choosing our bakery! We can't wait to deliver your customized treats.</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send order rejection email
const sendOrderRejectionEmail = async (email, order) => {
  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Order Rejected - Bakery Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Update</h2>
        <p>We're sorry to inform you that your order has been rejected.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Status:</strong> Rejected</p>
        ${order.adminNotes ? `
          <h3>Admin Notes:</h3>
          <p>${order.adminNotes}</p>
        ` : ''}
        <h3>Order Items:</h3>
        <ul>
          ${order.items.map(item => `
            <li>${item.type === 'product' ? 'Product' : 'Course'}: ${item.quantity} x ₹${item.price}</li>
          `).join('')}
        </ul>
        <p>If you have any questions or need further assistance, please contact our support team.</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send course purchase email
const sendCoursePurchaseEmail = async (email, order) => {
  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Course Purchase Request Submitted - Bakery Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Course Purchase Request Submitted!</h2>
        <p>Thank you for your interest in our course! We have received your purchase request and it is currently pending admin approval.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Course:</strong> ${order.items[0].course.title}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Status:</strong> Pending Approval</p>
        <p>You will receive an email once your course purchase is approved and you gain access to the course content.</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send course purchase receipt email
const sendCoursePurchaseReceiptEmail = async (email, order, customerDetails) => {
  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Course Purchase Receipt - Bakery Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Course Purchase Receipt</h2>
        <p>Thank you for your course purchase! Here are the details of your transaction:</p>

        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Course:</strong> ${order.items[0].course.title}</p>
          <p><strong>Price:</strong> ₹${order.totalAmount}</p>
          <p><strong>Status:</strong> Pending Admin Approval</p>
          <p><strong>Purchase Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
        </div>

        <div style="background-color: #e9ecef; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Customer Information:</h3>
          <p><strong>Name:</strong> ${customerDetails.customerName}</p>
          <p><strong>Email:</strong> ${customerDetails.customerEmail}</p>
          <p><strong>Phone:</strong> ${customerDetails.customerPhone}</p>
          <p><strong>Validation Date:</strong> ${new Date(customerDetails.validationDate).toLocaleDateString('en-IN')}</p>
        </div>

        <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0;"><strong>Important:</strong> Your course access will be granted once the admin approves your purchase. You will receive a confirmation email with access details.</p>
        </div>

        <p>If you have any questions about your purchase, please contact our support team.</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send course approval email
const sendCourseApprovalEmail = async (email, order) => {
  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Course Access Granted - Bakery Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations! Course Access Granted</h2>
        <p>Great news! Your course purchase has been approved and you now have access to the course content.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Course:</strong> ${order.items[0].course.title}</p>
        <p><strong>Access Period:</strong> 1 Year from today</p>
        <p><strong>Status:</strong> Completed</p>
        <div style="background-color: #d4edda; padding: 15px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="margin: 0;"><strong>Next Step:</strong> You can now access your course content from your dashboard. Start learning today!</p>
        </div>
        <p>Thank you for choosing our platform! We hope you enjoy the course.</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send customer receipt email after successful payment
const sendCustomerReceiptEmail = async (email, order) => {
  const paymentDate = new Date(order.updatedAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Payment Receipt - Bakery Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Receipt</h2>
        <p>Thank you for your payment! Here are the details of your transaction:</p>

        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Payment Date:</strong> ${paymentDate}</p>
          <p><strong>Payment Method:</strong> Razorpay</p>
          <p><strong>Transaction ID:</strong> ${order.razorpayPaymentId}</p>
          <p><strong>Status:</strong> Payment Successful</p>
        </div>

        <h3>Order Items:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Price</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.type === 'product' ? 'Product' : 'Course'}: ${item.type === 'product' ? item.product?.name || 'Product' : item.course?.title || 'Course'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${item.price}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${item.price * item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="background-color: #e9ecef; padding: 15px; margin: 20px 0; text-align: right;">
          <p style="margin: 5px 0;"><strong>Subtotal:</strong> ₹${order.totalAmount - (order.shippingFee || 0) - (order.customizationPrice || 0)}</p>
          ${order.customizationPrice ? `<p style="margin: 5px 0;"><strong>Customization:</strong> ₹${order.customizationPrice}</p>` : ''}
          ${order.shippingFee ? `<p style="margin: 5px 0;"><strong>Shipping:</strong> ₹${order.shippingFee}</p>` : ''}
          <p style="margin: 5px 0; font-size: 18px;"><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        </div>

        ${order.deliveryMethod === 'delivery' ? `
          <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4>Delivery Information:</h4>
            <p><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Address:</strong> ${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.zipCode}</p>
            <p><strong>Phone:</strong> ${order.shippingAddress?.phone}</p>
          </div>
        ` : `
          <div style="background-color: #d1ecf1; padding: 15px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <h4>Pickup Information:</h4>
            <p><strong>Pickup Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString('en-IN')}</p>
            <p>Please collect your order from our store location.</p>
          </div>
        `}

        <p>This is an auto-generated receipt. Please keep this email for your records.</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send order delivered email notification
const sendOrderDeliveredEmail = async (email, order) => {
  const deliveryDate = new Date(order.updatedAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'Your Order Has Been Delivered! - Bakery Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🎉 Your Order Has Been Delivered Successfully!</h2>
        <p>Great news! Your order has been delivered and is now in your hands. We hope you enjoy your delicious treats!</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Delivery Date:</strong> ${deliveryDate}</p>
          <p><strong>Status:</strong> Delivered Successfully</p>
        </div>
        
        <h3>Order Items:</h3>
        <ul>
          ${order.items.map(item => `
            <li>${item.type === 'product' ? 'Product' : 'Course'}: ${item.type === 'product' ? item.product?.name || 'Product' : item.course?.title || 'Course'} - ${item.quantity} x ₹${item.price}</li>
          `).join('')}
        </ul>
        
        <div style="background-color: #d4edda; padding: 15px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="margin: 0;"><strong>Thank you for your order!</strong> We hope you enjoy your items. If you have any questions or feedback, please don't hesitate to contact us.</p>
        </div>
        
        <p>If you haven't received your order or there's any issue, please contact our support team immediately.</p>
        <br>
        <p>Best regards,<br>Bakery Platform Team</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

// Send admin receipt email after successful payment
const sendAdminReceiptEmail = async (adminEmail, order, customerInfo) => {
  const paymentDate = new Date(order.updatedAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const msg = {
    to: adminEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: 'Bakery Platform'
    },
    subject: 'New Payment Received - Order Receipt',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Payment Received</h2>
        <p>A new payment has been successfully processed. Here are the order details:</p>

        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Order & Payment Details:</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Payment Date:</strong> ${paymentDate}</p>
          <p><strong>Payment Method:</strong> Razorpay</p>
          <p><strong>Transaction ID:</strong> ${order.razorpayPaymentId}</p>
          <p><strong>Amount Received:</strong> ₹${order.totalAmount}</p>
          <p><strong>Status:</strong> Payment Successful</p>
        </div>

        <div style="background-color: #e9ecef; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Customer Information:</h3>
          <p><strong>Name:</strong> ${customerInfo.name}</p>
          <p><strong>Email:</strong> ${customerInfo.email}</p>
          <p><strong>Phone:</strong> ${customerInfo.phone || 'Not provided'}</p>
        </div>

        <h3>Order Items:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Price</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.type === 'product' ? 'Product' : 'Course'}: ${item.type === 'product' ? item.product?.name || 'Product' : item.course?.title || 'Course'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${item.price}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${item.price * item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="background-color: #d4edda; padding: 15px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="margin: 0;"><strong>Total Revenue:</strong> ₹${order.totalAmount}</p>
          <p style="margin: 5px 0 0 0;"><strong>Breakdown:</strong> ₹${order.totalAmount - (order.shippingFee || 0) - (order.customizationPrice || 0)} (products) ${order.customizationPrice ? `+ ₹${order.customizationPrice} (customization)` : ''} ${order.shippingFee ? `+ ₹${order.shippingFee} (shipping)` : ''}</p>
        </div>

        ${order.customizationRequired ? `
          <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4>Customization Details:</h4>
            <p>${order.customizationDetails}</p>
          </div>
        ` : ''}

        ${order.deliveryMethod === 'delivery' ? `
          <div style="background-color: #d1ecf1; padding: 15px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <h4>Delivery Details:</h4>
            <p><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Address:</strong> ${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.zipCode}</p>
            <p><strong>Phone:</strong> ${order.shippingAddress?.phone}</p>
          </div>
        ` : `
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #6c757d;">
            <h4>Pickup Details:</h4>
            <p><strong>Pickup Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString('en-IN')}</p>
            <p>Customer will collect from store.</p>
          </div>
        `}

        <p>This order is now ready for processing. Please ensure timely delivery/preparation.</p>
        <br>
        <p>Best regards,<br>Bakery Platform System</p>
      </div>
    `
  };

  return await sgMail.send(msg);
};

module.exports = {
  sendOTPEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetOTP,
  sendPaymentConfirmationEmail,
  sendDeliveryReminderEmail,
  sendOrderPlacementEmail,
  sendOrderApprovalEmail,
  sendOrderRejectionEmail,
  sendPaymentRequestEmail,
  sendCoursePurchaseEmail,
  sendCoursePurchaseReceiptEmail,
  sendCourseApprovalEmail,
  sendCustomerReceiptEmail,
  sendAdminReceiptEmail,
  sendOrderDeliveredEmail
};
