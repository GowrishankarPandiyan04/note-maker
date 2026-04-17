const express = require('express');
const router  = express.Router();
const Groq    = require('groq-sdk');
const authMiddleware = require('../middleware/auth');
const Settings = require('../models/settings');

/**
 * POST /api/chat
 * Body:  { message: string, history: [{role, content}]? }
 * Auth:  Bearer JWT in Authorization header
 *
 * Fetches Groq credentials from MongoDB at runtime (never from .env / client).
 * Returns: { reply: string }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    // ── Fetch credentials from DB ──────────────────────────────────
    const settings = await Settings.findOne();
    if (!settings || !settings.groqApiKey) {
      return res.status(503).json({
        error: 'AI Assistant is not configured yet. Please run the seed script.',
      });
    }

    // ── Build message array ────────────────────────────────────────
    const systemPrompt = {
      role: 'system',
      content:
        'You are a helpful AI assistant embedded in a Notes and Subject Organizer app. ' +
        'Help users with their notes, studying, summarizing topics, and general questions. ' +
        'Keep responses concise and friendly.',
    };

    // Limit history to last 10 exchanges to control token usage
    const recentHistory = history.slice(-10);

    const messages = [
      systemPrompt,
      ...recentHistory,
      { role: 'user', content: message.trim() },
    ];

    // ── Call Groq ──────────────────────────────────────────────────
    const groq = new Groq({ apiKey: settings.groqApiKey });

    const completion = await groq.chat.completions.create({
      model:       settings.groqModel,
      messages,
      max_tokens:  1024,
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content ?? 'No response from AI.';
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Chat route error:', err?.message || err);

    // Surface Groq API errors clearly
    if (err?.status && err?.error) {
      return res.status(err.status).json({ error: err.error?.message || 'Groq API error' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
