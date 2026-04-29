const express = require('express');
const cors = require('cors');

const app = express();

// Middleware wajib
app.use(cors()); // Mengizinkan request dari frontend
app.use(express.json()); // Memparsing request body berupa JSON

// In-memory storage (Data akan reset jika server restart)
let ideas = [
  { id: 1, text: "Bikin sistem ujian pakai IRT" },
  { id: 2, text: "Deploy Next.js ke Vercel" }
];

// Endpoint 1: Health check (untuk memastikan server jalan di Railway)
app.get('/', (req, res) => {
  res.send('QuickIdeas API is running smoothly!');
});

// Endpoint 2: Mengambil semua ide
app.get('/api/ideas', (req, res) => {
  res.json(ideas);
});

// Endpoint 3: Menambahkan ide baru
app.post('/api/ideas', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: "Teks ide tidak boleh kosong" });
  }

  const newIdea = {
    id: Date.now(),
    text: text
  };
  
  ideas.push(newIdea);
  res.status(201).json(newIdea); // 201 Created
});

// Konfigurasi Port dinamis untuk Railway
const PORT = process.env.PORT || 5009;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});