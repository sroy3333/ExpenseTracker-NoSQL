const Expense = require('../models/expense');
const User = require('../models/user');
const DownloadedFile = require('../models/downloadedFile');
const UserService = require('../services/userServices');
const S3service = require('../services/S3services');
const mongoose = require('mongoose');


const downloadexpense = async (req, res) => {
    try {
        const expenses = await UserService.getExpenses(req);
        console.log(expenses);
        const stringifiedExpenses = JSON.stringify(expenses);

        const userId = req.user._id;
        const filename = `Expenses${userId}/${new Date()}.txt`;
        const fileUrl = await S3service.uploadToS3(stringifiedExpenses, filename);

        console.log(fileUrl);
        const downloadedFile = new DownloadedFile({ fileUrl, userId: req.user._id });
        await downloadedFile.save();
        res.status(200).json({ fileUrl: downloadedFile.fileUrl, success: true });
    } catch (err) {
        res.status(500).json({ fileURl: '', success: false, err: err.message });
    }
}

const getDownloadedFiles = async (req, res) => {
    try {
        const userId = req.user._id;
        const downloadedFiles = await DownloadedFile.find({ userId }).sort({ downloadedAt: -1 });
        res.status(200).json({ downloadedFiles, success: true });
    } catch (err) {
        res.status(500).json({ success: false, err: err.message });
    }
}

const addexpense = async (req, res) => {
    const { expenseamount, description, category } = req.body;

    if (!expenseamount || !description || !category) {
        return res.status(400).json({ success: false, message: 'parameters missing' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const expense = new Expense({ expenseamount, description, category, userId: req.user._id });
        await expense.save({ session });

        const totalExpense = Number(req.user.totalExpenses) + Number(expenseamount);
        await User.updateOne(
            { _id: req.user._id },
            { $set: { totalExpenses: totalExpense } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({ expense });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

const getexpenses = async (req, res) => {
    const { page = 1, itemsPerPage = 'default' } = req.query;
    const skip = (page - 1) * itemsPerPage;
    const limit = itemsPerPage === 'default' ? null : parseInt(itemsPerPage);

    try {
        const query = { userId: req.user._id };

        const count = await Expense.countDocuments(query);
        const expenses = await Expense.find(query)
            .skip(skip)
            .limit(limit ? limit : undefined);

        res.status(200).json({ expenses, totalItems: count, success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

const deleteexpense = async (req, res) => {
    const expenseid = req.params.expenseid;
    if (!expenseid) {
        return res.status(400).json({ success: false, message: "Expense ID is missing" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const expense = await Expense.findOne({ _id: expenseid, userId: req.user._id }).session(session);
        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found or does not belong to the user" });
        }

        await expense.deleteOne({ session });

        const totalExpense = Number(req.user.totalExpenses) - Number(expense.expenseamount);
        await User.updateOne(
            { _id: req.user._id },
            { $set: { totalExpenses: totalExpense } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ success: true, message: "Expense deleted successfully" });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

module.exports = {
    addexpense,
    getexpenses,
    deleteexpense,
    downloadexpense,
    getDownloadedFiles
}