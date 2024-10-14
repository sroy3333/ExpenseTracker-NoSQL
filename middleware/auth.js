const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        console.log(token);

        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log('userID >>>>', decoded.userId);

        // Find the user by ID using Mongoose
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Authentication failed: User not found' });
        }

        // Attach the user to the request object for further use
        req.user = user;
        next();
        
    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
}

module.exports = {
    authenticate
}