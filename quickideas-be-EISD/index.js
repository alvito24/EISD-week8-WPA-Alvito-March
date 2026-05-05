const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');

const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────────
// Hanya mengizinkan request dari origin yang terdaftar
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
}));

// ─── Middleware Umum ────────────────────────────────────────────────────────
app.use(express.json());

// ─── Rate Limiter ───────────────────────────────────────────────────────────
// Membatasi 20 request per menit per IP untuk endpoint /api/ideas
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak request. Coba lagi dalam 1 menit.' },
});

// ─── In-Memory Storage ──────────────────────────────────────────────────────
// CATATAN: Data akan reset jika server restart.
// Untuk production, ganti dengan database (PostgreSQL, MongoDB, dsb.)
let ideas = [
  {
    id: uuidv4(),
    text: 'Bikin sistem ujian pakai IRT',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    text: 'Deploy Next.js ke Vercel',
    createdAt: new Date().toISOString(),
  },
];

// ─── Endpoints ──────────────────────────────────────────────────────────────

// Health check — mengembalikan JSON, bukan plain text
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'QuickIdeas API is running!',
    timestamp: new Date().toISOString(),
    ideas_count: ideas.length,
  });
});

// Health check alias (standar industri)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ideas_count: ideas.length,
  });
});

// GET — Mengambil semua ide
app.get('/api/ideas', apiLimiter, (req, res) => {
  res.json(ideas);
});

// POST — Menambahkan ide baru
app.post('/api/ideas', apiLimiter, (req, res) => {
  const { text } = req.body;

  // Validasi: tidak boleh kosong atau hanya spasi
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Teks ide tidak boleh kosong.' });
  }

  // Validasi: batas panjang karakter
  if (text.trim().length > 500) {
    return res.status(400).json({ error: 'Ide terlalu panjang. Maksimal 500 karakter.' });
  }

  const newIdea = {
    id: uuidv4(),           // UUID aman dari collision
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  ideas.push(newIdea);
  res.status(201).json(newIdea);
});

// ─── Server ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5009;
app.listen(PORT, () => {
  console.log(`✅ Backend QuickIdeas running on http://localhost:${PORT}`);
});