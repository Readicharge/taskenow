require('dotenv').config();

// Importing the Dependency Modals
const Booking = require('');
const Technician = require('');


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const charge_Hold_amount_from_card = async (req, res) => {
    try {

        // Get the last transaction ID from the appropriate subscription field based on the payment_intent_type
        let lastTransactionId;

       // adding the customer here to reterieve the payment data done by him/her
       // The booking model is going to store the data for the payment Intent + The Customer will be storing the payment intents for the backup plans

      const booking = await Booking.findById(req.params.id);
      if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
            }
            console.log(booking._id)
            // This last transaction Id generated when the User/Super_admin is creating the job ticket
            lastTransactionId = booking.payment_status.payment_id;
        

        if (!lastTransactionId) {
            return res.status(400).json({ message: 'Transaction ID not found' });
        }

        // Use the Stripe API to capture the held amount on the card
        const paymentIntent = await stripe.paymentIntents.capture(lastTransactionId);

        // Check the paymentIntent status to see if the capture was successful
        if (paymentIntent.status === 'succeeded') {
            const booking = await Booking.findById(req.params.id);
            booking.payment_status.amount_captured_from_customer_card = true;
            return res.json({ message: 'Payment successfully captured' });
        } else {
            // Handle any errors or specific scenarios based on the paymentIntent status
            return res.status(500).json({ message: 'Payment capture failed' });
        }
    } catch (error) {
        console.error('Error capturing payment:', error);
        return res.status(500).json({ message: 'Error capturing payment' });
    }
};



module.exports = { charge_Hold_amount_from_card }
