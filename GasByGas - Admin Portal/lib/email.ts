import nodemailer from 'nodemailer';

// Check if SMTP configuration exists
function validateSMTPConfig() {
  const requiredEnvVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing SMTP configuration: ${missingVars.join(', ')}`);
  }
}

// Create SMTP transporter
let transporter: nodemailer.Transporter;

try {
  validateSMTPConfig();
  
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify SMTP connection on startup
  transporter.verify()
    .then(() => {
      console.log('SMTP connection verified successfully');
    })
    .catch((error) => {
      console.error('SMTP connection verification failed:', error);
    });
} catch (error) {
  console.error('Failed to initialize email transporter:', error);
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  if (!transporter) {
    throw new Error('Email transporter not initialized. Check SMTP configuration.');
  }

  try {
    console.log('Attempting to send email to:', to);
    console.log('Email subject:', subject);
    
    const info = await transporter.sendMail({
      from: `"GasByGas Admin" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
      html,
    });
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to,
      subject
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', {
      error,
      to,
      subject
    });
    throw error;
  }
}

export function generatePasswordResetEmail(resetLink: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You have requested to reset your password. Click the link below to proceed:</p>
      <p style="margin: 20px 0;">
        <a href="${resetLink}" 
           style="background-color: #E58D67; 
                  color: white; 
                  padding: 10px 20px; 
                  text-decoration: none; 
                  border-radius: 5px; 
                  display: inline-block;">
          Reset Password
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">
        This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
      </p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">
        GasByGas Admin System
      </p>
    </div>
  `;
}

export function generateRequestStatusEmail(
  requestType: 'outlet' | 'business',
  status: 'approved' | 'rejected' | 'pending',
  name: string
) {
  const requestTypeDisplay = requestType.charAt(0).toUpperCase() + requestType.slice(1);
  const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${requestTypeDisplay} Request ${statusDisplay}</h2>
      <p>Dear ${name},</p>
      <p>Your ${requestType} request has been <strong>${status}</strong>.</p>
      ${status === 'approved' 
        ? `<p>Congratulations! You can now proceed with using our services.</p>` 
        : status === 'rejected'
        ? `<p>If you have any questions about this decision, please contact our support team.</p>`
        : `<p>We will review your request and get back to you soon.</p>`
      }
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">
        GasByGas Admin System
      </p>
    </div>
  `;
}

export function generateDeliveryScheduleEmail(
  orderNumber: string,
  outletName: string,
  managerName: string,
  deliveryDate: string,
  items: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Delivery Scheduled - Order #${orderNumber}</h2>
      
      <p>Dear ${managerName},</p>
      
      <p>Your order for <strong>${outletName}</strong> has been scheduled for delivery.</p>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #E58D67; margin-top: 0;">Order Details</h3>
        <div style="margin-left: 20px;">
          ${items.split(',').map(item => `<p style="margin: 5px 0;">• ${item.trim()}</p>`).join('')}
        </div>
      </div>
      
      <div style="background-color: #f0f7ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #2563eb; margin-top: 0;">Delivery Information</h3>
        <p style="margin: 5px 0;"><strong>Expected Delivery Date:</strong> ${deliveryDate}</p>
      </div>
      
      <p>Our delivery team will contact you before arrival. Please ensure someone is available to receive the delivery.</p>
      
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      
      <p style="color: #666;">
        If you have any questions about your delivery, please contact our support team.
      </p>
      
      <p style="color: #999; font-size: 12px; margin-top: 20px;">
        Thank you for choosing GasByGas!<br>
        GasByGas Admin System
      </p>
    </div>
  `;
}

export function generateOrderStatusEmail(
  orderId: string | number,
  status: 'scheduled' | 'cancelled',
  managerName: string,
  details?: {
    deliveryDate?: string;
    deliveryAddress?: string;
    orderDate?: string;
    items?: Array<{
      type: string;
      weight: number;
      quantity: number;
    }>;
  }
) {
  const statusMessages = {
    scheduled: 'has been scheduled for delivery',
    cancelled: 'has been cancelled',
  };

  const orderDetailsSection = details?.items ? `
    <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
      <h3 style="color: #333; margin-bottom: 10px;">Order Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid #dee2e6;">
            <th style="text-align: left; padding: 8px;">Cylinder Type</th>
            <th style="text-align: center; padding: 8px;">Weight (kg)</th>
            <th style="text-align: center; padding: 8px;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${details.items.map(item => `
            <tr style="border-bottom: 1px solid #dee2e6;">
              <td style="text-align: left; padding: 8px;">${item.type}</td>
              <td style="text-align: center; padding: 8px;">${item.weight}</td>
              <td style="text-align: center; padding: 8px;">${item.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : '';

  const deliverySection = details?.deliveryDate ? `
    <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
      <h3 style="color: #333; margin-bottom: 10px;">Delivery Information:</h3>
      <p><strong>Delivery Date:</strong> ${details.deliveryDate}</p>
      ${details.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${details.deliveryAddress}</p>` : ''}
    </div>
  ` : '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Status Update</h2>
      <p>Dear ${managerName},</p>
      <p>Your order #${orderId} ${statusMessages[status]}.</p>
      ${details?.orderDate ? `<p><strong>Order Date:</strong> ${details.orderDate}</p>` : ''}
      ${orderDetailsSection}
      ${deliverySection}
      ${status === 'cancelled' ? `
        <p>If you have any questions about your cancelled order, please contact our support team.</p>
      ` : `
        <p>We will notify you once your order is out for delivery.</p>
      `}
      <p>Thank you for choosing GasByGas!</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;
}
