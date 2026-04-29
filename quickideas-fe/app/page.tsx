"use client";
import { useState, useEffect } from "react";

interface Idea {
  id: number;
  text: string;
}

export default function Home() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5009";

  const fetchIdeas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ideas`);
      if (!res.ok) throw new Error("failed to fetch ideas");
      const data = await res.json();
      setIdeas(data);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    }
  };

  const addIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ideas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      if (res.ok) {
        const newIdea = await res.json();
        setIdeas([...ideas, newIdea]);
        setInput("");
      }
    } catch (error) {
      console.error("Error adding idea:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">💡 QuickIdeas</h1>
        <p className="text-gray-500 mb-6 text-sm">Catat ide brilianmu sebelum hilang!</p>

        <form onSubmit={addIdea} className="flex gap-2 mb-6">
          <input
            type="text"
            className="flex-grow border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ketik idemu di sini..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg transition-colors disabled:bg-blue-300"
          >
            {isLoading ? "..." : "Simpan"}
          </button>
        </form>

        <ul className="space-y-3">
          {ideas.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-8">Belum ada ide. Ayo tambahkan!</p>
          ) : (
            ideas.map((idea) => (
              <li
                key={idea.id}
                className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 shadow-sm"
              >
                {idea.text}
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  );
}