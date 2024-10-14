const Razorpay = require('razorpay');
const Order = require('../models/orders');
const uuid = require('uuid');
const userController = require('../controllers/user');

const purchasepremium = async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const amount = 2500;

        rzp.orders.create({ amount, currency: 'INR' }, async (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err));
            }

            const orderId = uuid.v4();
            const newOrder = new Order({
                _id: orderId,
                orderid: order.id,
                status: 'PENDING',
                userId: req.user._id
            });

            await newOrder.save();

            res.status(201).json({ order, key_id: rzp.key_id });
        });
    } catch (err) {
        console.error(err);
        res.status(403).json({ message: 'Something went wrong', error: err.message });
    }
}

const updateTransactionStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const { payment_id, order_id } = req.body;

        const order = await Order.findOne({ orderid: order_id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const promise1 = order.updateOne({ paymentid: payment_id, status: 'SUCCESSFUL' });
        const promise2 = req.user.updateOne({ ispremiumuser: true });

        await Promise.all([promise1, promise2]);

        const token = userController.generateAccessToken(userId, undefined, true);
        res.status(202).json({ success: true, message: "Transaction Successful", token });
    } catch (err) {
        console.error(err);
        res.status(403).json({ message: 'Something went wrong', error: err.message });
    }
}

module.exports = {
    purchasepremium,
    updateTransactionStatus
}