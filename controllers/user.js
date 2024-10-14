const User = require('../models/user'); // Assuming you have a Mongoose model for User
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function isStringInvalid(string) {
    return !string || string.trim().length === 0;
}

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password)) {
            return res.status(400).json({ err: "Bad parameters - Something is missing" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'Successfully created new user' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

const generateAccessToken = (id, name, ispremiumuser) => {
    return jwt.sign({ userId: id, name, ispremiumuser }, '98789d2f3jjdhrbfufeu3847646ujfjehffhe83');
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (isStringInvalid(email) || isStringInvalid(password)) {
            return res.status(400).json({ message: 'Email id or password is missing', success: false });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User does not exist' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (isPasswordCorrect) {
            const token = generateAccessToken(user._id, user.name, user.ispremiumuser);
            return res.status(200).json({ success: true, message: 'User logged in successfully', token });
        } else {
            return res.status(400).json({ success: false, message: 'Password is incorrect' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message, success: false });
    }
}

module.exports = {
    signup,
    login,
    generateAccessToken
};
