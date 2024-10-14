const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const downloadedFileSchema = new Schema({
    fileUrl: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    downloadedAt: { type: Date, Default: Date.now }
});

module.exports = mongoose.model('DownloadedFile', downloadedFileSchema);