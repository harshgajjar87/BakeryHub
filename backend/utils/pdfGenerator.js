const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Create a buffer to store the PDF
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text('BAKERY PLATFORM', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text('INVOICE', { align: 'center' });
      doc.moveDown();

      // Invoice details
      doc.fontSize(12);
      doc.text(`Invoice Number: INV-${order._id.toString().slice(-8).toUpperCase()}`);
      doc.text(`Order ID: ${order._id}`);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`);
      if (order.razorpayPaymentId) {
        doc.text(`Payment ID: ${order.razorpayPaymentId}`);
      }
      doc.moveDown();

      // Customer details
      doc.fontSize(14).text('Bill To:', { underline: true });
      doc.fontSize(12);
      doc.text(`Name: ${order.user.name}`);
      doc.text(`Email: ${order.user.email}`);
      if (order.shippingAddress) {
        doc.text(`Address: ${order.shippingAddress.address}`);
        doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}`);
        if (order.shippingAddress.phone) {
          doc.text(`Phone: ${order.shippingAddress.phone}`);
        }
      }
      doc.moveDown();

      // Order items table
      const tableTop = doc.y + 20;
      const itemX = 50;
      const quantityX = 300;
      const priceX = 400;
      const totalX = 480;

      // Table header
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Item', itemX, tableTop);
      doc.text('Qty', quantityX, tableTop);
      doc.text('Price', priceX, tableTop);
      doc.text('Total', totalX, tableTop);

      // Table line
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table rows
      doc.font('Helvetica');
      let yPosition = tableTop + 25;
      let subtotal = 0;

      order.items.forEach(item => {
        const itemName = item.type === 'product'
          ? (item.product?.name || 'Product')
          : (item.course?.title || 'Course');
        const itemPrice = item.price;
        const itemQuantity = item.quantity;
        const itemTotal = itemPrice * itemQuantity;

        subtotal += itemTotal;

        doc.text(itemName, itemX, yPosition);
        doc.text(itemQuantity.toString(), quantityX, yPosition);
        doc.text(`₹${itemPrice}`, priceX, yPosition);
        doc.text(`₹${itemTotal}`, totalX, yPosition);

        yPosition += 20;
      });

      // Totals
      yPosition += 10;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 15;

      doc.font('Helvetica-Bold');
      doc.text('Subtotal:', 400, yPosition);
      doc.text(`₹${subtotal}`, totalX, yPosition);
      yPosition += 20;

      if (order.customizationPrice) {
        doc.text('Customization:', 400, yPosition);
        doc.text(`₹${order.customizationPrice}`, totalX, yPosition);
        yPosition += 20;
      }

      if (order.shippingFee) {
        doc.text('Shipping:', 400, yPosition);
        doc.text(`₹${order.shippingFee}`, totalX, yPosition);
        yPosition += 20;
      }

      // Total
      doc.moveTo(400, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;
      doc.fontSize(14);
      doc.text('TOTAL:', 400, yPosition);
      doc.text(`₹${order.totalAmount}`, totalX, yPosition);

      // Footer
      doc.fontSize(10).font('Helvetica');
      const footerY = doc.page.height - 100;
      doc.text('Thank you for your business!', 50, footerY, { align: 'center' });
      doc.text('Bakery Platform - Fresh baked goods with love', 50, footerY + 15, { align: 'center' });

      // Status
      doc.fontSize(12).font('Helvetica-Bold');
      const statusText = `Status: ${order.status.replace(/_/g, ' ').toUpperCase()}`;
      doc.text(statusText, 50, footerY + 35, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePDF
};
