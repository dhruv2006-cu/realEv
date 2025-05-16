const express = require('express');
const stripe = require('stripe')('sk_test_your_secret_key_here');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create payment intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { plan, amount } = req.body;
    
    // Validate plan and amount
    const validPlans = ['student', 'department'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount),
      currency: 'usd',
      metadata: { plan }
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));