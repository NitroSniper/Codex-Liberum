const express = require('express');
const router = express.Router();
let dots = require("../views/dots")

// sanitise the user input 
/*
*****still not sure about this process********
*/
function sanitizeInput(input) {
  return input.replace(/[<>&'"]/g, (c) => {
    return {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&#39;',
      '"': '&quot;'
    }[c];
  });
}

// load the donation page
router.get('/', (req, res) => {
  res.send(dots.donate());
});

// a route to handle donation submission
router.post('/submit', (req, res) => {
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
      return res.status(400).send('The expiry date of your card has passed, please try again on a new card');
    }

    // sanitise input to prevent XSS when displaying data back to the user
    const safeName = sanitizeInput(name);

    // process the donation and show a succesful message if succeed
    const transactionId = `tID-${Math.floor(Math.random() * 1000000)}`;
    res.send(`Transaction ID: ${transactionId}. Thank you for supporting us, ${safeName}!`);
  } catch (err) {
    console.error('Error during donation processing:', err);
    res.status(500).send('Payment processing failed.');
  }
});

module.exports = router;