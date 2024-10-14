const User = require('../models/user');

const getUserLeaderBoard = async (req, res) => {
    try {
        const leaderboardOfUsers = await User.find().sort({ totalExpenses: -1 });

        res.status(200).json(leaderboardOfUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getUserLeaderBoard
}
