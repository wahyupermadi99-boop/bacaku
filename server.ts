import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// In-memory sync store for multi-device sync
const syncStore: Record<string, { data: any; updatedAt: number }> = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // CORS Middleware for Mobile APK & Cross-Origin Requests
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Gemini client initialization
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // AI Automatic Chapter Summarizer endpoint
  app.post("/api/summarize-chapter", async (req, res) => {
    try {
      const { bookTitle, author, chapterNumber, chapterTitle, rawNotes, keyPoints } = req.body;

      const ai = getAiClient();
      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY tidak dikonfigurasi. Menggunakan ringkasan bawaan.",
        });
      }

      const prompt = `Anda adalah asisten literasi cerdas dalam aplikasi "BacaKu".
Tugas Anda adalah membuat ringkasan bab buku secara rinci, menarik, dan terstruktur dalam Bahasa Indonesia.

Informasi Buku & Bab:
- Judul Buku: ${bookTitle || "Buku Bacaan"}
- Penulis: ${author || "Tidak disebutkan"}
- Bab: ${chapterNumber ? `Bab ${chapterNumber}` : "Bab saat ini"} ${chapterTitle ? `- ${chapterTitle}` : ""}
- Catatan/Poin Poin dari Pembaca: ${rawNotes || keyPoints || "Tidak ada catatan mentah, buat ringkasan esensial umum untuk bab ini."}

Sajikan output dalam format JSON valid dengan struktur berikut:
{
  "summary": "Ringkasan bab singkat 2-3 paragraf yang mudah dipahami dan kaya wawasan.",
  "keyTakeaways": ["Poin penting 1", "Poin penting 2", "Poin penting 3"],
  "quote": "Kutipan paling inspiratif atau berkesan dari atau tentang bab ini",
  "estimatedReadingMinutes": 5
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Tidak ada respon dari model AI.");
      }

      const parsed = JSON.parse(responseText.trim());
      return res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error("Error summarizing chapter with Gemini:", error);
      return res.status(500).json({
        error: "Gagal membuat ringkasan otomatis dengan AI.",
        details: error?.message || String(error),
      });
    }
  });

  // Real-time Cloud Sync endpoint
  app.get("/api/sync/:code", (req, res) => {
    const { code } = req.params;
    const cleanCode = code.toUpperCase().trim();
    const stored = syncStore[cleanCode];
    if (!stored) {
      return res.status(404).json({ success: false, message: "Kode sync tidak ditemukan." });
    }
    return res.json({ success: true, data: stored.data, updatedAt: stored.updatedAt });
  });

  app.post("/api/sync/:code", (req, res) => {
    const { code } = req.params;
    const { payload } = req.body;
    if (!payload) {
      return res.status(400).json({ success: false, message: "Payload data kosong." });
    }
    const cleanCode = code.toUpperCase().trim();
    syncStore[cleanCode] = {
      data: payload,
      updatedAt: Date.now(),
    };
    return res.json({
      success: true,
      message: "Data berhasil tersinkronisasi ke cloud!",
      syncCode: cleanCode,
      updatedAt: syncStore[cleanCode].updatedAt,
    });
  });

  // Vite middleware or production static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BacaKu Server] Berjalan pada http://localhost:${PORT}`);
  });
}

startServer();
