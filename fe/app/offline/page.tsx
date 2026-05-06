export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
        <div className="text-6xl mb-4">📴</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Kamu sedang offline</h1>
        <p className="text-gray-500 text-sm mb-6">
          Koneksi internet tidak tersedia. Halaman utama mungkin masih bisa diakses
          dari cache browser kamu.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6">
          <p className="text-blue-700 text-sm">
            💡 <strong>Tips:</strong> Ide yang sudah dimuat sebelumnya mungkin masih
            tersedia. Kembali ke halaman utama untuk melihatnya.
          </p>
        </div>
        <a
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Kembali ke Beranda
        </a>
      </div>
    </main>
  );
}
