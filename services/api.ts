import { Platform } from "react-native";

// Gunakan localhost untuk emulator android/ios, atau ganti dengan IP mesin jika menggunakan perangkat fisik
const API_URL = Platform.select({
  ios: "http://192.168.1.92:8000",
  android: "http://192.168.1.92:8000", // IP Laptop untuk perangkat fisik
  default: "http://192.168.1.92:8000",
});

export async function fetchMediaInfo(url: string) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000); // 10 detik timeout

  try {
    const res = await fetch(`${API_URL}/info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Gagal mengambil data dari server");
    }

    return await res.json();
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error("Request timeout. Server mungkin mati.");
    }
    console.error("API ERROR:", error);
    throw error;
  }
}