const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const crypto = require('crypto');

dotenv.config();

const app = express();
const PORT = process.env.PAYMENTS_PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn(
    '[payments-server] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set. Payment routes will return 500 for payment calls until configured.'
  );
}

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Payments API running' });
});

// POST /api/payments/create-order
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { amount, currency: reqCurrency, meta = {} } = req.body || {};

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const currency = !reqCurrency || reqCurrency === '₹' ? 'INR' : reqCurrency;

    const options = {
      amount: Math.round(amount),
      currency,
      receipt: `car_rental_${Date.now()}`,
      notes: meta,
    };

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured on server',
      });
    }

    const razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpayClient.orders.create(options);

    return res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Error creating Razorpay order', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
    });
  }
});

// POST /api/payments/verify
app.post('/api/payments/verify', (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      meta,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters',
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured on server',
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      meta,
    });
  } catch (err) {
    console.error('Error verifying Razorpay payment', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
    });
  }
});

app.listen(PORT, () => {
  console.log(`[payments-server] Listening on http://localhost:${PORT}`);
});

