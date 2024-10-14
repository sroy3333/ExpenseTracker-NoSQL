const Expense = require('../models/expense');

const getExpenses = (req, filter = {}) => {
    const userId = req.user._id;
    return Expense.find({ userId, ...filter });
}

module.exports = {
    getExpenses
}