require('dotenv').config();


// Imporing the Dependency Modals
const Technician = require('');
const Booking = require("");
const Payment = require("")

// Integrating stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Import the code for finding the unique sequence Id , from the unique Id generator for the payments
const { findMostRecentPayment } = require("") // enter the path here


// Create payment function
const createPayment = async (data) => {
    const {installer_id , isIncoming, payment_type, payment_id, date, amount, Job_Id, Job_Unique_id, user_id,client_secret } = data;
    const current_sequence_number = await findMostRecentPayment() + 1;
    let paymentFields = {
        client_secret,
        technician_id,
        user_id,
        payment_type,
        payment_id,
        date,
        amount,
        sequence_number: current_sequence_number,
        Job_Id,
        Job_Unique_id,
        seen:false, // Not Required Here , optional
        isIncoming
    };


    // Generate the sequence number here

    try {
        const payment = new Payment(paymentFields);
        console.log(payment);
        await payment.save();

        return "Success"
    } catch (err) {
        return "Failure"
    }
};


const hold_payment_on_card = async (req, res) => {
    try {
        // Get the card details and hold amount from the request body
        const { cardNumber, holderName, expirationDate, cvv, amount,booking_id , userId} = req.body;
        const payment_intent_type = req.params.payment_initiated_type;
        const technician_id = req.params.technicianId

        // Create a Payment Intent to hold the amount on the card
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Stripe requires the amount in cents
            currency: 'usd', // Change to your desired currency

          // This Section needs to be updated with the Actual Card once we are in the Production Env
            payment_method_data: {
                type: 'card',
                card: {
                    token: 'tok_visa', // Use the test token for the card
                  },
            },
            confirm: true,
            capture_method: 'manual', // Hold the funds but don't capture immediately
        });

        // Get the Payment Intent ID and save it in your database for future reference
        const paymentIntentId = paymentIntent.id;
        const booking = await Booking.findById(booking_id);
        const date_today =  new Date();
        await createPayment({payment_type:"booking",payment_id:paymentIntentId,amount,Job_Id:booking_id,date:date_today,user_id:userId,client_secret:paymentIntent.client_secret})
        booking.customer_payment_status = "Paid";
        await booking.save();

        // Return the Payment Intent ID to the client
        res.json({ message:"Paymnent succeddfully captured" });
    } catch (error) {
        console.error('Error creating hold:', error);
        res.status(500).json({ message: 'Error creating hold' });
    }
};



const refund_hold_with_charge = async (req,res)=>{
   try {
    const {payment_id,amount_to_be_charged} = req.body;
    const payment_intent = await Payment.findById(payment_id);
    const payment_intent_id = payment_intent.payment_id;
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    // console.log(paymentIntent)

    const amount_to_be_refunded = paymentIntent.amount - amount_to_be_charged;
    await stripe.paymentIntents.capture(paymentIntent.id,{amount_to_capture:amount_to_be_charged}
    );
  


    payment_intent.amount=amount_to_be_refunded;
    payment_intent.date = new Date();
    await payment_intent.save();

    res.status(200).json("Success");
   } catch (error) {
    res.status(500).json(error)
   }
}

// function to update the exsisting amount to increase the amount 
const update_price_token = async (req, res) => {
    try {
        const { existing_payment_id, new_amount } = req.body;// the card details are also required

        // Retrieve the existing payment intent
        const existingPaymentIntent = await Payment.findById(existing_payment_id);
        const existingPaymentIntentId = existingPaymentIntent.payment_id;

        // Retrieve the existing payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(existingPaymentIntentId);

        // Calculate the total amount by combining the existing and new amounts
        const totalAmount = paymentIntent.amount + new_amount;

        // Cancels the old payment intent 
        await stripe.paymentIntents.cancel(existingPaymentIntentId);

        // Create a new PaymentIntent with the combined amount
        const updatedPaymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'usd', // Change to your desired currency
            payment_method_data: {
                type: 'card',
                card: {
                    token: 'tok_visa', // Use the test token for the card
                },
            },
            confirm: true,
            capture_method: 'manual', // Hold the funds but don't capture immediately
        });

        // Update the local payment intent with the new amount and date
        existingPaymentIntent.payment_id = updatedPaymentIntent.id;
        existingPaymentIntent.client_secret = updatedPaymentIntent.client_secret;
        existingPaymentIntent.amount = totalAmount;
        existingPaymentIntent.date = new Date();
        await existingPaymentIntent.save();

        res.status(200).json({ message: 'Payment intent updated successfully' });
    } catch (error) {
        res.status(500).json(error);
    }
};





module.exports = {
    hold_payment_on_card,
    refund_hold_with_charge,
    update_price_token
}
