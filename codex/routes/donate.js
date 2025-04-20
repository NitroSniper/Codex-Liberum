const express = require('express');
const router = express.Router();
let dots = require("../views/dots")
const { pool } = require('../db/db');

// load the donation page
router.get('/', (req, res) => {
  res.send(dots.donate());
});

// a route to handle donation submission
router.post('/submit', async (req, res) => {
try {
    const { name, email, amount, cardHolder, cardNumber, expiry, cvv } = req.body;

    // validation (all fields are required)
    if (!name || !email || !amount || !cardHolder || !cardNumber || !expiry || !cvv) {
      return res.status(400).send('All fields are required.');
    }
    const cardRegex = /^\d{16}$/;
    if (!cardRegex.test(cardNumber)) {
      return res.status(400).send('Invalid card number. Must be 16 digits.');
    }

    const cvvRegex = /^\d{3}$/;
    if (!cvvRegex.test(cvv)) {
      return res.status(400).send('Invalid CVV. Must be 3 digits.');
    }

    // validate expiry date format (MM/YY) and check if it's expired
    const expiryRegex = /^(0[1-9]|1[0-2])\/(\d{2})$/;
    const expiryMatch = expiry.match(expiryRegex);
    if (!expiryMatch) {
      return res.status(400).send('Invalid expiry date format. Please use MM/YY.');
    }
    // get the input month and year
    const [, mm, yy] = expiryMatch;
    const expiryMonth = parseInt(mm, 10);
    const expiryYear = parseInt(yy, 10) + 2000; // assuming current century

    // get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // check if the card has expired
    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <body>
            <h3>Payment Error</h3>
            <p>The expiry date of your card has passed.</p>
            <p><a href="/donate">Go back to the donation page</a></p>
            <p><a href="/">Go to index page</a></p>
          </body>
        </html>
      `);
    }

    // save data onto database
    const transactionId = `tID-${Math.floor(Math.random() * 1e6)}`;
    console.log('About to INSERT donation:', { transactionId, name, email, amount});
    await pool.query(
      `INSERT INTO donations (transaction_id, name, email, amount)
       VALUES ($1, $2, $3, $4)`,
      [transactionId, name, email, amount]
    );
    // redirect
    res.redirect(`/donate/submit?tx=${encodeURIComponent(transactionId)}`);

  } catch (err) {
    console.error('Error during donation processing:', err);
    res.status(500).send('Payment processing failed.');
  }
});

// show a success page after submit the donation
router.get('/submit', (req, res) => {
  const { tx, name } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Codex-Liberum - sucessful donation</title>
    </head>
    <body>
      <h3>Thank you for supporting us!</h3>
      <p>Your transaction ID is: <strong>${tx}</strong></p>
      <p><a href="/">Go to index page</a></p>
    </body>
    </html>
  `);
});


module.exports = router;
