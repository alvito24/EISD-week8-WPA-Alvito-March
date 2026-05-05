"use client";
import { useState, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Idea {
  id: string;
  text: string;
  createdAt: string;
}

// ─── Komponen Utama ─────────────────────────────────────────────────────────
export default function Home() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Install PWA state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5009";

  // ─── Fetch Ideas ──────────────────────────────────────────────────────────
  const fetchIdeas = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/ideas`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setIdeas(data);
    } catch {
      setError("Gagal memuat ide. Pastikan backend berjalan dan coba refresh halaman.");
    } finally {
      setIsFetching(false);
    }
  };

  // ─── Add Idea ─────────────────────────────────────────────────────────────
  const addIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_URL}/api/ideas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (res.ok) {
        const newIdea: Idea = await res.json();
        // Fix race condition: gunakan functional update
        setIdeas((prev) => [...prev, newIdea]);
        setInput("");
      } else {
        // Handle non-ok response (400, 429, 500, dsb.)
        const errData = await res.json().catch(() => ({}));
        setSubmitError(
          errData.error || `Gagal menyimpan ide (HTTP ${res.status}). Coba lagi.`
        );
      }
    } catch {
      setSubmitError("Koneksi ke server gagal. Pastikan kamu terhubung ke internet.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── PWA Install Prompt ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    const installedHandler = () => {
      setInstalled(true);
      setShowInstall(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  // ─── Fetch on Mount ───────────────────────────────────────────────────────
  useEffect(() => {
    fetchIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Format Timestamp ─────────────────────────────────────────────────────
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 p-8 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit">

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">💡 QuickIdeas</h1>
            <p className="text-gray-500 mt-1 text-sm">Catat ide brilianmu sebelum hilang!</p>
          </div>

          {/* Tombol Install PWA */}
          {showInstall && !installed && (
            <button
              id="btn-install-pwa"
              onClick={handleInstall}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              📲 Install App
            </button>
          )}
          {installed && (
            <span className="text-xs text-green-600 font-medium">✅ Installed!</span>
          )}
        </div>

        {/* Form Input */}
        <form onSubmit={addIdea} className="flex flex-col gap-2 mb-4 mt-6">
          <div className="flex gap-2">
            <input
              id="input-idea"
              type="text"
              className="flex-grow border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ketik idemu di sini..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (submitError) setSubmitError(null);
              }}
              disabled={isLoading}
              maxLength={500}
              aria-label="Input ide baru"
            />
            <button
              id="btn-submit-idea"
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "⏳" : "Simpan"}
            </button>
          </div>

          {/* Karakter counter */}
          {input.length > 0 && (
            <p className={`text-xs text-right ${input.length > 450 ? "text-orange-500" : "text-gray-400"}`}>
              {input.length}/500 karakter
            </p>
          )}

          {/* Error saat submit */}
          {submitError && (
            <div
              id="error-submit"
              role="alert"
              className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
            >
              <span className="text-red-500 text-sm">⚠️ {submitError}</span>
            </div>
          )}
        </form>

        {/* Error saat fetch */}
        {error && (
          <div
            id="error-fetch"
            role="alert"
            className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4"
          >
            <span className="text-red-600 text-sm">⚠️ {error}</span>
            <button
              id="btn-retry-fetch"
              onClick={fetchIdeas}
              className="text-xs text-blue-600 underline ml-3 whitespace-nowrap"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* List Ideas */}
        <ul className="space-y-3">
          {isFetching ? (
            // Skeleton loading
            <>
              {[1, 2, 3].map((i) => (
                <li key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse h-16" />
              ))}
            </>
          ) : ideas.length === 0 && !error ? (
            <p className="text-center text-gray-400 text-sm mt-8">
              Belum ada ide. Ayo tambahkan! ✨
            </p>
          ) : (
            ideas.map((idea) => (
              <li
                key={idea.id}
                className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm"
              >
                <p className="text-gray-700 text-sm leading-relaxed">{idea.text}</p>
                {idea.createdAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    🕐 {formatDate(idea.createdAt)}
                  </p>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  );
}