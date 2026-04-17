const mongoose = require('mongoose');

/**
 * Settings — singleton document that stores Groq API credentials.
 * Use Settings.findOne() to retrieve the active config.
 * Use server/seedSettings.js to insert / update values.
 */
const settingsSchema = new mongoose.Schema(
  {
    groqApiKey: { type: String, required: true },
    groqModel:  { type: String, required: true, default: 'llama3-8b-8192' },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
