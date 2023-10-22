require('dotenv').config();
// Imporing the technician Modal
const Technicain = require('');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



async function initiatePayment(amount, technicainDetails) {
    try {
      // Create a card token
      const cardToken = await stripe.tokens.create({
        card: {
          number: '4242424242424242', // Replace with a valid card number
          exp_month: 12, // Replace with a valid expiration month
          exp_year: 2024, // Replace with a valid expiration year
          cvc: '123', // Replace with a valid CVC
        },
      });
  
      // Create a payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: cardToken.id,
        },
      });
  
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card'],
        transfer_data: {
          destination: technicianDetails.id,
          amount: amount,
        },
        payment_method: paymentMethod.id, // Attach the payment method to the PaymentIntent
      });
  
      console.log(paymentIntent);
  
      // Confirm the payment intent
      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);
  
      // Return the confirmed payment intent
      return confirmedPaymentIntent;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw new Error('Failed to initiate payment');
    }
  }
  


const transfer_paymnet =  async (req, res) => {
    const { amount } = req.body;
    const userId = req.params.userId;
    const userType = req.params.userType;
    if(userType === 'Installer')
    {
        try {
            // Retrieve the installer details from the database
            const technicianDetails = await Technician.findById(userId);
            console.log(technicianDetails.stripePaymentDetails)
            // Check if installer details exist
            if (!technicianDetails) {
              return res.status(404).json({ error: 'Technician details not found' });
            }
        
            // Initiate the payment
            const paymentResult = await initiatePayment(amount, technicianDetails.stripePaymentDetails);
             console.log(paymentResult)
            // Return the payment result
            res.status(200).json({ paymentResult });
          } catch (error) {
            console.error('Failed to initiate payment:', error);
            res.status(500).json({ error: 'Failed to initiate payment' });
          }
    }
    // Rest for the other transfers
    
  };



  module.exports = {
    transfer_paymnet
  }
